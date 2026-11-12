import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(req:NextRequest){
 if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});
 const svc=createSupabaseServiceClient();if(!svc)return NextResponse.json({ok:false,error:"not_configured"},{status:503});
 const [c,p,r,h]=await Promise.all([
  svc.from("vip_club_cards").select("id,card_number,uid_hex,public_token,user_id,status,created_at").order("card_number"),
  svc.from("profiles").select("id,full_name,email").order("created_at",{ascending:false}).limit(5000),
  svc.from("vip_club_requests").select("id,user_id,delivery_method,status,created_at,address_id").order("created_at",{ascending:false}).limit(200),
  svc.from("vip_club_scans").select("id,card_id,user_id,delta,operator_label,created_at,reversed_scan_id").order("created_at",{ascending:false}).limit(30),
 ]);
 if(c.error||p.error||r.error||h.error)return NextResponse.json({ok:false,error:"migration_required"},{status:503});
 const members=p.data||[];const byUser=new Map(members.map(x=>[x.id,x]));
 return NextResponse.json({ok:true,cards:(c.data||[]).map(x=>({...x,member:x.user_id?byUser.get(x.user_id)||null:null})),members,requests:(r.data||[]).map(x=>({...x,member:byUser.get(x.user_id)||null})),history:(h.data||[]).map(x=>({...x,member:byUser.get(x.user_id)||null,card_number:c.data?.find(y=>y.id===x.card_id)?.card_number||null}))});
}

export async function POST(req:NextRequest){
 if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});
 const body=await req.json().catch(()=>null) as {action?:string;cardId?:string;userId?:string;uid?:string;requestId?:string}|null;
 if(!body)return NextResponse.json({ok:false,error:"invalid_json"},{status:400});
 const svc=createSupabaseServiceClient();if(!svc)return NextResponse.json({ok:false,error:"not_configured"},{status:503});
 if(body.action==="assign"){
  const uid=(body.uid||"").replace(/[^0-9a-f]/gi,"").toUpperCase();
  if(!body.cardId||!body.userId||!/^[0-9A-F]{8,20}$/.test(uid))return NextResponse.json({ok:false,error:"card_member_uid_required"},{status:400});
  const {data:member}=await svc.from("profiles").select("id").eq("id",body.userId).maybeSingle();
  if(!member)return NextResponse.json({ok:false,error:"member_not_found"},{status:404});
  const {data,error}=await svc.from("vip_club_cards").update({uid_hex:uid,user_id:body.userId,status:"active",assigned_at:new Date().toISOString()}).eq("id",body.cardId).eq("status","unassigned").is("user_id",null).select("id").maybeSingle();
  if(error||!data)return NextResponse.json({ok:false,error:"card_or_uid_already_assigned"},{status:409});
  return NextResponse.json({ok:true});
 }
 if(body.action==="block"){
  if(!body.cardId)return NextResponse.json({ok:false,error:"card_required"},{status:400});
  const {error}=await svc.from("vip_club_cards").update({status:"blocked"}).eq("id",body.cardId).neq("status","blocked");
  return NextResponse.json({ok:!error},{status:error?500:200});
 }
 if(body.action==="fulfil"){
  if(!body.requestId)return NextResponse.json({ok:false,error:"request_required"},{status:400});
  const {data:request}=await svc.from("vip_club_requests").select("user_id").eq("id",body.requestId).maybeSingle();
  if(!request)return NextResponse.json({ok:false,error:"not_found"},{status:404});
  const {data:card}=await svc.from("vip_club_cards").select("id").eq("user_id",request.user_id).eq("status","active").maybeSingle();
  if(!card)return NextResponse.json({ok:false,error:"assign_card_first"},{status:409});
  const {error}=await svc.from("vip_club_requests").update({status:"fulfilled",updated_at:new Date().toISOString()}).eq("id",body.requestId);
  return NextResponse.json({ok:!error},{status:error?500:200});
 }
 return NextResponse.json({ok:false,error:"invalid_action"},{status:400});
}
