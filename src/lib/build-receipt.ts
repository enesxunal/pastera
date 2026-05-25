import type { SupportedLocale } from "@/lib/cart";
import { formatEur } from "@/lib/format";
import type { OrderRow } from "@/lib/order-types";
import { formatOrderInternalRef, formatOrderNumber, orderMeta } from "@/lib/order-display";
import { receiptCharsPerLine, type ReceiptWidthMm } from "@/lib/receipt-config";

export type ReceiptLineItem = { label: string; amount: number };

export type ReceiptPayload = {
  branchName: string;
  orderNumber: string;
  internalRef: string;
  placedAt: string;
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  typeLabel: string;
  meta: string;
  paymentLabel: string;
  items: ReceiptLineItem[];
  total: number;
};

function center(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  const pad = Math.floor((width - text.length) / 2);
  return " ".repeat(pad) + text;
}

function divider(width: number, ch = "-"): string {
  return ch.repeat(width);
}

function wrapLine(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length <= width) cur = next;
    else {
      if (cur) lines.push(cur);
      cur = w.length > width ? w.slice(0, width) : w;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

function lineItemRow(label: string, amount: number, width: number): string[] {
  const price = formatEur(amount);
  const maxLabel = Math.max(8, width - price.length - 1);
  const labelLines = wrapLine(label, maxLabel);
  const out: string[] = [];
  labelLines.forEach((l, i) => {
    if (i === labelLines.length - 1) {
      const row = l.padEnd(maxLabel, " ") + " " + price;
      out.push(row.slice(0, width));
    } else {
      out.push(l);
    }
  });
  return out;
}

export function buildReceiptFromOrder(
  order: OrderRow,
  branchName: string,
  locale: SupportedLocale,
): ReceiptPayload {
  const items = Array.isArray(order.items?.lines)
    ? (order.items!.lines as ReceiptLineItem[])
    : [];

  const typeLabel =
    order.order_type === "delivery"
      ? locale === "de"
        ? "LIEFERUNG"
        : "TESLİMAT"
      : order.order_type === "pickup"
        ? locale === "de"
          ? "ABHOLUNG"
          : "GEL-AL"
        : order.order_type === "dine_in"
          ? locale === "de"
            ? "IM RESTAURANT"
            : "SALON"
          : "WEB";

  const paymentLabel =
    order.payment_type === "card" || order.payment_type === "online"
      ? locale === "de"
        ? "Karte"
        : "Kart"
      : locale === "de"
        ? "Bar"
        : "Nakit";

  return {
    branchName,
    orderNumber: formatOrderNumber(order),
    internalRef: formatOrderInternalRef(order.id),
    placedAt: new Date(order.created_at).toLocaleString(locale === "de" ? "de-DE" : "tr-TR"),
    customerName: order.customer_name?.trim() ?? "",
    customerPhone: order.customer_phone?.trim() ?? "",
    tableNumber: order.table_number?.trim() ?? "",
    typeLabel,
    meta: orderMeta(order, locale),
    paymentLabel,
    items,
    total: Number(order.total_amount),
  };
}

export function receiptToPlainLines(
  data: ReceiptPayload,
  locale: SupportedLocale,
  widthMm: ReceiptWidthMm = 80,
): string[] {
  const w = receiptCharsPerLine(widthMm);
  const lines: string[] = [];
  const payWord = locale === "de" ? "Zahlung" : "Ödeme";
  const totalWord = locale === "de" ? "SUMME" : "TOPLAM";
  const tableWord = locale === "de" ? "Tisch" : "Masa";

  lines.push(center("PASTERA", w));
  lines.push(center(data.branchName, w));
  lines.push(divider(w, "="));
  lines.push(`${locale === "de" ? "Nr" : "No"}: ${data.orderNumber}`);
  lines.push(`Ref: ${data.internalRef}`);
  lines.push(data.placedAt);
  lines.push(divider(w));
  lines.push(data.typeLabel);
  if (data.tableNumber) lines.push(`${tableWord}: ${data.tableNumber}`);
  if (data.customerName) lines.push(data.customerName);
  if (data.customerPhone) lines.push(data.customerPhone);
  if (data.meta) {
    for (const part of data.meta.split(" · ")) {
      lines.push(...wrapLine(part, w));
    }
  }
  lines.push(divider(w));
  for (const item of data.items) {
    lines.push(...lineItemRow(item.label, item.amount, w));
  }
  lines.push(divider(w));
  const totalStr = formatEur(data.total);
  lines.push((totalWord.padEnd(w - totalStr.length, " ") + totalStr).slice(0, w));
  lines.push(`${payWord}: ${data.paymentLabel}`);
  lines.push(divider(w));
  lines.push(center(locale === "de" ? "Guten Appetit" : "Afiyet olsun", w));
  lines.push("");

  return lines;
}
