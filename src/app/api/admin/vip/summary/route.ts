import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getVipState } from "@/lib/vip-club-server";
export async function GET(req:NextRequest){
 if(!isAdminRequest(req))return NextResponse.json({ok:false},{status:401});
 const userId=new URL(req.url).searchParams.get("userId")||"";
 if(!/^[0-9a-f-]{36}$/i.test(userId))return NextResponse.json({ok:false},{status:400});
 try{return NextResponse.json({ok:true,...await getVipState(userId)});}catch{return NextResponse.json({ok:false,error:"not_ready"},{status:503});}
}
