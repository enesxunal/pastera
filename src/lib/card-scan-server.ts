import { discountForTier, isVipTier, normalizeCardCode, type MembershipTier } from "@/lib/membership";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type CardScanPayload =
  | { ok: false; error: string }
  | { ok: true; view: "revoked"; cardCode: string }
  | { ok: true; view: "unassigned" | "admin_unassigned"; cardCode: string; cardTier: "gold" | "black" }
  | {
      ok: true;
      view: "public";
      cardCode: string;
      cardTier: "gold" | "black";
      displayName: string;
    }
  | {
      ok: true;
      view: "owner";
      cardCode: string;
      cardTier: "gold" | "black";
      fullName: string | null;
      membershipTier: MembershipTier;
      discountPercent: number;
      loyaltyPoints: number;
    }
  | {
      ok: true;
      view: "admin";
      cardCode: string;
      cardTier: "gold" | "black";
      cardStatus: string;
      member: {
        id: string;
        fullName: string | null;
        email: string | null;
        phone: string | null;
        loyaltyPoints: number;
        membershipTier: MembershipTier;
        discountPercent: number;
      };
    };

export const DEFAULT_NFC_CARDS = [
  { card_code: "kart-001", tier: "black" as const },
  { card_code: "kart-002", tier: "gold" as const },
  { card_code: "kart-003", tier: "gold" as const },
  { card_code: "kart-004", tier: "black" as const },
];

export async function ensureDefaultNfcCards(): Promise<void> {
  const svc = createSupabaseServiceClient();
  if (!svc) return;
  for (const row of DEFAULT_NFC_CARDS) {
    await svc.from("nfc_cards").upsert(
      { card_code: row.card_code, tier: row.tier, status: "unassigned" },
      { onConflict: "card_code", ignoreDuplicates: true },
    );
  }
}

export async function getCardScanPayload(
  rawCode: string,
  opts: { isAdmin: boolean; viewerId: string | null },
): Promise<CardScanPayload> {
  const cardCode = normalizeCardCode(rawCode);
  if (!cardCode) return { ok: false, error: "invalid_code" };

  const svc = createSupabaseServiceClient();
  if (!svc) return { ok: false, error: "no_service" };

  await ensureDefaultNfcCards();

  const { data: card, error: cardErr } = await svc
    .from("nfc_cards")
    .select("id, card_code, tier, status, user_id, assigned_at")
    .eq("card_code", cardCode)
    .maybeSingle();

  if (cardErr) {
    if (cardErr.code === "42P01" || cardErr.message.includes("nfc_cards")) {
      return { ok: false, error: "db_setup" };
    }
    return { ok: false, error: "db_error" };
  }

  if (!card) return { ok: false, error: "not_found" };

  const isAdmin = opts.isAdmin;
  const isOwner = !!opts.viewerId && card.user_id === opts.viewerId;

  if (card.status === "revoked") {
    return { ok: true, view: "revoked", cardCode: card.card_code };
  }

  if (card.status === "unassigned" || !card.user_id) {
    return {
      ok: true,
      view: isAdmin ? "admin_unassigned" : "unassigned",
      cardCode: card.card_code,
      cardTier: card.tier as "gold" | "black",
    };
  }

  const { data: profile, error: profileErr } = await svc
    .from("profiles")
    .select("id, full_name, email, phone, loyalty_points, membership_tier")
    .eq("id", card.user_id)
    .maybeSingle();

  if (profileErr || !profile) {
    return { ok: false, error: "member_not_found" };
  }

  const tier = (profile.membership_tier ?? "standard") as MembershipTier;
  const effectiveTier = isVipTier(tier) ? tier : (card.tier as "gold" | "black");
  const discountPercent = discountForTier(effectiveTier);

  if (isAdmin) {
    return {
      ok: true,
      view: "admin",
      cardCode: card.card_code,
      cardTier: card.tier as "gold" | "black",
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
    };
  }

  if (isOwner) {
    return {
      ok: true,
      view: "owner",
      cardCode: card.card_code,
      cardTier: effectiveTier,
      fullName: profile.full_name,
      membershipTier: effectiveTier,
      discountPercent,
      loyaltyPoints: Number(profile.loyalty_points ?? 0),
    };
  }

  return {
    ok: true,
    view: "public",
    cardCode: card.card_code,
    cardTier: effectiveTier,
    displayName: profile.full_name?.trim().split(/\s+/)[0] ?? "VIP",
  };
}
