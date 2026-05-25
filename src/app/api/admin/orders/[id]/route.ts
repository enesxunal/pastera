import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { OrderStatus } from "@/lib/order-types";

const VALID: OrderStatus[] = ["pending", "preparing", "ready", "delivered"];

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { status?: string };
  try {
    body = (await req.json()) as { status?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body.status || !VALID.includes(body.status as OrderStatus)) {
    return NextResponse.json({ ok: false, error: "Invalid status" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const patch: { status: string; ready_at?: string } = { status: body.status };
  if (body.status === "ready") patch.ready_at = new Date().toISOString();

  const { error } = await svc.from("orders").update(patch).eq("id", params.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
