import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import type { OrderRow } from "@/lib/order-types";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: true, orders: [] });

  const branchId = req.nextUrl.searchParams.get("branchId");
  let q = svc
    .from("orders")
    .select("*, branches(name, slug)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (branchId) q = q.eq("branch_id", branchId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, orders: (data ?? []) as (OrderRow & { branches?: { name: string; slug: string } | null })[] });
}
