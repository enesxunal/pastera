import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBranchById } from "@/lib/branches-server";
import {
  computeBranchStats,
  dailyRevenueBreakdown,
  last7DaysRevenue,
  type OrderForStats,
} from "@/lib/order-stats";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const branchId = cookies().get("pastera_branch_id")?.value;
  if (!branchId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const branch = await getBranchById(branchId);
  if (!branch) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) {
    return NextResponse.json({ ok: false, error: "database_unavailable" }, { status: 503 });
  }

  const since = new Date();
  since.setMonth(since.getMonth() - 2);

  const { data: orders, error } = await svc
    .from("orders")
    .select("id, branch_id, total_amount, status, order_type, created_at")
    .eq("branch_id", branchId)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const list = (orders ?? []) as OrderForStats[];
  const stats = computeBranchStats(list, branch);
  const chart = last7DaysRevenue(list, branchId);
  const daily = dailyRevenueBreakdown(list, 14, branchId);

  return NextResponse.json({ ok: true, stats, chart, daily, branchName: branch.name });
}
