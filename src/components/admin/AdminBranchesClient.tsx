"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { useI18n } from "@/components/providers/I18nProvider";
import type { BranchRow } from "@/lib/order-types";

export function AdminBranchesClient() {
  const { t } = useI18n();
  const router = useRouter();
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [msg, setMsg] = useState("");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [canEdit, setCanEdit] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/branches");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const j = (await res.json()) as { branches?: BranchRow[] };
    setBranches(j.branches ?? []);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  async function createBranch(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name, can_edit_prices: canEdit, radius_km: 5 }),
    });
    const j = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok) setMsg(j.error ?? "error");
    else {
      setSlug("");
      setName("");
      setCanEdit(false);
      setMsg(t("common.branchCreated"));
    }
    await load();
  }

  async function togglePrices(b: BranchRow) {
    await fetch("/api/admin/branches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id, can_edit_prices: !b.can_edit_prices }),
    });
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AdminNav />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-white">{t("admin.branchesTitle")}</h1>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-full border border-[#2e402a] px-4 py-2 text-sm text-white/70"
        >
          {t("admin.logout")}
        </button>
      </div>
      <p className="mt-2 text-sm text-white/50">{t("admin.branchesHint")}</p>

      <form onSubmit={createBranch} className="mt-8 grid gap-3 rounded-2xl border border-[#2e402a] bg-[#111] p-5 sm:grid-cols-2">
        <input
          placeholder={t("admin.branchSlug")}
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="rounded-lg border border-[#2e402a] bg-black/40 px-3 py-2 text-white"
        />
        <input
          placeholder={t("admin.branchName")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-[#2e402a] bg-black/40 px-3 py-2 text-white"
        />
        <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
          <input type="checkbox" checked={canEdit} onChange={(e) => setCanEdit(e.target.checked)} />
          {t("admin.canEditPrices")}
        </label>
        <button
          type="submit"
          className="rounded-full py-2 font-display text-sm font-bold text-[#0a0a0a] sm:col-span-2"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("admin.branchAdd")}
        </button>
      </form>
      {msg ? <p className="mt-3 text-sm text-[#c49746]">{msg}</p> : null}

      <ul className="mt-8 space-y-3">
        {branches.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2e402a] bg-[#0c0c0c] px-4 py-3"
          >
            <div>
              <p className="font-semibold text-white">{b.name}</p>
              <p className="text-xs text-white/45">
                /m/{b.slug}/… · {b.radius_km} km · id: {b.id.slice(0, 8)}…
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/branches/${b.id}`}
                className="rounded-full border border-[#c49746]/50 px-3 py-1.5 text-xs font-semibold text-[#c49746]"
              >
                {t("branchDetail.view")}
              </Link>
              <button
                type="button"
                onClick={() => void togglePrices(b)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  b.can_edit_prices
                    ? "bg-[#2e402a] text-[#c49746]"
                    : "border border-[#2e402a] text-white/50"
                }`}
              >
                {b.can_edit_prices ? t("admin.pricesOn") : t("admin.pricesOff")}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
