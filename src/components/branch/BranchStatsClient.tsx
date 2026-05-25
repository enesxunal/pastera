"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MiniChart, StatsCards } from "@/components/stats/StatsCards";
import { useI18n } from "@/components/providers/I18nProvider";
import type { BranchStatsSummary, DailyRevenueRow } from "@/lib/order-stats";
import { formatEur } from "@/lib/format";

export function BranchStatsClient() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [stats, setStats] = useState<BranchStatsSummary | null>(null);
  const [chart, setChart] = useState<{ date: string; revenue: number; count: number }[]>([]);
  const [daily, setDaily] = useState<DailyRevenueRow[]>([]);
  const [branchName, setBranchName] = useState("");

  useEffect(() => {
    void fetch("/api/branch/stats")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/branch/login");
          return null;
        }
        return r.json();
      })
      .then(
        (j: {
          stats?: BranchStatsSummary;
          chart?: typeof chart;
          daily?: DailyRevenueRow[];
          branchName?: string;
        } | null) => {
          if (j?.stats) setStats(j.stats);
          if (j?.chart) setChart(j.chart);
          if (j?.daily) setDaily(j.daily);
          if (j?.branchName) setBranchName(j.branchName);
        },
      )
      .catch(() => {});
  }, [router]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c49746]">
            {t("stats.branchTitle")}
          </p>
          <h1 className="font-display text-3xl font-bold text-white">{branchName || "—"}</h1>
        </div>
        <Link
          href="/branch"
          className="rounded-full border border-[#2e402a] px-4 py-2 text-sm text-white/70 hover:border-[#c49746]/40"
        >
          {t("stats.backToOrders")}
        </Link>
      </div>

      {stats ? (
        <div className="mt-8 space-y-6">
          <StatsCards stats={stats} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TypeCard label={t("stats.deliveryToday")} value={stats.deliveryToday} />
            <TypeCard label={t("stats.pickupToday")} value={stats.pickupToday} />
            <TypeCard label={t("stats.dineInToday")} value={stats.dineInToday} />
            <TypeCard label={t("stats.deliveredToday")} value={stats.deliveredToday} />
          </div>
          <MiniChart data={chart} />
          <section>
            <h2 className="font-display text-lg font-bold text-[#c49746]">{t("stats.dailyTable")}</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#2e402a]">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-b border-[#2e402a] bg-[#111] text-xs uppercase tracking-widest text-white/45">
                  <tr>
                    <th className="px-4 py-3">{t("stats.date")}</th>
                    <th className="px-4 py-3">{t("stats.todayOrders")}</th>
                    <th className="px-4 py-3">{t("stats.deliveredToday")}</th>
                    <th className="px-4 py-3">{t("stats.todayGross")}</th>
                    <th className="px-4 py-3">{t("stats.todayRevenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...daily].reverse().map((row) => (
                    <tr key={row.date} className="border-b border-[#2e402a]/50 last:border-0">
                      <td className="px-4 py-2.5 text-white">
                        {new Date(row.date + "T12:00:00").toLocaleDateString(
                          locale === "tr" ? "tr-TR" : "de-DE",
                          { weekday: "short", day: "numeric", month: "short" },
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-white/70">{row.count}</td>
                      <td className="px-4 py-2.5 text-white/70">{row.delivered}</td>
                      <td className="px-4 py-2.5 text-white/70">{formatEur(row.gross)}</td>
                      <td className="px-4 py-2.5 font-semibold text-[#c49746]">
                        {formatEur(row.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <p className="mt-12 text-center text-white/40">{t("auth.loading")}</p>
      )}
    </div>
  );
}

function TypeCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[#2e402a] bg-[#111] p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/45">{label}</p>
    </div>
  );
}
