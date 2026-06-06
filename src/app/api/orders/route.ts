import { NextResponse } from "next/server";
import { submitOrder, type SubmitOrderPayload } from "@/lib/submit-order";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: SubmitOrderPayload;
  try {
    body = (await request.json()) as SubmitOrderPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const result = await submitOrder(body);
  if (!result.ok) {
    const status =
      result.error === "out_of_range"
        ? 400
        : result.error === "delivery_required" || result.error === "delivery_invalid"
          ? 400
          : result.error === "branch_required" || result.error === "branch_no_location"
            ? 400
            : 500;
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        ...(result.distanceKm != null ? { distanceKm: result.distanceKm } : {}),
        ...(result.maxKm != null ? { maxKm: result.maxKm } : {}),
      },
      { status },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      orderId: result.orderId,
      orderShortId: result.orderShortId,
      displayNumber: result.displayNumber,
      createdAt: result.createdAt,
    },
    { status: 201 },
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branchId = searchParams.get("branchId");
  const displayKey = searchParams.get("displayKey");
  const { cookies } = await import("next/headers");
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

  const { createSupabaseServiceClient } = await import("@/lib/supabase/service");
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
