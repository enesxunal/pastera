"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { notifyNewOrder, playNewOrderChime } from "@/lib/order-notifications";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";
import type { OrderRow, OrderStatus } from "@/lib/order-types";
import { OrderDetailPanel } from "@/components/orders/OrderDetailPanel";
import { formatOrderInternalRef, formatOrderNumber, orderLineTexts, orderMeta, statusLabel } from "@/lib/order-display";
import { formatEur } from "@/lib/format";
import type { BranchStatsSummary } from "@/lib/order-stats";
import { PrintReceiptButton } from "@/components/receipt/PrintReceiptButton";
import { AutoPrintToggle } from "@/components/receipt/AutoPrintToggle";
import { isAutoPrintEnabled, printOrderReceipt } from "@/lib/print-order-receipt";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "delivered",
};

export function BranchPanelClient() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [canEditPrices, setCanEditPrices] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [quickStats, setQuickStats] = useState<BranchStatsSummary | null>(null);
  const [tab, setTab] = useState<"active" | "history">("active");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const prevPendingRef = useRef(0);
  const printedOrderIdsRef = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      const q = tab === "active" ? "?active=1" : "?all=1";
      const res = await fetch(`/api/orders${q}`, { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/branch/login");
        return;
      }
      if (!res.ok) return;
      const json = (await res.json()) as { orders?: OrderRow[] };
      setOrders(json.orders ?? []);
    } catch {
      /* ignore */
    }
  }, [router, tab]);

  useEffect(() => {
    void fetchOrders();
    void fetch("/api/branch/me")
      .then((r) => r.json())
      .then((j: { branch?: { name?: string; can_edit_prices?: boolean } }) => {
        setBranchName(j.branch?.name ?? "");
        setCanEditPrices(Boolean(j.branch?.can_edit_prices));
      })
      .catch(() => {});
    void fetch("/api/branch/stats")
      .then((r) => r.json())
      .then((j: { stats?: BranchStatsSummary }) => {
        if (j.stats) setQuickStats(j.stats);
      })
      .catch(() => {});
    const poll = setInterval(() => {
      void fetchOrders();
      void fetch("/api/branch/stats")
        .then((r) => r.json())
        .then((j: { stats?: BranchStatsSummary }) => {
          if (j.stats) setQuickStats(j.stats);
        })
        .catch(() => {});
    }, 6000);
    return () => clearInterval(poll);
  }, [fetchOrders]);

  async function advanceStatus(order: OrderRow) {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setBusyId(order.id);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) void fetchOrders();
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch("/api/branch/session", { method: "DELETE" });
    router.push("/branch/login");
    router.refresh();
  }

  useEffect(() => {
    const pendingOrders = orders.filter((o) => o.status === "pending");
    const pending = pendingOrders.length;
    if (tab === "active" && pending > prevPendingRef.current && prevPendingRef.current > 0) {
      playNewOrderChime();
      void notifyNewOrder(t("branch.newOrderTitle"), t("branch.newOrderBody"));

      if (isAutoPrintEnabled() && branchName) {
        const newest = pendingOrders[0];
        if (newest && !printedOrderIdsRef.current.has(newest.id)) {
          printedOrderIdsRef.current.add(newest.id);
          printOrderReceipt(newest, { branchName, locale, autoPrint: true });
        }
      }
    }
    prevPendingRef.current = pending;
  }, [orders, tab, t, branchName, locale]);

  const sorted = [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c49746]">
            {t("branch.kicker")}
          </p>
          <h1 className="font-display text-3xl font-bold text-white">{t("branch.title")}</h1>
          {branchName ? (
            <p className="mt-1 text-sm text-[#c49746]">
              {t("branch.activeBranch")}: {branchName}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-2">
          <AutoPrintToggle />
          <div className="flex flex-wrap gap-2">
          <Link
            href="/branch/stats"
            className="rounded-full border border-[#c49746]/50 px-4 py-2 text-xs font-semibold text-[#c49746]"
          >
            {t("stats.branchTitle")}
          </Link>
          {canEditPrices ? (
            <Link
              href="/branch/prices"
              className="rounded-full border border-[#c49746]/50 px-4 py-2 text-xs font-semibold text-[#c49746]"
            >
              {t("branch.pricesLink")}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-[#2e402a] px-4 py-2 text-xs font-semibold text-white/70 hover:border-[#c49746]/40"
          >
            {t("branch.logout")}
          </button>
          </div>
        </div>
      </div>

      {quickStats ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[#2e402a] bg-[#111] p-3">
            <p className="text-[10px] uppercase tracking-widest text-white/40">{t("stats.todayRevenue")}</p>
            <p className="mt-1 font-display text-xl font-bold text-[#c49746]">
              {formatEur(quickStats.todayRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-[#2e402a] bg-[#111] p-3">
            <p className="text-[10px] uppercase tracking-widest text-white/40">{t("stats.monthRevenue")}</p>
            <p className="mt-1 font-display text-xl font-bold text-[#c49746]">
              {formatEur(quickStats.monthRevenue)}
            </p>
          </div>
          <div className="rounded-xl border border-[#2e402a] bg-[#111] p-3">
            <p className="text-[10px] uppercase tracking-widest text-white/40">{t("stats.todayOrders")}</p>
            <p className="mt-1 font-display text-xl font-bold text-white">{quickStats.todayOrders}</p>
          </div>
          <div className="rounded-xl border border-[#2e402a] bg-[#111] p-3">
            <p className="text-[10px] uppercase tracking-widest text-white/40">{t("stats.activeOrders")}</p>
            <p className="mt-1 font-display text-xl font-bold text-white">{quickStats.activeOrders}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            tab === "active" ? "bg-[#c49746] text-[#0a0a0a]" : "border border-[#2e402a] text-white/60"
          }`}
        >
          {t("branch.tabActive")}
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            tab === "history" ? "bg-[#c49746] text-[#0a0a0a]" : "border border-[#2e402a] text-white/60"
          }`}
        >
          {t("branch.tabHistory")}
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-12 text-center text-white/45">{t("branch.empty")}</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {sorted.map((order) => {
            const next = NEXT_STATUS[order.status];
            return (
              <li
                key={order.id}
                className="rounded-2xl border-2 border-[#2e402a] bg-[#111] p-5 shadow-box"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  className="w-full text-left"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold text-white">
                        #{formatOrderNumber(order)}
                        <span className="ml-2 text-xs font-normal text-white/30">
                          ({formatOrderInternalRef(order.id)})
                        </span>
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white/85">
                        {order.customer_name?.trim() || "—"} · {order.customer_phone?.trim() || "—"}
                      </p>
                      <p className="mt-1 text-sm text-[#c49746]">{statusLabel(order.status, locale)}</p>
                      {orderMeta(order, locale) ? (
                        <p className="mt-1 text-sm text-white/55">{orderMeta(order, locale)}</p>
                      ) : null}
                      <p className="mt-1 text-xs text-white/40">
                        {new Date(order.created_at).toLocaleString(
                          locale === "de" ? "de-DE" : "tr-TR",
                        )}
                      </p>
                    </div>
                    <p className="font-display text-xl font-bold text-white">
                      {formatEur(Number(order.total_amount))}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-[#c49746]/70">
                    {expandedId === order.id ? t("orderDetail.hide") : t("orderDetail.show")}
                  </p>
                </button>
                {expandedId === order.id ? (
                  <OrderDetailPanel order={order} />
                ) : (
                  <ul className="mt-3 space-y-1 border-t border-white/[0.06] pt-3 text-sm text-white/75">
                    {orderLineTexts(order).slice(0, 3).map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <PrintReceiptButton order={order} branchName={branchName || "Pastera"} />
                  {next ? (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      onClick={() => void advanceStatus(order)}
                      className="flex-1 rounded-full py-2.5 font-display text-sm font-bold text-[#0a0a0a] disabled:opacity-50"
                      style={{ backgroundColor: "#c49746" }}
                    >
                      {t("branch.nextStatus")}: {statusLabel(next, locale)}
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
