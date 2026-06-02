/** Poster / Almanca menü: 1,50 € · 0,70 € (immer 2 Nachkommastellen). */
export function formatEur(amount: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
