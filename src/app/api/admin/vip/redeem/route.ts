import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
export async function POST(req:NextRequest){
 if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});
 const body=await req.json().catch(()=>null) as {userId?:string}|null;
 if(!body?.userId||!/^[0-9a-f-]{36}$/i.test(body.userId))return NextResponse.json({ok:false},{status:400});
 const svc=createSupabaseServiceClient();if(!svc)return NextResponse.json({ok:false},{status:503});
 const {data,error}=await svc.rpc("vip_club_redeem",{p_user_id:body.userId,p_operator:"ADMIN"});
 if(error)return NextResponse.json({ok:false,error:"insufficient_stamps"},{status:409});
 return NextResponse.json({ok:true,rewardId:data});
}
