import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

const READY_MAX_AGE_MS = 10 * 60 * 1000;
const READY_LIMIT = 10;

export async function GET() {
  const lobbyOk = cookies().get("pastera_lobby")?.value === "1";
  const branchId = cookies().get("pastera_lobby_branch_id")?.value;
  if (!lobbyOk || !branchId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) {
    return NextResponse.json({ ok: true, preparing: [], ready: [] });
  }

  const since = new Date(Date.now() - READY_MAX_AGE_MS).toISOString();

  const [prepRes, readyRes] = await Promise.all([
    svc
      .from("orders")
      .select("id, status, order_type, table_number, display_number, created_at, ready_at")
      .eq("branch_id", branchId)
      .in("order_type", ["dine_in", "pickup"])
      .in("status", ["pending", "preparing"])
      .order("created_at", { ascending: true }),
    svc
      .from("orders")
      .select("id, status, order_type, table_number, display_number, created_at, ready_at")
      .eq("branch_id", branchId)
      .in("order_type", ["dine_in", "pickup"])
      .eq("status", "ready")
      .or(`ready_at.gte.${since},and(ready_at.is.null,created_at.gte.${since})`)
      .order("ready_at", { ascending: false, nullsFirst: false })
      .limit(READY_LIMIT),
  ]);

  if (prepRes.error) {
    return NextResponse.json({ ok: false, error: prepRes.error.message }, { status: 500 });
  }
  if (readyRes.error) {
    return NextResponse.json({ ok: false, error: readyRes.error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    preparing: prepRes.data ?? [],
    ready: readyRes.data ?? [],
  });
}
