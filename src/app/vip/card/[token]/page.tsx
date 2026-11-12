import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const dynamic="force-dynamic";
export const metadata={robots:{index:false,follow:false}};
export default async function VipCardLanding({params}:{params:{token:string}}) {
  const token=params.token;
  if(!/^[0-9a-f-]{36}$/i.test(token)) return <main className="mx-auto max-w-lg p-12 text-center text-white">Karte nicht gefunden.</main>;
  const svc=createSupabaseServiceClient();
  if(!svc) return <main className="p-12 text-white">Service nicht verfügbar.</main>;
  const {data:card}=await svc.from("vip_club_cards").select("user_id,status").eq("public_token",token).maybeSingle();
  if(!card || card.status==="blocked") return <main className="mx-auto max-w-lg p-12 text-center text-white">Karte nicht verfügbar.</main>;
  const userId=await getAuthenticatedUserId();
  if(!userId) redirect("/auth/login?next=%2Fvip");
  // Authenticated card holders should see their own VIP dashboard immediately.
  // Card association and rewards remain protected by /api/vip/me.
  redirect("/vip");
}
