/**
 * Paket servisi (Lieferung) — geçici olarak kapalı.
 * Tekrar açmak için Vercel / .env.local:
 *   NEXT_PUBLIC_DELIVERY_ENABLED=true
 */
export function isDeliveryEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DELIVERY_ENABLED === "true";
}
