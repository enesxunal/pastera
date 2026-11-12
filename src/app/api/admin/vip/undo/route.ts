import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
export async function POST(req:NextRequest){
 if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});
 const body=await req.json().catch(()=>null) as {scanId?:string}|null;
 if(!body?.scanId||!/^[0-9a-f-]{36}$/i.test(body.scanId))return NextResponse.json({ok:false},{status:400});
 const svc=createSupabaseServiceClient();if(!svc)return NextResponse.json({ok:false},{status:503});
 const {data,error}=await svc.rpc("vip_club_undo",{p_scan_id:body.scanId,p_operator:"ADMIN"});
 if(error)return NextResponse.json({ok:false,error:"undo_failed_or_reward_already_spent"},{status:409});
 return NextResponse.json({ok:true,undoId:data});
}
