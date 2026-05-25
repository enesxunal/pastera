"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { notifyNewOrder, playNewOrderChime } from "@/lib/order-notifications";
import { useI18n } from "@/components/providers/I18nProvider";
import type { OrderRow, OrderStatus } from "@/lib/order-types";
import { formatOrderNumber, orderLineTexts, orderMeta, statusLabel } from "@/lib/order-display";
import { formatEur } from "@/lib/format";

const COLUMNS: OrderStatus[] = ["pending", "preparing", "ready"];

export function DisplayKitchenClient() {
  const { locale, t } = useI18n();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [clock, setClock] = useState("");
  const prevPendingRef = useRef(0);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders?active=1", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { orders?: OrderRow[] };
      setOrders(json.orders ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
    const poll = setInterval(() => void fetchOrders(), 5000);
    return () => clearInterval(poll);
  }, [fetchOrders]);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString(locale === "de" ? "de-DE" : "tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [locale]);

  useEffect(() => {
    const pending = orders.filter((o) => o.status === "pending").length;
    if (pending > prevPendingRef.current && prevPendingRef.current > 0) {
      playNewOrderChime();
      void notifyNewOrder(t("branch.newOrderTitle"), t("branch.newOrderBody"));
    }
    prevPendingRef.current = pending;
  }, [orders, t]);

  const byStatus = (s: OrderStatus) =>
    orders.filter((o) => o.status === s).sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <div className="min-h-screen bg-[#0a0a0a] px-4 py-6 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-[#2e402a] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c49746]">
            {t("display.kicker")}
          </p>
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{t("display.title")}</h1>
        </div>
        <p className="font-display text-3xl tabular-nums text-white/70">{clock}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {COLUMNS.map((status) => (
          <section key={status} className="flex flex-col rounded-2xl border-2 border-[#2e402a] bg-[#111]">
            <h2 className="border-b border-[#2e402a] px-5 py-4 font-display text-lg font-bold text-[#c49746]">
              {statusLabel(status, locale)}
              <span className="ml-2 text-sm font-normal text-white/40">({byStatus(status).length})</span>
            </h2>
            <ul className="flex max-h-[calc(100vh-12rem)] flex-col gap-3 overflow-y-auto p-4">
              {byStatus(status).length === 0 ? (
                <li className="py-8 text-center text-sm text-white/35">{t("display.empty")}</li>
              ) : (
                byStatus(status).map((order) => (
                  <li
                    key={order.id}
                    className="rounded-xl border border-[#2e402a]/80 bg-[#0c0c0c] p-4 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-display text-xl font-bold text-white">
                        #{formatOrderNumber(order)}
                      </span>
                      <span className="text-sm font-semibold text-[#c49746]">
                        {formatEur(Number(order.total_amount))}
                      </span>
                    </div>
                    {orderMeta(order, locale) ? (
                      <p className="mt-1 text-sm font-semibold text-[#c49746]/90">{orderMeta(order, locale)}</p>
                    ) : null}
                    <ul className="mt-3 space-y-1 text-sm text-white/75">
                      {orderLineTexts(order).map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </li>
                ))
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
