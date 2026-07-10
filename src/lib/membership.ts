/** VIP üyelik — fiziksel kart yalnızca gold / black */

export type MembershipTier = "standard" | "gold" | "black";
export type NfcCardTier = "gold" | "black";
export type NfcCardStatus = "unassigned" | "active" | "revoked";

export const MEMBERSHIP_DISCOUNT_PERCENT: Record<NfcCardTier, number> = {
  gold: 10,
  black: 20,
};

export function discountForTier(tier: MembershipTier | null | undefined): number {
  if (tier === "gold") return MEMBERSHIP_DISCOUNT_PERCENT.gold;
  if (tier === "black") return MEMBERSHIP_DISCOUNT_PERCENT.black;
  return 0;
}

export function isVipTier(tier: MembershipTier | null | undefined): tier is NfcCardTier {
  return tier === "gold" || tier === "black";
}

export function membershipLabelKey(tier: MembershipTier): string {
  if (tier === "gold") return "membership.goldTitle";
  if (tier === "black") return "membership.blackTitle";
  return "membership.standardTitle";
}

export function normalizeCardCode(raw: string): string {
  return raw.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}
