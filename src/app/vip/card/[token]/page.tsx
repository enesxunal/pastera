import { redirect } from "next/navigation";
import Link from "next/link";
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
  if(!userId) redirect(`/auth/login?next=${encodeURIComponent(`/vip/card/${token}`)}`);
  if(card.user_id===userId && card.status==="active") redirect("/vip");
  return <main className="mx-auto max-w-lg px-5 py-20 text-center text-white">
    <h1 className="font-display text-3xl font-bold">PASTERA VIP Club</h1>
    <p className="mt-5 text-white/60">Diese Karte ist nicht mit deinem Konto verbunden. Deine persönlichen Daten bleiben geschützt.</p>
    <Link className="mt-7 inline-block rounded-full bg-[#c49746] px-7 py-3 font-bold text-black" href="/vip">Zu meinem VIP-Bereich</Link>
  </main>;
}
