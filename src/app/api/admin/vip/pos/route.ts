import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getVipState } from "@/lib/vip-club-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: scans, error } = await svc
    .from("vip_club_scans")
    .select("id,card_id,user_id,delta,operator_label,created_at")
     .order("created_at", { ascending: false })
    .limit(30);
  if (error) return NextResponse.json({ ok: false, error: "scan_lookup_failed" }, { status: 503 });
  if (!scans?.length) return NextResponse.json({ ok: true, latest: null }, { headers: { "Cache-Control": "no-store" } });

  const scan = scans[0];
  const [cardRes, profileRes, state] = await Promise.all([
    svc.from("vip_club_cards").select("card_number").eq("id", scan.card_id).maybeSingle(),
    svc.from("profiles").select("full_name").eq("id", scan.user_id).maybeSingle(),
    getVipState(scan.user_id),
  ]);
  if (cardRes.error || profileRes.error) return NextResponse.json({ ok: false, error: "member_lookup_failed" }, { status: 503 });

  return NextResponse.json({
    ok: true,
    latest: {
      id: scan.id,
      createdAt: scan.created_at,
      delta: scan.delta,
      isSimulation: scan.operator_label === "QA-SIMULATION",
      cardNumber: cardRes.data?.card_number ?? "VIP",
      memberName: profileRes.data?.full_name || "VIP Member",
      stamps: state.stamps,
      progress: state.progress,
      remaining: state.remaining,
      availableRewards: state.availableRewards,
      redemptions: state.redemptions,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
