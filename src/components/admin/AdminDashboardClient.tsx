"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { MiniChart, StatsCards } from "@/components/stats/StatsCards";
import { useI18n } from "@/components/providers/I18nProvider";
import { formatEur } from "@/lib/format";
import type { GlobalStatsSummary } from "@/lib/order-stats";

export function AdminDashboardClient() {
  const { t } = useI18n();
  const router = useRouter();
  const [stats, setStats] = useState<GlobalStatsSummary | null>(null);
  const [chart, setChart] = useState<{ date: string; revenue: number; count: number }[]>([]);
  const [backupBusy, setBackupBusy] = useState(false);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    void fetch("/api/admin/stats")
      .then((r) => {
        if (r.status === 401) {
          router.replace("/admin/login");
          return null;
        }
        return r.json();
      })
      .then(
        (j: { stats?: GlobalStatsSummary; chart?: typeof chart; memberCount?: number } | null) => {
          if (j?.stats) setStats(j.stats);
          if (j?.chart) setChart(j.chart);
          if (j?.memberCount != null) setMemberCount(j.memberCount);
        },
      )
      .catch(() => {});
  }, [router]);

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

  const cards = [
    { href: "/admin/branches", title: t("admin.navBranches"), desc: t("admin.cardBranches") },
    { href: "/admin/catalog", title: t("admin.navCatalog"), desc: t("admin.cardCatalog") },
    { href: "/admin/orders", title: t("admin.navOrders"), desc: t("admin.cardOrders") },
    {
      href: "/admin/members",
      title: t("admin.navMembers"),
      desc: `${t("admin.cardMembers")} (${memberCount})`,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-white">{t("admin.dashboardTitle")}</h1>
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
      <p className="mt-2 text-white/50">{t("admin.dashboardHint")}</p>

      {stats ? (
        <section className="mt-10">
          <h2 className="font-display text-lg font-bold text-[#c49746]">{t("stats.allBranches")}</h2>
          <div className="mt-4">
            <StatsCards stats={stats.totals} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <MiniChart data={chart} />
            <div className="rounded-xl border border-[#2e402a] bg-[#111] p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#c49746]">
                {t("stats.perBranch")}
              </p>
              <ul className="mt-4 space-y-3">
                {stats.branches.map((b) => (
                  <li
                    key={b.branchId}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2e402a]/60 pb-3 last:border-0"
                  >
                    <div>
                      <Link
                        href={`/admin/branches/${b.branchId}`}
                        className="font-semibold text-white hover:text-[#c49746]"
                      >
                        {b.branchName}
                      </Link>
                      <p className="text-xs text-white/40">
                        {t("stats.todayOrders")}: {b.todayOrders} · {t("stats.activeOrders")}:{" "}
                        {b.activeOrders}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#c49746]">{formatEur(b.todayRevenue)}</p>
                      <p className="text-xs text-white/40">{t("stats.todayRevenue")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border-2 border-[#2e402a] bg-[#111] p-6 transition hover:border-[#c49746]/40"
          >
            <h2 className="font-display text-lg font-bold text-[#c49746]">{c.title}</h2>
            <p className="mt-2 text-sm text-white/55">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
