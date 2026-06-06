import { getAuthenticatedUserId } from "@/lib/auth-server";
import { upsertCustomerAddress } from "@/lib/customer-addresses";
import { allocateBranchDisplayNumber } from "@/lib/allocate-branch-display-number";
import { getBranchById } from "@/lib/branches-server";
import { findNearestDeliveringBranch } from "@/lib/nearest-branch";
import { haversineKm, roundKm } from "@/lib/geo";
import type { OrderType } from "@/lib/order-types";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type SubmitOrderPayload = {
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
  paypalOrderId?: string | null;
  delivery?: {
    street?: string;
    city?: string;
    postal?: string;
    lat?: number;
    lng?: number;
    distanceKm?: number;
  } | null;
};

export type SubmitOrderResult =
  | {
      ok: true;
      orderId: string;
      orderShortId: string;
      displayNumber: number | null;
      createdAt: string;
    }
  | {
      ok: false;
      error: string;
      distanceKm?: number;
      maxKm?: number;
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

export async function submitOrder(body: SubmitOrderPayload): Promise<SubmitOrderResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "database_unavailable" };
  }

  if (typeof body.total !== "number" || !Array.isArray(body.lines)) {
    return { ok: false, error: "Invalid payload" };
  }

  const tableNumber = body.tableNumber?.trim() || null;
  const orderType: OrderType =
    body.orderType ?? (tableNumber ? "dine_in" : body.delivery ? "delivery" : "web");
  const d = body.delivery;

  if (orderType === "web") {
    return { ok: false, error: "delivery_required" };
  }

  let branchId = await resolveBranchId(body.branchId, body.branchSlug);
  let distanceKm = d?.distanceKm ?? null;

  if (orderType === "delivery") {
    if (!d?.lat || !d?.lng || !d.street || !d.city) {
      return { ok: false, error: "delivery_invalid" };
    }

    if (!branchId) {
      const nearest = await findNearestDeliveringBranch(d.lat, d.lng);
      if (!nearest) return { ok: false, error: "out_of_range" };
      branchId = nearest.branch.id;
      distanceKm = nearest.distanceKm;
    } else {
      const branch = await getBranchById(branchId);
      if (!branch?.lat || branch.lng == null) {
        return { ok: false, error: "branch_no_location" };
      }
      const dist = roundKm(haversineKm(branch.lat, branch.lng, d.lat, d.lng));
      const maxKm = Number(branch.radius_km) || 5;
      if (dist > maxKm) {
        const nearest = await findNearestDeliveringBranch(d.lat, d.lng);
        if (nearest) {
          branchId = nearest.branch.id;
          distanceKm = nearest.distanceKm;
        } else {
          return { ok: false, error: "out_of_range", distanceKm: dist, maxKm };
        }
      } else {
        distanceKm = dist;
      }
    }
  }

  if ((orderType === "delivery" || orderType === "dine_in" || orderType === "pickup") && !branchId) {
    return { ok: false, error: "branch_required" };
  }

  const paymentType =
    body.paymentType === "online"
      ? "online"
      : body.paymentType === "card"
        ? "card"
        : "cash";

  const userId = await getAuthenticatedUserId();
  const svc = createSupabaseServiceClient();
  if (!svc) return { ok: false, error: "database_unavailable" };

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

  const itemsPayload: Record<string, unknown> = {
    lines: body.lines,
    cart: body.cart,
  };
  if (body.paypalOrderId) itemsPayload.paypalOrderId = body.paypalOrderId;

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
      items: itemsPayload,
    })
    .select("id, display_number, created_at")
    .single();

  if (error) return { ok: false, error: error.message };

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
        : "";

  if (!data?.id || !orderShortId) return { ok: false, error: "checkout_failed" };

  return {
    ok: true,
    orderId: data.id,
    orderShortId,
    displayNumber: data.display_number ?? null,
    createdAt: data.created_at,
  };
}
