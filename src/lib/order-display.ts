import type { OrderRow } from "@/lib/order-types";
import type { SupportedLocale } from "@/lib/cart";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-types";

export function formatOrderShortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

/** Müşteri ekranları — display_number; yoksa UUID kısa */
export function formatOrderNumber(order: { id: string; display_number?: number | null }): string {
  if (order.display_number != null) return String(order.display_number);
  return formatOrderShortId(order.id);
}

/** Destek / admin — tam UUID kısa parça */
export function formatOrderInternalRef(id: string): string {
  return formatOrderShortId(id);
}

export function statusLabel(status: OrderStatus, locale: SupportedLocale): string {
  return ORDER_STATUS_LABELS[status][locale];
}

export function orderLineTexts(order: OrderRow): string[] {
  const lines = order.items?.lines;
  if (!Array.isArray(lines)) return [];
  return lines.map((l) => l.label).filter(Boolean);
}

export function orderMeta(order: OrderRow, locale: SupportedLocale): string {
  const parts: string[] = [];
  if (order.table_number) {
    parts.push(locale === "de" ? `Tisch ${order.table_number}` : `Masa ${order.table_number}`);
  }
  if (order.order_type === "dine_in") {
    parts.push(locale === "de" ? "Im Restaurant" : "Salonda");
  }
  if (order.order_type === "pickup") {
    parts.push(locale === "de" ? "Abholung" : "Gel-al");
  }
  if (order.order_type === "delivery") {
    parts.push(locale === "de" ? "Lieferung" : "Teslimat");
    const addr = [order.delivery_street, order.delivery_postal, order.delivery_city]
      .filter(Boolean)
      .join(", ");
    if (addr) parts.push(addr);
    if (order.customer_name) parts.push(order.customer_name);
  }
  const pay =
    order.payment_type === "card" || order.payment_type === "online"
      ? locale === "de"
        ? "Karte"
        : "Kart"
      : locale === "de"
        ? "Bar"
        : "Nakit";
  parts.push(pay);
  return parts.join(" · ");
}
