"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";
import { formatEur } from "@/lib/format";

type PriceRow = {
  id: string;
  name_de: string;
  name_tr: string;
  base_price: number;
  branch_price: number | null;
  effective_price: number;
};

export function BranchPricesClient() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [canEdit, setCanEdit] = useState(false);
  const [branchName, setBranchName] = useState("");
  const [items, setItems] = useState<PriceRow[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/branch/catalog-prices");
    if (res.status === 401) {
      router.replace("/branch/login");
      return;
    }
    const j = (await res.json()) as {
      branch?: { name: string; can_edit_prices: boolean };
      items?: PriceRow[];
    };
    setBranchName(j.branch?.name ?? "");
    setCanEdit(Boolean(j.branch?.can_edit_prices));
    setItems(j.items ?? []);
    const d: Record<string, string> = {};
    for (const it of j.items ?? []) {
      d[it.id] = String(it.branch_price ?? it.base_price);
    }
    setDraft(d);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(id: string) {
    setMsg("");
    const price = Number(draft[id]?.replace(",", "."));
    if (Number.isNaN(price) || price < 0) return;
    const res = await fetch("/api/branch/catalog-prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ catalog_item_id: id, price }),
    });
    if (!res.ok) {
      setMsg(locale === "de" ? "Speichern fehlgeschlagen" : "Kaydedilemedi");
      return;
    }
    setMsg(locale === "de" ? "Gespeichert" : "Kaydedildi");
    await load();
  }

  async function resetBase(id: string) {
    await fetch(`/api/branch/catalog-prices?catalog_item_id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await load();
  }

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-white/60">{t("branch.pricesDisabled")}</p>
        <Link href="/branch" className="mt-6 inline-block text-[#c49746] underline">
          {t("branch.backPanel")}
        </Link>
      </div>
    );
  }

  const label = (row: PriceRow) => (locale === "tr" ? row.name_tr : row.name_de);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/branch" className="text-sm text-white/50 hover:text-[#c49746]">
        ← {t("branch.backPanel")}
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-white">{t("branch.pricesTitle")}</h1>
      <p className="mt-1 text-sm text-white/50">{branchName}</p>
      {msg ? <p className="mt-2 text-sm text-[#c49746]">{msg}</p> : null}

      <ul className="mt-8 max-h-[70vh] space-y-2 overflow-y-auto">
        {items.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-[#2e402a] bg-[#111] px-3 py-2"
          >
            <span className="min-w-0 flex-1 truncate text-sm text-white">{label(row)}</span>
            <span className="text-xs text-white/40">{formatEur(row.base_price)}</span>
            <input
              type="text"
              inputMode="decimal"
              value={draft[row.id] ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, [row.id]: e.target.value }))}
              className="w-20 rounded border border-[#2e402a] bg-black/40 px-2 py-1 text-right text-sm text-white"
            />
            <button
              type="button"
              onClick={() => void save(row.id)}
              className="rounded px-2 py-1 text-xs font-semibold text-[#c49746]"
            >
              {t("admin.save")}
            </button>
            {row.branch_price !== null ? (
              <button
                type="button"
                onClick={() => void resetBase(row.id)}
                className="text-xs text-white/40 underline"
              >
                {t("branch.resetPrice")}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
