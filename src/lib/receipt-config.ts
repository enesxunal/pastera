/** Termal fiş genişlikleri — yaygın: 58 mm veya 80 mm */
export type ReceiptWidthMm = 58 | 80;

export const RECEIPT_WIDTH_MM: ReceiptWidthMm =
  process.env.NEXT_PUBLIC_RECEIPT_WIDTH_MM === "58" ? 58 : 80;

/** Yaklaşık karakter sayısı (monospace, küçük font) */
export function receiptCharsPerLine(widthMm: ReceiptWidthMm = RECEIPT_WIDTH_MM): number {
  return widthMm === 58 ? 32 : 48;
}

export function receiptPrintableWidthMm(widthMm: ReceiptWidthMm = RECEIPT_WIDTH_MM): number {
  return widthMm - 4;
}
