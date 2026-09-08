/**
 * Merkezi online sipariş feature flag'i.
 *
 * Geçici browse-only döneminde bilinçli olarak kapalı tutulur. Satışı tekrar
 * açarken bu sabiti true yapıp lint/build ve checkout smoke-testlerini çalıştırın.
 * Admin / branch / display operasyonel altyapısı bu flag'den etkilenmez.
 */
export const ORDERING_ENABLED = false;

export function isOnlineOrderingEnabled(): boolean {
  return ORDERING_ENABLED;
}
