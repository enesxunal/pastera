"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import type { OrderRow } from "@/lib/order-types";
import { ORDER_STATUS_LABELS } from "@/lib/order-types";
import {
  formatOrderInternalRef,
  formatOrderNumber,
  orderLineTexts,
  orderMeta,
} from "@/lib/order-display";
import { formatEur } from "@/lib/format";

export function OrderDetailPanel({ order }: { order: OrderRow }) {
  const { locale, t } = useI18n();
  const lines = orderLineTexts(order);
  const when = new Date(order.created_at).toLocaleString(locale === "tr" ? "tr-TR" : "de-DE");

  return (
    <div className="mt-4 rounded-xl border border-[#2e402a] bg-black/40 p-4 text-sm">
      <div className="grid gap-2 sm:grid-cols-2">
        <p>
          <span className="text-white/45">{t("orderDetail.customer")}: </span>
          <span className="font-semibold text-white">
            {order.customer_name?.trim() || "—"}
          </span>
        </p>
        <p>
          <span className="text-white/45">{t("delivery.phone")}: </span>
          <span className="text-white">{order.customer_phone?.trim() || "—"}</span>
        </p>
        <p>
          <span className="text-white/45">{t("orderDetail.placedAt")}: </span>
          <span className="text-white">{when}</span>
        </p>
        <p>
          <span className="text-white/45">{t("orderDetail.status")}: </span>
          <span className="text-[#c49746]">{ORDER_STATUS_LABELS[order.status][locale]}</span>
        </p>
        <p>
          <span className="text-white/45">{t("orderDetail.number")}: </span>
          <span className="font-bold text-[#c49746]">{formatOrderNumber(order)}</span>
          <span className="ml-2 text-xs text-white/35">({formatOrderInternalRef(order.id)})</span>
        </p>
        <p>
          <span className="text-white/45">{t("cart.total")}: </span>
          <span className="font-semibold text-white">{formatEur(Number(order.total_amount))}</span>
        </p>
      </div>
      {orderMeta(order, locale) ? (
        <p className="mt-2 text-white/55">{orderMeta(order, locale)}</p>
      ) : null}
      <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-[#c49746]">
        {t("orderDetail.items")}
      </p>
      <ul className="mt-2 space-y-1 text-white/80">
        {lines.length === 0 ? (
          <li className="text-white/40">—</li>
        ) : (
          lines.map((line, i) => <li key={i}>{line}</li>)
        )}
      </ul>
    </div>
  );
}
