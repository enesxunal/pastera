import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  discountForTier,
  isVipTier,
  normalizeCardCode,
  type MembershipTier,
} from "@/lib/membership";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const cardCode = normalizeCardCode(params.code);
  if (!cardCode) {
    return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const { data: card } = await svc
    .from("nfc_cards")
    .select("id, card_code, tier, status, user_id, assigned_at")
    .eq("card_code", cardCode)
    .maybeSingle();

  if (!card) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const isAdmin = isAdminRequest(req);
  const viewerId = await getAuthenticatedUserId();
  const isOwner = !!viewerId && card.user_id === viewerId;

  if (card.status === "revoked") {
    return NextResponse.json({
      ok: true,
      view: "revoked",
      cardCode: card.card_code,
    });
  }

  if (card.status === "unassigned" || !card.user_id) {
    return NextResponse.json({
      ok: true,
      view: isAdmin ? "admin_unassigned" : "unassigned",
      cardCode: card.card_code,
      cardTier: card.tier,
    });
  }

  const { data: profile } = await svc
    .from("profiles")
    .select("id, full_name, email, phone, loyalty_points, membership_tier")
    .eq("id", card.user_id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ ok: false, error: "member_not_found" }, { status: 404 });
  }

  const tier = (profile.membership_tier ?? "standard") as MembershipTier;
  const effectiveTier = isVipTier(tier) ? tier : (card.tier as "gold" | "black");
  const discountPercent = discountForTier(effectiveTier);

  if (isAdmin) {
    return NextResponse.json({
      ok: true,
      view: "admin",
      cardCode: card.card_code,
      cardTier: card.tier,
      cardStatus: card.status,
      member: {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        loyaltyPoints: Number(profile.loyalty_points ?? 0),
        membershipTier: effectiveTier,
        discountPercent,
      },
    });
  }

  if (isOwner) {
    return NextResponse.json({
      ok: true,
      view: "owner",
      cardCode: card.card_code,
      cardTier: effectiveTier,
      fullName: profile.full_name,
      membershipTier: effectiveTier,
      discountPercent,
      loyaltyPoints: Number(profile.loyalty_points ?? 0),
    });
  }

  // Yabancı — sadece havalı kart, indirim yok
  return NextResponse.json({
    ok: true,
    view: "public",
    cardCode: card.card_code,
    cardTier: effectiveTier,
    displayName: profile.full_name?.trim().split(/\s+/)[0] ?? "VIP",
  });
}
