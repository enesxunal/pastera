/** Kapalı değilse coming soon aktif (varsayılan: açık). Canlıya alınca Vercel'de COMING_SOON=false */
export function isComingSoonEnabled(): boolean {
  return process.env.COMING_SOON !== "false";
}

export const COMING_SOON_BYPASS_PREFIXES = [
  "/admin",
  "/branch",
  "/display",
  "/lobby",
  "/api",
] as const;

export function isComingSoonBypassPath(pathname: string): boolean {
  return COMING_SOON_BYPASS_PREFIXES.some((p) => pathname.startsWith(p));
}
