import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { patchOrderStatus } from "@/lib/order-status-server";
import type { OrderStatus } from "@/lib/order-types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const branchCookie = cookies().get("pastera_branch_id")?.value;
  if (!branchCookie) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) {
    return NextResponse.json({ ok: false, error: "No database" }, { status: 503 });
  }

  const result = await patchOrderStatus(
    svc,
    params.id,
    body.status as OrderStatus,
    { branchIdFilter: branchCookie },
  );

  if (!result.ok) {
    const status = result.error === "Not found" ? 404 : result.error === "Invalid status" ? 400 : 500;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
