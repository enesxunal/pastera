import { NextResponse, type NextRequest } from "next/server";
import { patchOrderStatus } from "@/lib/order-status-server";
import type { OrderStatus } from "@/lib/order-types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

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

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const result = await patchOrderStatus(svc, params.id, body.status as OrderStatus);
  if (!result.ok) {
    const status = result.error === "Not found" ? 404 : result.error === "Invalid status" ? 400 : 500;
    return NextResponse.json({ ok: false, error: result.error }, { status });
  }

  return NextResponse.json({ ok: true });
}
