/** P Coin gösterimi — ondalıklı (ör. 5 € sipariş → 0,05) */
export function formatPcoin(amount: number | string | null | undefined): string {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
