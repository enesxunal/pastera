"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import type { VipState } from "@/lib/vip-club-server";

type Member={id:string;full_name:string|null;email:string|null};
type Card={id:string;card_number:string;uid_hex:string|null;public_token:string;user_id:string|null;status:string;member:Member|null};
type Request={id:string;user_id:string;delivery_method:string;status:string;member:Member|null};
type Scan={id:string;card_id:string;user_id:string;delta:number;operator_label:string;created_at:string;reversed_scan_id:string|null;card_number:string|null;member:Member|null};
type Data={cards:Card[];members:Member[];requests:Request[];history:Scan[]};
export function AdminVipClient(){
 const router=useRouter();
 const [data,setData]=useState<Data>({cards:[],members:[],requests:[],history:[]});
 const [cardId,setCardId]=useState("");const [userId,setUserId]=useState("");const [uid,setUid]=useState("");
 const [search,setSearch]=useState("");const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 const [vip,setVip]=useState<VipState|null>(null);
 const load=useCallback(async()=>{
  const res=await fetch("/api/admin/vip",{cache:"no-store"});
  if(res.status===401){router.replace("/admin/login");return;}
  if(!res.ok){setMessage("VIP Datenbankmigration fehlt oder Datenbank ist nicht erreichbar.");return;}
  const j=await res.json() as Data;setData(j);
 },[router]);
 useEffect(()=>{void load();const i=setInterval(()=>void load(),8000);return()=>clearInterval(i)},[load]);
 useEffect(()=>{if(!userId){setVip(null);return;}void fetch(`/api/admin/vip/summary?userId=${encodeURIComponent(userId)}`,{cache:"no-store"}).then(r=>r.json()).then(j=>j.ok?setVip(j):setVip(null)).catch(()=>setVip(null));},[userId,data.history]);
 const members=useMemo(()=>data.members.filter(m=>[m.full_name,m.email].some(v=>v?.toLowerCase().includes(search.toLowerCase()))).slice(0,80),[data.members,search]);
 async function perform(url:string,body:object,success:string){
  setBusy(true);setMessage("");
  try{const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
   const j=await r.json();setMessage(r.ok?success:`Fehler: ${j.error||r.status}`);if(r.ok){await load();if(userId){const summary=await fetch(`/api/admin/vip/summary?userId=${encodeURIComponent(userId)}`);const s=await summary.json();if(s.ok)setVip(s);}}
  }catch{setMessage("Netzwerkfehler");}finally{setBusy(false);}
 }
 const unassigned=data.cards.filter(x=>x.status==="unassigned");
 const active=data.cards.filter(x=>x.status==="active");
 const pending=data.requests.filter(x=>x.status!=="fulfilled"&&x.status!=="cancelled");
 return <main className="mx-auto max-w-6xl px-4 py-10 text-white sm:px-6">
  <AdminNav/><h1 className="font-display text-3xl font-bold">Pastera VIP Club</h1>
  <p className="mt-2 text-sm text-white/50">NFC Kundenkarten · Pro separatem Auflegen +1 Bestellung · 10 Bestellungen = 1 Gratis-Pasta</p>
  <a href="/admin/vip/pos" className="mt-4 inline-flex rounded-full border border-[#c49746] px-5 py-3 font-semibold text-[#c49746] hover:bg-[#c49746]/10">NFC-Kassenbildschirm öffnen</a>
  <div className="mt-6 grid gap-3 sm:grid-cols-3">{[["Karten insgesamt",data.cards.length],["Aktiv",active.length],["Noch frei",unassigned.length]].map(([label,value])=><div key={String(label)} className="rounded-xl border border-[#2e402a] bg-[#111] p-5"><p className="text-xs text-white/50">{label}</p><p className="mt-2 text-3xl font-bold text-[#c49746]">{value}</p></div>)}</div>
  {message&&<p role="status" className="mt-5 rounded-lg border border-[#c49746]/30 p-3 text-sm text-[#c49746]">{message}</p>}
  <section className="mt-9 grid gap-8 lg:grid-cols-2">
   <div className="rounded-2xl border border-[#2e402a] p-5"><h2 className="text-xl font-bold">Karte einem Kunden zuordnen</h2>
    <p className="mt-2 text-xs text-white/50">NFC UID mit dem angeschlossenen Lesegerät ermitteln, dann Karte und bestehenden Kunden wählen.</p>
    <label className="mt-4 block text-sm text-white/60">Freie Karte<select className="mt-2 w-full rounded-lg border border-white/20 bg-[#111] p-3" value={cardId} onChange={e=>setCardId(e.target.value)}><option value="">Karte wählen</option>{unassigned.map(c=><option value={c.id} key={c.id}>{c.card_number}</option>)}</select></label>
    <label className="mt-4 block text-sm text-white/60">Kunde suchen<input className="mt-2 w-full rounded-lg border border-white/20 bg-[#111] p-3" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name oder E-Mail"/></label>
    <label className="mt-4 block text-sm text-white/60">Bestehendes Kundenkonto<select className="mt-2 w-full rounded-lg border border-white/20 bg-[#111] p-3" value={userId} onChange={e=>setUserId(e.target.value)}><option value="">Kunde wählen</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name||m.email} {m.email&&m.full_name?`(${m.email})`:""}</option>)}</select></label>
    <label className="mt-4 block text-sm text-white/60">NFC UID (Hex)<input className="mt-2 w-full rounded-lg border border-white/20 bg-[#111] p-3 font-mono" placeholder="04976C8A1E6180" value={uid} onChange={e=>setUid(e.target.value)} autoComplete="off"/></label>
    <button disabled={busy||!cardId||!userId||!/^[0-9a-f\s]{8,30}$/i.test(uid)} onClick={()=>void perform("/api/admin/vip",{action:"assign",cardId,userId,uid},"VIP-Karte zugeordnet.")} className="mt-5 rounded-full bg-[#c49746] px-5 py-3 font-bold text-black disabled:opacity-40">Karte zuordnen</button>
   </div>
   <div className="rounded-2xl border border-[#2e402a] p-5"><h2 className="text-xl font-bold">Kunde & Gratis-Pasta</h2><p className="mt-2 text-xs text-white/50">Wähle links einen Kunden, um seinen VIP-Stand zu prüfen.</p>
     {userId&&vip?<div className="mt-5 space-y-2"><p className="text-3xl font-bold">{vip.progress} / 10</p><p>Gezählte Bestellungen: {vip.stamps}</p><p>Eingelöste Gratis-Pasta: {vip.redemptions}</p><p className="font-bold text-[#c49746]">Verfügbare Gratis-Pasta: {vip.availableRewards}</p>
     <button disabled={busy||vip.availableRewards<1} className="mt-3 rounded-full border border-[#c49746] px-5 py-3 text-[#c49746] disabled:opacity-40" onClick={()=>{if(confirm("1 Gratis-Pasta jetzt als eingelöst markieren?"))void perform("/api/admin/vip/redeem",{userId},"Gratis-Pasta eingelöst.")}}>Gratis-Pasta einlösen</button></div>:<p className="mt-5 text-sm text-white/50">Noch kein Kunde ausgewählt.</p>}
   </div>
  </section>
  <section className="mt-10"><h2 className="text-xl font-bold">Kartenanfragen ({pending.length})</h2><div className="mt-4 space-y-2">{pending.slice(0,30).map(r=><div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3 text-sm"><span>{r.member?.full_name||r.member?.email||"Kunde"} · {r.delivery_method==="pickup"?"Abholung":"Lieferung"} · {r.status}</span><button disabled={busy} onClick={()=>void perform("/api/admin/vip",{action:"fulfil",requestId:r.id},"Anfrage abgeschlossen.")} className="rounded-full border border-white/30 px-4 py-2 hover:text-[#c49746]">Nach Kartenausgabe abschließen</button></div>)}{!pending.length&&<p className="text-sm text-white/40">Keine offenen Anfragen.</p>}</div></section>
  <section className="mt-10"><h2 className="text-xl font-bold">Letzte NFC-Scans & Korrekturen</h2><div className="mt-4 space-y-2">{data.history.map(e=><div key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 p-3 text-sm"><span>{e.card_number} · {e.member?.full_name||e.member?.email||"Kunde"} · {e.delta===1?"+1 Bestellung":"−1 Korrektur"}</span><span className="text-white/45">{new Date(e.created_at).toLocaleString("de-DE")}</span>{e.delta===1&&!data.history.some(x=>x.reversed_scan_id===e.id)&&<button disabled={busy} className="rounded-full border border-red-300/40 px-3 py-1.5 text-red-200" onClick={()=>{if(confirm("Diesen Scan rückgängig machen?"))void perform("/api/admin/vip/undo",{scanId:e.id},"Scan korrigiert.")}}>−1 korrigieren</button>}</div>)}{!data.history.length&&<p className="text-sm text-white/40">Noch keine Scans.</p>}</div></section>
  <section className="mt-10"><h2 className="text-xl font-bold">Aktive Karten ({active.length})</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{active.map(c=><div key={c.id} className="rounded-xl border border-white/10 p-4"><p className="font-bold text-[#c49746]">{c.card_number}</p><p className="mt-1 text-sm">{c.member?.full_name||c.member?.email}</p><p className="mt-1 font-mono text-xs text-white/40">UID: {c.uid_hex}</p><a href={`/vip/card/${c.public_token}`} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs text-[#c49746] underline">NFC URL öffnen</a><button disabled={busy} onClick={()=>{if(confirm("Karte sperren? Guthaben bleibt beim Kundenkonto."))void perform("/api/admin/vip",{action:"block",cardId:c.id},"Karte gesperrt.")}} className="mt-3 text-xs text-red-300 underline">Karte sperren</button></div>)}</div></section>
 </main>;
}
