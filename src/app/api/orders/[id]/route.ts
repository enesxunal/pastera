import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { OrderStatus } from "@/lib/order-types";

const VALID: OrderStatus[] = ["pending", "preparing", "ready", "delivered"];

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

  if (!body.status || !VALID.includes(body.status as OrderStatus)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) {
    return NextResponse.json({ ok: false, error: "No database" }, { status: 503 });
  }

  const { data: existing } = await svc
    .from("orders")
    .select("branch_id")
    .eq("id", params.id)
    .maybeSingle();

  if (!existing || existing.branch_id !== branchCookie) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const patch: { status: string; ready_at?: string } = { status: body.status };
  if (body.status === "ready") {
    patch.ready_at = new Date().toISOString();
  }

  const { error } = await svc.from("orders").update(patch).eq("id", params.id);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
