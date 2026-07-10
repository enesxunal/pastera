import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import type { MembershipTier } from "@/lib/membership";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest(req)) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { tier?: MembershipTier };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const tier = body.tier;
  if (tier !== "standard" && tier !== "gold" && tier !== "black") {
    return NextResponse.json({ ok: false, error: "invalid_tier" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const userId = params.id;
  const { error } = await svc.from("profiles").update({ membership_tier: tier }).eq("id", userId);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  if (tier === "standard") {
    await svc
      .from("nfc_cards")
      .update({ status: "unassigned", user_id: null, assigned_at: null })
      .eq("user_id", userId)
      .eq("status", "active");
  } else {
    // Aktif kart varsa tier ile eşle
    await svc.from("nfc_cards").update({ tier }).eq("user_id", userId).eq("status", "active");
  }

  return NextResponse.json({ ok: true, tier });
}
