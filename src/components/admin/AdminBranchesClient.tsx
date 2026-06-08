"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AdminBranchForm,
  branchFormToPayload,
  emptyBranchForm,
  type BranchFormValues,
} from "@/components/admin/AdminBranchForm";
import { AdminNav } from "@/components/admin/AdminNav";
import { useI18n } from "@/components/providers/I18nProvider";
import type { BranchRow } from "@/lib/order-types";

export function AdminBranchesClient() {
  const { t } = useI18n();
  const router = useRouter();
  const [branches, setBranches] = useState<BranchRow[]>([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [form, setForm] = useState<BranchFormValues>(emptyBranchForm);
  const [busy, setBusy] = useState(false);

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
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchFormToPayload(form, "create")),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string; geocoded?: boolean };
      if (!res.ok) {
        setErr(j.error ?? t("admin.saveFailed"));
        return;
      }
      setForm(emptyBranchForm());
      setMsg(
        j.geocoded ? t("admin.branchCreatedGeocoded") : t("common.branchCreated"),
      );
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function togglePrices(b: BranchRow) {
    await fetch("/api/admin/branches", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: b.id, can_edit_prices: !b.can_edit_prices }),
    });
    await load();
  }

  function formatAddress(b: BranchRow): string {
    const parts = [b.street, b.postal, b.city].filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
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

      <form
        onSubmit={createBranch}
        className="mt-8 space-y-4 rounded-2xl border border-[#2e402a] bg-[#111] p-5"
      >
        <h2 className="font-display text-lg font-semibold text-[#c49746]">
          {t("admin.branchAdd")}
        </h2>
        <AdminBranchForm values={form} onChange={setForm} mode="create" />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full py-2.5 font-display text-sm font-bold text-[#0a0a0a] disabled:opacity-50 sm:w-auto sm:px-8"
          style={{ backgroundColor: "#c49746" }}
        >
          {busy ? "…" : t("admin.branchAdd")}
        </button>
      </form>
      {msg ? <p className="mt-3 text-sm text-[#c49746]">{msg}</p> : null}
      {err ? <p className="mt-3 text-sm text-red-400">{err}</p> : null}

      <ul className="mt-8 space-y-3">
        {branches.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2e402a] bg-[#0c0c0c] px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-semibold text-white">
                {b.name}
                {!b.is_active ? (
                  <span className="ml-2 text-xs font-normal text-red-300/80">
                    ({t("admin.branchInactive")})
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-white/45">
                /m/{b.slug}/… · {b.radius_km} km
              </p>
              <p className="mt-1 text-xs text-white/55">{formatAddress(b)}</p>
              {b.phone ? <p className="text-xs text-white/40">{b.phone}</p> : null}
              {b.lat != null && b.lng != null ? (
                <p className="text-[10px] text-white/30">
                  {b.lat.toFixed(4)}, {b.lng.toFixed(4)}
                </p>
              ) : (
                <p className="text-[10px] text-amber-400/70">{t("admin.branchNoCoords")}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/admin/branches/${b.id}`}
                className="rounded-full border border-[#c49746]/50 px-3 py-1.5 text-xs font-semibold text-[#c49746]"
              >
                {t("admin.branchEdit")}
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
