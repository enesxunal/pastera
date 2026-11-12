import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { isAdminRequest } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getVipState } from "@/lib/vip-club-server";

function terminalAuthorized(req:NextRequest){
 const secret=process.env.VIP_NFC_TERMINAL_SECRET||"";
 const supplied=req.headers.get("authorization")?.replace(/^Bearer /i,"")||"";
 if(secret.length<24||supplied.length!==secret.length)return false;
 return timingSafeEqual(Buffer.from(secret),Buffer.from(supplied));
}
export async function POST(req:NextRequest){
 if(!isAdminRequest(req)&&!terminalAuthorized(req))return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
 const body=await req.json().catch(()=>null) as {uid?:string;eventId?:string}|null;
 const uid=(body?.uid||"").replace(/[^0-9a-f]/gi,"").toUpperCase();
 if(!/^[0-9A-F]{8,20}$/.test(uid)||!body?.eventId||!/^[0-9a-f-]{36}$/i.test(body.eventId))return NextResponse.json({ok:false,error:"uid_and_event_id_required"},{status:400});
 const svc=createSupabaseServiceClient();if(!svc)return NextResponse.json({ok:false,error:"not_configured"},{status:503});
 const {data:card}=await svc.from("vip_club_cards").select("user_id,card_number").eq("uid_hex",uid).eq("status","active").maybeSingle();
 if(!card?.user_id)return NextResponse.json({ok:false,error:"unassigned_card"},{status:404});
 const {data,error}=await svc.rpc("vip_club_stamp",{p_uid:uid,p_request_id:body.eventId,p_operator:"NFC-POS"});
 if(error)return NextResponse.json({ok:false,error:"stamp_failed"},{status:409});
 try{
  const state=await getVipState(card.user_id);
  return NextResponse.json({ok:true,scanId:data,card_number:card.card_number,userId:card.user_id,...state});
 }catch{return NextResponse.json({ok:true,scanId:data,card_number:card.card_number});}
}
