/** Açıkça true verilmedikçe coming soon kapalıdır. */
export function isComingSoonEnabled(): boolean {
  return process.env.COMING_SOON === "true";
}

export const COMING_SOON_BYPASS_PREFIXES = [
  "/admin",
  "/branch",
  "/display",
  "/lobby",
  "/connect",
  "/c",
  "/api",
] as const;

export function isComingSoonBypassPath(pathname: string): boolean {
  return COMING_SOON_BYPASS_PREFIXES.some((p) => pathname.startsWith(p));
}
