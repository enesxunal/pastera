"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { useI18n } from "@/components/providers/I18nProvider";
import type { BranchRow, OrderRow, OrderStatus } from "@/lib/order-types";
import { ORDER_STATUS_LABELS } from "@/lib/order-types";
import { OrderDetailPanel } from "@/components/orders/OrderDetailPanel";
import { formatOrderInternalRef, formatOrderNumber, orderMeta, statusLabel } from "@/lib/order-display";
import { formatEur } from "@/lib/format";

type OrderWithBranch = OrderRow & { branches?: { name: string; slug: string } | null };

export function AdminOrdersClient() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [filter, setFilter] = useState("");
  const [orders, setOrders] = useState<OrderWithBranch[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);

  const loadBranches = useCallback(async () => {
    const res = await fetch("/api/admin/branches");
    const j = (await res.json()) as { branches?: BranchRow[] };
    setBranches(j.branches ?? []);
  }, []);

  const loadOrders = useCallback(async () => {
    const q = filter ? `?branchId=${encodeURIComponent(filter)}` : "";
    const res = await fetch(`/api/admin/orders${q}`);
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const j = (await res.json()) as { orders?: OrderWithBranch[] };
    setOrders(j.orders ?? []);
  }, [filter, router]);

  useEffect(() => {
    void loadBranches();
  }, [loadBranches]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function setStatus(orderId: string, status: OrderStatus) {
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) void loadOrders();
    } finally {
      setBusyId(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  async function downloadBackup() {
    setBackupBusy(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pastera-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setBackupBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-white">{t("admin.ordersTitle")}</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={backupBusy}
            onClick={() => void downloadBackup()}
            className="rounded-full border border-[#c49746]/50 px-4 py-2 text-sm text-[#c49746] disabled:opacity-50"
          >
            {backupBusy ? "…" : t("admin.backup")}
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-[#2e402a] px-4 py-2 text-sm text-white/70"
          >
            {t("admin.logout")}
          </button>
        </div>
      </div>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mt-6 rounded-lg border border-[#2e402a] bg-[#111] px-3 py-2 text-sm text-white"
      >
        <option value="">{t("admin.allBranches")}</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <ul className="mt-6 space-y-3">
        {orders.length === 0 ? (
          <li className="py-12 text-center text-white/40">{t("admin.ordersEmpty")}</li>
        ) : (
          orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-[#2e402a] bg-[#111] p-4">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-display font-bold text-white">#{formatOrderNumber(o)}</span>
                  <span className="text-[#c49746]">{formatEur(Number(o.total_amount))}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-white">
                  {o.customer_name?.trim() || "—"} · {o.customer_phone?.trim() || "—"}
                </p>
                <p className="mt-1 text-sm text-white/55">
                  {o.branches?.name ?? "—"} · {statusLabel(o.status, locale)} ·{" "}
                  {new Date(o.created_at).toLocaleString(locale === "de" ? "de-DE" : "tr-TR")}
                </p>
                <p className="font-mono text-xs text-white/35">({formatOrderInternalRef(o.id)})</p>
                {orderMeta(o, locale) ? (
                  <p className="text-sm text-[#c49746]/80">{orderMeta(o, locale)}</p>
                ) : null}
                <p className="mt-2 text-xs text-[#c49746]/70">
                  {expandedId === o.id ? t("orderDetail.hide") : t("orderDetail.show")}
                </p>
              </button>
              {expandedId === o.id ? <OrderDetailPanel order={o} /> : null}
              <label className="mt-3 block text-xs text-white/45">
                {t("admin.orderStatus")}
                <select
                  value={o.status}
                  disabled={busyId === o.id}
                  onChange={(e) => void setStatus(o.id, e.target.value as OrderStatus)}
                  className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-2 py-1.5 text-sm text-white"
                >
                  {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s][locale]}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
