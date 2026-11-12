import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { getVipState } from "@/lib/vip-club-server";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ok:false,error:"login_required"},{status:401});
  try { return NextResponse.json({ok:true, ...(await getVipState(userId))}); }
  catch { return NextResponse.json({ok:false,error:"vip_not_ready"},{status:503}); }
}
