import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { computeGlobalStats, last7DaysRevenue, type OrderForStats } from "@/lib/order-stats";
import { listActiveBranches } from "@/lib/branches-server";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: orders, error } = await svc
    .from("orders")
    .select("id, branch_id, total_amount, status, order_type, created_at")
    .gte("created_at", new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1).toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const branches = await listActiveBranches();
  const list = (orders ?? []) as OrderForStats[];
  const { count: memberCount } = await svc
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const stats = computeGlobalStats(list, branches);
  const chart = last7DaysRevenue(list);

  return NextResponse.json({
    ok: true,
    stats,
    chart,
    memberCount: memberCount ?? 0,
  });
}
