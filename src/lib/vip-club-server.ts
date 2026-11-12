import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type VipState = {
  card: { card_number: string; status: string } | null;
  request: { delivery_method: string; status: string } | null;
  stamps: number;
  redemptions: number;
  availableRewards: number;
  progress: number;
  remaining: number;
  recent: { id: string; delta: number; created_at: string }[];
};

export async function getVipState(userId: string): Promise<VipState> {
  const svc = createSupabaseServiceClient();
  if (!svc) throw new Error("vip_service_not_configured");
  const [cards, requests, summaries, events] = await Promise.all([
    svc.from("vip_club_cards").select("card_number,status").eq("user_id", userId).eq("status", "active").maybeSingle(),
    svc.from("vip_club_requests").select("delivery_method,status").eq("user_id", userId).maybeSingle(),
    svc.rpc("vip_club_summary", { p_user_id: userId }),
    svc.from("vip_club_scans").select("id,delta,created_at").eq("user_id",userId).order("created_at",{ascending:false}).limit(12),
  ]);
  for (const r of [cards, requests, summaries, events]) if (r.error) throw new Error(r.error.message);
  const s = summaries.data?.[0];
  return {
    card: cards.data || null,
    request: requests.data || null,
    stamps: Number(s?.stamps || 0),
    redemptions: Number(s?.redemptions || 0),
    availableRewards: Number(s?.available_rewards || 0),
    progress: Number(s?.progress || 0),
    remaining: Number(s?.remaining ?? 10),
    recent: (events.data || []).map(e=>({id:e.id,delta:Number(e.delta),created_at:e.created_at})),
  };
}
