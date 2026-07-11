/**
 * Online sipariş (gel-al, masada, paket) — varsayılan kapalı.
 * Tekrar açmak için Vercel / .env.local:
 *   NEXT_PUBLIC_ONLINE_ORDERING_ENABLED=true
 */
export function isOnlineOrderingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ONLINE_ORDERING_ENABLED === "true";
}
