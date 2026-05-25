"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { OrderDetailPanel } from "@/components/orders/OrderDetailPanel";
import { useI18n } from "@/components/providers/I18nProvider";
import type { BranchRow, OrderRow } from "@/lib/order-types";
import { formatOrderNumber } from "@/lib/order-display";
import { formatEur } from "@/lib/format";

type BranchDetail = {
  branch: BranchRow;
  stats: {
    totalOrders: number;
    deliveredOrders: number;
    totalRevenue: number;
    activeOrders: number;
  };
  topProducts: { label: string; qty: number; revenue: number }[];
  customers: {
    name: string;
    phone: string;
    orderCount: number;
    totalSpent: number;
    lastOrder: string;
  }[];
  orders: OrderRow[];
};

export function AdminBranchDetailClient({ branchId }: { branchId: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [data, setData] = useState<BranchDetail | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/branches/${branchId}`);
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const j = (await res.json()) as BranchDetail & { ok?: boolean };
    if (j.branch) setData(j as BranchDetail);
  }, [branchId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-white/40">
        …
      </div>
    );
  }

  const { branch, stats, topProducts, customers, orders } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AdminNav />
      <Link href="/admin/branches" className="text-sm text-[#c49746] hover:underline">
        ← {t("admin.navBranches")}
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-white">{branch.name}</h1>
      <p className="mt-1 text-sm text-white/45">/m/{branch.slug}/…</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("branchDetail.totalOrders")} value={String(stats.totalOrders)} />
        <StatCard label={t("branchDetail.delivered")} value={String(stats.deliveredOrders)} />
        <StatCard label={t("branchDetail.revenue")} value={formatEur(stats.totalRevenue)} />
        <StatCard label={t("stats.activeOrders")} value={String(stats.activeOrders)} />
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-[#c49746]">{t("branchDetail.topProducts")}</h2>
        {topProducts.length === 0 ? (
          <p className="mt-3 text-sm text-white/40">{t("admin.ordersEmpty")}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {topProducts.map((p) => (
              <li
                key={p.label}
                className="flex justify-between rounded-lg border border-[#2e402a] bg-[#111] px-4 py-2 text-sm"
              >
                <span className="text-white">{p.label}</span>
                <span className="text-white/50">
                  {p.qty}× · {formatEur(p.revenue)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-[#c49746]">{t("branchDetail.customers")}</h2>
        <ul className="mt-4 space-y-2">
          {customers.slice(0, 50).map((c, i) => (
            <li
              key={i}
              className="flex flex-wrap justify-between gap-2 rounded-lg border border-[#2e402a] bg-[#111] px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-white">{c.name}</p>
                <p className="text-white/45">{c.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-[#c49746]">
                  {c.orderCount} {t("branchDetail.ordersCount")}
                </p>
                <p className="text-white/50">{formatEur(c.totalSpent)}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold text-[#c49746]">{t("admin.ordersTitle")}</h2>
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-xl border border-[#2e402a] bg-[#111] p-4">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="font-bold text-white">#{formatOrderNumber(o)}</span>
                  <span className="text-[#c49746]">{formatEur(Number(o.total_amount))}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-white/80">
                  {o.customer_name?.trim() || "—"} · {o.customer_phone?.trim() || "—"}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {new Date(o.created_at).toLocaleString(locale === "de" ? "de-DE" : "tr-TR")}
                </p>
              </button>
              {expandedId === o.id ? <OrderDetailPanel order={o} /> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#2e402a] bg-[#111] p-4">
      <p className="text-xs uppercase tracking-widest text-[#c49746]">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
