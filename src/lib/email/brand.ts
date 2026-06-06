export const PASTERA_EMAIL_COLORS = {
  green: "#2e402a",
  greenLight: "#b8cc78",
  yellow: "#e8d490",
  gold: "#c49746",
  bg: "#eef3dc",
  card: "#fafcf5",
  text: "#1a1a1a",
  muted: "#555555",
} as const;

export const PASTERA_INSTAGRAM_URL = "https://www.instagram.com/pastapastera/";

export const PASTERA_GOOGLE_REVIEW_URL =
  process.env.PASTERA_GOOGLE_REVIEW_URL?.trim() ||
  "https://share.google/oM2PvWB3FpOcxjQHt";

export function pasteraLogoUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/pastera-Logo-beyaz.png`;
}

export function pasteraEmailFrom(): string {
  const from = process.env.PASTERA_EMAIL_FROM?.trim();
  if (from) return from;
  return "Pastera <noreply@pastera.de>";
}
