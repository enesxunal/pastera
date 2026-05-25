"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { useI18n } from "@/components/providers/I18nProvider";
import { formatEur } from "@/lib/format";
import { formatPcoin } from "@/lib/format-pcoin";

type MemberRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  loyalty_points: number;
  created_at: string;
  orderCount: number;
  deliveredCount: number;
  totalSpent: number;
  branches: { id: string; name: string }[];
  lastOrder: string | null;
};

type Summary = {
  totalMembers: number;
  withOrders: number;
  totalOrders: number;
};

export function AdminMembersClient() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/members");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const j = (await res.json()) as { members?: MemberRow[]; summary?: Summary };
    setMembers(j.members ?? []);
    if (j.summary) setSummary(j.summary);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? members.filter(
        (m) =>
          m.email?.toLowerCase().includes(q) ||
          m.full_name?.toLowerCase().includes(q) ||
          m.phone?.includes(q),
      )
    : members;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AdminNav />
      <h1 className="font-display text-3xl font-bold text-white">{t("admin.membersTitle")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("admin.membersHint")}</p>

      {summary ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label={t("admin.membersTotal")} value={String(summary.totalMembers)} />
          <Stat label={t("admin.membersWithOrders")} value={String(summary.withOrders)} />
          <Stat label={t("admin.membersAllOrders")} value={String(summary.totalOrders)} />
        </div>
      ) : null}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("admin.membersSearch")}
        className="mt-6 w-full rounded-lg border border-[#2e402a] bg-[#111] px-4 py-2.5 text-sm text-white"
      />

      <ul className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <li className="py-12 text-center text-white/40">{t("admin.membersEmpty")}</li>
        ) : (
          filtered.map((m) => (
            <li key={m.id} className="rounded-xl border border-[#2e402a] bg-[#111] p-4">
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === m.id ? null : m.id)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold text-white">{m.full_name?.trim() || m.email || "—"}</p>
                  <p className="text-sm text-[#c49746]">
                    {m.orderCount} {t("branchDetail.ordersCount")} · {formatEur(m.totalSpent)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-white/50">{m.email}</p>
                {m.phone ? <p className="text-sm text-white/45">{m.phone}</p> : null}
              </button>
              {expandedId === m.id ? (
                <div className="mt-4 border-t border-[#2e402a] pt-4 text-sm text-white/70">
                  <p>
                    {t("auth.pointsLabel")}: {formatPcoin(m.loyalty_points)} P Coin
                  </p>
                  <p className="mt-1">
                    {t("admin.membersDelivered")}: {m.deliveredCount}
                  </p>
                  <p className="mt-1">
                    {t("admin.membersBranches")}:{" "}
                    {m.branches.length
                      ? m.branches.map((b) => b.name).join(", ")
                      : "—"}
                  </p>
                  <p className="mt-1">
                    {t("admin.membersJoined")}:{" "}
                    {new Date(m.created_at).toLocaleDateString(locale === "tr" ? "tr-TR" : "de-DE")}
                  </p>
                  {m.lastOrder ? (
                    <p className="mt-1">
                      {t("admin.membersLastOrder")}:{" "}
                      {new Date(m.lastOrder).toLocaleString(locale === "tr" ? "tr-TR" : "de-DE")}
                    </p>
                  ) : null}
                  <Link
                    href={`/admin/orders`}
                    className="mt-3 inline-block text-xs text-[#c49746] hover:underline"
                  >
                    {t("admin.navOrders")} →
                  </Link>
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#2e402a] bg-[#111] p-4">
      <p className="text-xs uppercase tracking-widest text-[#c49746]">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
