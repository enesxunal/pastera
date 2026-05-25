import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { upsertCustomerAddress } from "@/lib/customer-addresses";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getBranchById } from "@/lib/branches-server";
import { findNearestDeliveringBranch } from "@/lib/nearest-branch";
import { haversineKm, roundKm } from "@/lib/geo";
import type { OrderType } from "@/lib/order-types";
import { allocateBranchDisplayNumber } from "@/lib/allocate-branch-display-number";

type OrderPayload = {
  total: number;
  lines: { label: string; amount: number }[];
  cart: unknown;
  branchId?: string | null;
  branchSlug?: string | null;
  orderType?: OrderType;
  tableNumber?: string | null;
  paymentType?: "online" | "cash" | "card";
  customerName?: string | null;
  customerPhone?: string | null;
  delivery?: {
    street?: string;
    city?: string;
    postal?: string;
    lat?: number;
    lng?: number;
    distanceKm?: number;
  } | null;
};

async function resolveBranchId(
  branchId?: string | null,
  branchSlug?: string | null,
): Promise<string | null> {
  if (branchId) return branchId;
  if (!branchSlug || !isSupabaseConfigured()) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("branches")
    .select("id")
    .eq("slug", branchSlug)
    .eq("is_active", true)
    .maybeSingle();
  return data?.id ?? null;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
  }

  let body: OrderPayload;
  try {
    body = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.total !== "number" || !Array.isArray(body.lines)) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const tableNumber = body.tableNumber?.trim() || null;
  const orderType: OrderType =
    body.orderType ?? (tableNumber ? "dine_in" : body.delivery ? "delivery" : "web");
  const d = body.delivery;

  if (orderType === "web") {
    return NextResponse.json(
      { ok: false, error: "delivery_required", message: "Adres gerekli — önce teslimat bilgisi girin." },
      { status: 400 },
    );
  }

  let branchId = await resolveBranchId(body.branchId, body.branchSlug);
  let distanceKm = d?.distanceKm ?? null;

  if (orderType === "delivery") {
    if (!d?.lat || !d?.lng || !d.street || !d.city) {
      return NextResponse.json({ ok: false, error: "delivery_invalid" }, { status: 400 });
    }

    if (!branchId) {
      const nearest = await findNearestDeliveringBranch(d.lat, d.lng);
      if (!nearest) {
        return NextResponse.json({ ok: false, error: "out_of_range" }, { status: 400 });
      }
      branchId = nearest.branch.id;
      distanceKm = nearest.distanceKm;
    } else {
      const branch = await getBranchById(branchId);
      if (!branch?.lat || branch.lng == null) {
        return NextResponse.json({ ok: false, error: "branch_no_location" }, { status: 503 });
      }
      const dist = roundKm(haversineKm(branch.lat, branch.lng, d.lat, d.lng));
      const maxKm = Number(branch.radius_km) || 5;
      if (dist > maxKm) {
        const nearest = await findNearestDeliveringBranch(d.lat, d.lng);
        if (nearest) {
          branchId = nearest.branch.id;
          distanceKm = nearest.distanceKm;
        } else {
          return NextResponse.json(
            { ok: false, error: "out_of_range", distanceKm: dist, maxKm },
            { status: 400 },
          );
        }
      } else {
        distanceKm = dist;
      }
    }
  }

  if ((orderType === "delivery" || orderType === "dine_in" || orderType === "pickup") && !branchId) {
    return NextResponse.json({ ok: false, error: "branch_required" }, { status: 400 });
  }

  const paymentType =
    body.paymentType === "card" || body.paymentType === "online" ? "card" : "cash";

  const userId = await getAuthenticatedUserId();
  const svc = createSupabaseServiceClient();
  if (!svc) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
  }

  try {
    if (userId) {
      const authClient = createSupabaseServerClient();
      const { data: authData } = await authClient.auth.getUser();
      const email = authData.user?.email ?? null;
      const fullName = String(authData.user?.user_metadata?.full_name ?? "");
      const phone = body.customerPhone?.trim() || null;
      await svc.from("profiles").upsert(
        {
          id: userId,
          email,
          full_name: fullName || null,
          role: "customer",
          ...(phone ? { phone } : {}),
        },
        { onConflict: "id" },
      );
    }

    const displayNumber = branchId ? await allocateBranchDisplayNumber(svc, branchId) : null;

    const { data, error } = await svc
      .from("orders")
      .insert({
        user_id: userId,
        branch_id: branchId,
        display_number: displayNumber,
        total_amount: body.total,
        discount_applied: 0,
        status: "pending",
        payment_type: paymentType,
        order_type: orderType,
        table_number: tableNumber,
        customer_name: body.customerName?.trim() || null,
        customer_phone: body.customerPhone?.trim() || null,
        delivery_street: d?.street?.trim() || null,
        delivery_city: d?.city?.trim() || null,
        delivery_postal: d?.postal?.trim() || null,
        delivery_lat: d?.lat ?? null,
        delivery_lng: d?.lng ?? null,
        delivery_distance_km: distanceKm,
        items: { lines: body.lines, cart: body.cart },
      })
      .select("id, display_number, created_at")
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (userId && orderType === "delivery" && d?.street && d?.city) {
      await upsertCustomerAddress(userId, {
        street: d.street,
        city: d.city,
        postal: d.postal,
        lat: d.lat,
        lng: d.lng,
        isDefault: true,
      }).catch(() => {});
    }

    const orderShortId =
      data?.display_number != null
        ? String(data.display_number)
        : data?.id
          ? String(data.id).slice(0, 8).toUpperCase()
          : undefined;

    return NextResponse.json(
      {
        ok: true,
        orderId: data?.id,
        orderShortId,
        displayNumber: data?.display_number ?? null,
        createdAt: data?.created_at,
      },
      { status: 201 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId");
  const displayKey = searchParams.get("displayKey");
  const branchCookie = cookies().get("pastera_branch_id")?.value;
  const displayBranchCookie = cookies().get("pastera_display_branch_id")?.value;
  const displayOk = cookies().get("pastera_display")?.value === "1";

  const envDisplay = process.env.DISPLAY_ACCESS_KEY;
  const envBranch = process.env.BRANCH_PANEL_BRANCH_ID;

  let allowedBranchId: string | null = null;

  if (branchCookie) {
    allowedBranchId = branchCookie;
  } else if (displayOk && displayBranchCookie) {
    allowedBranchId = displayBranchCookie;
  } else if (displayKey && envDisplay && displayKey === envDisplay && branchId) {
    allowedBranchId = branchId;
  } else if (branchId && envBranch && branchId === envBranch) {
    allowedBranchId = branchId;
  }

  if (!allowedBranchId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) {
    return NextResponse.json({ ok: true, orders: [] });
  }

  const activeOnly = searchParams.get("active") === "1";
  const allOrders = searchParams.get("all") === "1";
  let q = svc
    .from("orders")
    .select("*")
    .eq("branch_id", allowedBranchId)
    .order("created_at", { ascending: false })
    .limit(allOrders ? 250 : 80);

  if (activeOnly) {
    q = q.in("status", ["pending", "preparing", "ready"]);
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orders: data ?? [] });
}
