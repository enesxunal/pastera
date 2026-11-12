import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
process.loadEnvFile(".env.local");
const email = process.env.VIP_TEST_EMAIL;
const uid = process.env.VIP_TEST_UID;
if (!email || !uid) throw Error("VIP_TEST_EMAIL and VIP_TEST_UID required");
const base = process.env.VIP_TEST_BASE || "http://localhost:3344";
if (process.env.VIP_TEST_ALLOW_LIVE_WRITES !== "I_ACKNOWLEDGE") throw Error("Explicit VIP_TEST_ALLOW_LIVE_WRITES=I_ACKNOWLEDGE required");
if (!base.startsWith("http://localhost:") && !base.startsWith("http://127.0.0.1:")) throw Error("Only localhost tests supported");
let cookie = "";
let testCard = null;
let userId = null;
const created = [];
const undone = new Set();
async function api(path, method="GET", data) {
  const r = await fetch(base+path, {method, headers: {"content-type":"application/json",...(cookie?{cookie}:{})}, body:data?JSON.stringify(data):undefined});
  const j = await r.json().catch(()=>({}));
  return {status:r.status, data:j, headers:r.headers};
}
async function undo(id) {
  const r=await api("/api/admin/vip/undo","POST",{scanId:id});
  if(r.status===200 && r.data.ok) {undone.add(id);return true;}
  return false;
}
async function summary() {
  const r=await api("/api/admin/vip/summary?userId="+encodeURIComponent(userId));
  assert.equal(r.status,200,JSON.stringify(r.data));return r.data;
}
try {
  let r=await api("/api/admin/vip/scan","POST",{uid,eventId:randomUUID(),simulation:true});
  assert.equal(r.status,401,"unauthenticated scan should be denied");
  console.log("PASS public API scan blocked (401)");
  r=await api("/api/admin/session","POST",{password:process.env.ADMIN_PASSWORD});
  assert.equal(r.status,200,"local admin login");
  cookie=r.headers.get("set-cookie")?.split(";")[0]||"";
  assert.ok(cookie.startsWith("pastera_admin="));
  console.log("PASS signed admin session");
  r=await api("/api/admin/vip");
  assert.equal(r.status,200,JSON.stringify(r.data));
  userId=r.data.members.find(x=>x.email?.toLowerCase()===email.toLowerCase())?.id;
  assert.ok(userId,"test customer missing");
  testCard=r.data.cards.find(x=>x.card_number==="VIP-0001");
  assert.ok(testCard,"VIP-0001 missing");
  const collision=r.data.cards.find(x=>x.uid_hex===uid && x.id!==testCard.id);
  assert.ok(!collision,"UID belongs to another card");
  assert.ok((testCard.status==="unassigned"&&!testCard.user_id&&!testCard.uid_hex)||(testCard.status==="active"&&testCard.user_id===userId&&testCard.uid_hex===uid),"Unexpected existing card assignment");
  assert.equal((await summary()).stamps,0,"test customer has a nonzero balance; refusing");
  if(testCard.status==="unassigned") {
    r=await api("/api/admin/vip","POST",{action:"assign",cardId:testCard.id,userId,uid});
    assert.equal(r.status,200,JSON.stringify(r.data));
    console.log("PASS VIP-0001 linked to existing test account");
  } else console.log("PASS VIP-0001 already linked to test account");
  const scanA=randomUUID(),scanB=randomUUID();
  r=await api("/api/admin/vip/scan","POST",{uid,eventId:scanA,simulation:true});
  assert.equal(r.status,200,JSON.stringify(r.data));
  created.push(scanA);
  assert.equal((await summary()).stamps,1,"first scan should count +1");
  console.log("PASS simulated first scan: 0 to 1");
  r=await api("/api/admin/vip/scan","POST",{uid,eventId:scanA,simulation:true});
  assert.equal(r.status,200,JSON.stringify(r.data));
  assert.equal((await summary()).stamps,1,"repeated network request should not count twice");
  console.log("PASS retry with same event id remains 1");
  r=await api("/api/admin/vip/scan","POST",{uid,eventId:scanB,simulation:true});
  assert.equal(r.status,200,JSON.stringify(r.data));
  created.push(scanB);
  assert.equal((await summary()).stamps,2,"second scan must count +2");
  console.log("PASS simulated second scan: 1 to 2");
  assert.ok(await undo(scanB),"undo second scan");
  assert.equal((await summary()).stamps,1);
  console.log("PASS admin correction: 2 to 1");
  assert.ok(await undo(scanA),"undo first scan");
  assert.equal((await summary()).stamps,0);
  console.log("PASS test cleanup: 1 to 0 (no fake paid orders remain)");
  r=await api("/api/admin/vip");
  const qa=r.data.history.filter(x=>created.includes(x.id));
  assert.equal(qa.length,2,"missing QA audit entries");
  assert.ok(qa.every(x=>x.operator_label==="QA-SIMULATION"));
  console.log("PASS audit contains 2 QA-SIMULATION entries");
  console.log("RESULT: ALL PASSED, VIP-0001 assigned, effective stamps = 0");
} catch(e) { console.error("TEST_FAILED",e.message);process.exitCode=1; }
finally {
 for(const id of created) if(!undone.has(id)) {
    const ok=await undo(id).catch(()=>false);
    if(!ok) console.error("ATTENTION: could not reverse test scan",id);
 }
 if(created.length && userId) {
   const s=await summary().catch(()=>null);
   console.log("FINAL_EFFECTIVE_STAMPS:",s?.stamps??"unknown");
 }
}
