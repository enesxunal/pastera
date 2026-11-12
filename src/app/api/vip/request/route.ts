import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function POST(req: NextRequest) {
  const userId=await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ok:false,error:"login_required"},{status:401});
  const body=await req.json().catch(()=>null) as {method?:string;addressId?:string}|null;
  if (!body || (body.method!=="pickup" && body.method!=="delivery")) return NextResponse.json({ok:false,error:"invalid_method"},{status:400});
  const svc=createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ok:false,error:"not_configured"},{status:503});
  const {data:active}=await svc.from("vip_club_cards").select("id").eq("user_id",userId).eq("status","active").maybeSingle();
  if(active) return NextResponse.json({ok:false,error:"already_has_card"},{status:409});
  let addressId: string|null=null;
  if(body.method==="delivery") {
    if(!body.addressId || !/^[0-9a-f-]{36}$/i.test(body.addressId)) return NextResponse.json({ok:false,error:"address_required"},{status:400});
    const {data:address}=await svc.from("customer_addresses").select("id").eq("id",body.addressId).eq("user_id",userId).maybeSingle();
    if(!address) return NextResponse.json({ok:false,error:"address_not_found"},{status:404});
    addressId=address.id;
  }
  const {data:existing}=await svc.from("vip_club_requests").select("status").eq("user_id",userId).maybeSingle();
  if(existing && existing.status!=="cancelled") return NextResponse.json({ok:false,error:"request_exists"},{status:409});
  const {error}=await svc.from("vip_club_requests").upsert({user_id:userId,delivery_method:body.method,address_id:addressId,status:"requested",updated_at:new Date().toISOString()},{onConflict:"user_id"});
  if(error) return NextResponse.json({ok:false,error:"request_failed"},{status:500});
  return NextResponse.json({ok:true});
}
