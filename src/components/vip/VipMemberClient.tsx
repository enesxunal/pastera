"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import type { VipState } from "@/lib/vip-club-server";

type Address={id:string;label:string;street:string;city:string;postal:string|null};
const defaultState:VipState={card:null,request:null,stamps:0,redemptions:0,availableRewards:0,progress:0,remaining:10,recent:[]};
export function VipMemberClient(){
 const {user,loading}=useAuth();
 const [state,setState]=useState<VipState>(defaultState);
 const [addresses,setAddresses]=useState<Address[]>([]);
 const [method,setMethod]=useState<"pickup"|"delivery">("pickup");
 const [addressId,setAddressId]=useState("");
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [ready,setReady]=useState(false);
 const refresh=useCallback(async()=>{
   const r=await fetch("/api/vip/me",{cache:"no-store"});
   if(!r.ok){setError("VIP-Service ist noch nicht verfügbar.");return;}
   const j=await r.json();setState(j);setReady(true);
 },[]);
 useEffect(()=>{if(!user)return;void refresh();
   void fetch("/api/account/addresses").then(r=>r.json()).then(j=>setAddresses(j.addresses||[])).catch(()=>{});
   const id=setInterval(()=>void refresh(),20000);return ()=>clearInterval(id);
 },[user,refresh]);
 async function requestCard(){setBusy(true);setError("");
   const r=await fetch("/api/vip/request",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({method,addressId:method==="delivery"?addressId:null})});
   if(!r.ok){setError("Kart-Anfrage konnte nicht gespeichert werden. Bitte prüfe deine Angaben.");}else await refresh();
   setBusy(false);
 }
 const visibleProgress=state.availableRewards>0&&state.progress===0?10:state.progress;
 if(loading)return <main className="mx-auto max-w-lg p-8 text-white/60">Laden...</main>;
 if(!user)return <main className="mx-auto max-w-lg p-8 text-white"><h1 className="text-3xl font-bold">Pastera VIP Club</h1><p className="mt-4 text-white/60">Nutze dein bestehendes Pastera-Konto. Kein neues Konto nötig.</p><Link href="/auth/login?next=%2Fvip" className="mt-8 inline-block rounded-full bg-[#c49746] px-6 py-3 font-bold text-black">Anmelden</Link><Link href="/auth/register" className="ml-4 text-[#c49746] underline">Registrieren</Link></main>;
 return <main className="mx-auto max-w-2xl px-4 py-10 text-white">
   <p className="text-xs font-bold tracking-[0.3em] text-[#c49746]">PASTERA</p><h1 className="mt-2 font-display text-3xl font-bold">VIP Club</h1>
   <p className="mt-2 text-white/60">Hallo, {user.user_metadata?.full_name?.split(" ")[0]||"VIP Member"}!</p>
   <section className="mt-8 rounded-3xl border border-[#c49746]/40 bg-gradient-to-br from-[#202517] to-[#101210] p-6">
    <p className="text-xs font-bold uppercase tracking-widest text-[#c49746]">10 Bestellungen = 1 Gratis-Pasta</p>
    <div className="mt-6 flex items-baseline gap-2"><strong className="text-5xl">{visibleProgress}</strong><span className="text-white/50">/ 10</span></div>
    <div className="mt-5 grid grid-cols-5 gap-2">{Array.from({length:10},(_,i)=><span key={i} className={`flex h-12 items-center justify-center rounded-lg border ${i<visibleProgress?"border-[#c49746] bg-[#c49746] text-black":"border-white/15 text-white/40"}`}>{i<visibleProgress?"✓":i+1}</span>)}</div>
    {state.availableRewards>0?<div role="status" className="mt-6 rounded-2xl border-2 border-[#c49746] bg-[#c49746]/15 px-5 py-6 text-center">
      <p className="font-display text-2xl font-bold text-[#f4d990]">Herzlichen Glückwunsch!</p>
      <p className="mt-2 text-lg font-semibold">Du hast eine Gratis-Pasta verdient!</p>
      <p className="mt-3 text-sm text-white/65">Verfügbare Gratis-Pasta: {state.availableRewards} · Zeige deine VIP-Karte an der Kasse.</p>
    </div>:<p className="mt-4 font-semibold">Noch {state.remaining} Bestellungen bis zur Gratis-Pasta.</p>}
    <p className="mt-2 text-xs text-white/45">Gezählte Bestellungen: {state.stamps} · Eingelöste Prämien: {state.redemptions}</p>
    {state.card&&<p className="mt-3 text-xs text-[#c49746]">Deine Karte: {state.card.card_number}</p>}
   </section>
   {!state.card&&ready&&<section className="mt-8 rounded-2xl border border-white/10 p-5"><h2 className="text-xl font-bold">Kostenlose VIP-Karte sichern</h2>
    {state.request&&state.request.status!=="cancelled"?<p className="mt-4 text-[#c49746]">Deine Anfrage ist eingegangen: {state.request.status=== "fulfilled"?"Abgeschlossen":"In Bearbeitung"} ({state.request.delivery_method==="pickup"?"Abholung":"Lieferung"}).</p>:<>
     <div className="mt-5 flex gap-3"><button onClick={()=>setMethod("pickup")} className={`rounded-lg border px-4 py-2 ${method==="pickup"?"border-[#c49746] text-[#c49746]":"border-white/20"}`}>Kostenlos abholen</button><button onClick={()=>setMethod("delivery")} className={`rounded-lg border px-4 py-2 ${method==="delivery"?"border-[#c49746] text-[#c49746]":"border-white/20"}`}>Kostenlos liefern</button></div>
     {method==="delivery"&&<div className="mt-4"><label className="block text-sm text-white/60" htmlFor="vip-address">Lieferadresse</label><select id="vip-address" className="mt-2 w-full rounded-lg border border-white/20 bg-[#111] p-3" value={addressId} onChange={e=>setAddressId(e.target.value)}><option value="">Adresse wählen</option>{addresses.map(a=><option key={a.id} value={a.id}>{a.label}: {a.street}, {a.postal} {a.city}</option>)}</select><Link className="mt-2 block text-sm text-[#c49746] underline" href="/auth/account">Adressen im Konto verwalten</Link></div>}
     <button disabled={busy||(method==="delivery"&&!addressId)} onClick={()=>void requestCard()} className="mt-5 rounded-full bg-[#c49746] px-6 py-3 font-bold text-black disabled:opacity-50">VIP-Karte kostenlos anfragen</button>
     <p className="mt-3 text-xs text-white/45">Kostenlose Lieferung im verfügbaren Liefergebiet; Bestätigung durch Pastera erforderlich.</p>
    </>}
   </section>}
   {error&&<p role="alert" className="mt-5 text-red-300">{error}</p>}
   {state.recent.length>0&&<section className="mt-8"><h2 className="text-xl font-bold">Deine Aktivitäten</h2><ul className="mt-3 space-y-2">{state.recent.map(e=><li key={e.id} className="flex justify-between rounded-lg border border-white/10 px-4 py-3 text-sm"><span>{e.delta===1?"Bestellung gezählt":"Korrektur"}</span><span className="text-[#c49746]">{e.delta>0?"+1":"−1"} · {new Date(e.created_at).toLocaleDateString("de-DE")}</span></li>)}</ul></section>}
   <Link className="mt-8 inline-block text-sm text-[#c49746] underline" href="/auth/account">Zurück zu meinem Konto</Link>
 </main>;
}
