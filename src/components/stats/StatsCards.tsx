"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import { formatEur } from "@/lib/format";
import type { BranchStatsSummary } from "@/lib/order-stats";

export function StatsCards({ stats }: { stats: BranchStatsSummary }) {
  const { t } = useI18n();

  const items = [
    { label: t("stats.todayRevenue"), value: formatEur(stats.todayRevenue), hint: t("stats.deliveredOnly") },
    { label: t("stats.todayGross"), value: formatEur(stats.todayGross), hint: t("stats.allOrdersToday") },
    { label: t("stats.todayOrders"), value: String(stats.todayOrders), hint: "" },
    { label: t("stats.monthRevenue"), value: formatEur(stats.monthRevenue), hint: t("stats.deliveredOnly") },
    { label: t("stats.monthGross"), value: formatEur(stats.monthGross), hint: t("stats.thisMonth") },
    { label: t("stats.activeOrders"), value: String(stats.activeOrders), hint: t("stats.inKitchen") },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-[#2e402a] bg-[#111] p-4"
        >
          <p className="text-xs uppercase tracking-widest text-white/45">{item.label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-[#c49746]">{item.value}</p>
          {item.hint ? <p className="mt-1 text-xs text-white/35">{item.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function MiniChart({
  data,
}: {
  data: { date: string; revenue: number; count: number }[];
}) {
  const { t } = useI18n();
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="rounded-xl border border-[#2e402a] bg-[#111] p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#c49746]">
        {t("stats.last7Days")}
      </p>
      <ul className="mt-4 flex items-end gap-2" style={{ height: 120 }}>
        {data.map((d) => (
          <li key={d.date} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-[#c49746]/80"
              style={{ height: `${Math.max(8, (d.revenue / max) * 100)}%` }}
              title={formatEur(d.revenue)}
            />
            <span className="text-[9px] text-white/40">{d.date.slice(5)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
