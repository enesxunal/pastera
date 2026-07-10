"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { useI18n } from "@/components/providers/I18nProvider";
import type { NfcCardTier } from "@/lib/membership";

type CardRow = {
  id: string;
  card_code: string;
  tier: NfcCardTier;
  status: string;
  user_id: string | null;
  assigned_at: string | null;
  scanUrl: string;
  member: { id: string; full_name: string | null; email: string | null } | null;
};

type MemberOption = { id: string; full_name: string | null; email: string | null };

export function AdminCardsClient() {
  const { t } = useI18n();
  const router = useRouter();
  const [cards, setCards] = useState<CardRow[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [assignUser, setAssignUser] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);

  const load = useCallback(async () => {
    const [cardsRes, membersRes] = await Promise.all([
      fetch("/api/admin/cards"),
      fetch("/api/admin/members"),
    ]);
    if (cardsRes.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const cardsJson = (await cardsRes.json()) as {
      cards?: CardRow[];
      needsMigration?: boolean;
      error?: string;
    };
    const membersJson = (await membersRes.json()) as { members?: MemberOption[] };

    setNeedsMigration(!!cardsJson.needsMigration);
    setCards(cardsJson.cards ?? []);
    setMembers(
      (membersJson.members ?? []).map((m) => ({
        id: m.id,
        full_name: m.full_name,
        email: m.email,
      })),
    );

    const nextAssign: Record<string, string> = {};
    for (const c of cardsJson.cards ?? []) {
      if (c.user_id) nextAssign[c.card_code] = c.user_id;
    }
    setAssignUser(nextAssign);
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveAssignment(code: string) {
    const userId = assignUser[code];
    if (!userId) return;
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/cards/${encodeURIComponent(code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign", userId }),
    });
    setBusy(false);
    if (!res.ok) {
      setMsg(t("admin.cardsError"));
      return;
    }
    setMsg(t("admin.cardsSaved"));
    void load();
  }

  async function unassign(code: string) {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/cards/${encodeURIComponent(code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unassign" }),
    });
    setBusy(false);
    if (!res.ok) {
      setMsg(t("admin.cardsError"));
      return;
    }
    setMsg(t("admin.cardsSaved"));
    void load();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <AdminNav />
      <h1 className="font-display text-3xl font-bold text-white">{t("admin.cardsTitle")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("admin.cardsHint")}</p>

      {needsMigration ? (
        <p className="mt-6 rounded-xl border border-amber-900/40 bg-amber-950/30 p-4 text-sm text-amber-200/90">
          {t("membership.dbSetupHint")}
        </p>
      ) : null}

      {msg ? <p className="mt-4 text-sm text-[#c49746]">{msg}</p> : null}

      <ul className="mt-10 space-y-3">
        {cards.length === 0 && !needsMigration ? (
          <li className="py-12 text-center text-white/40">{t("admin.cardsEmpty")}</li>
        ) : (
          cards.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-4 rounded-xl border border-[#2e402a] bg-[#111] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-white">{c.card_code}</p>
                <p className="mt-0.5 text-xs uppercase tracking-wider text-[#c49746]">
                  {c.tier === "black" ? "Black VIP · %20" : "Gold VIP · %10"}
                  {c.member ? ` · ${c.member.full_name || c.member.email}` : ` · ${t("membership.unassigned")}`}
                </p>
                <a
                  href={c.scanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block truncate text-[11px] text-white/35 hover:text-[#c49746]"
                >
                  {c.scanUrl}
                </a>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[280px]">
                <select
                  value={assignUser[c.card_code] ?? ""}
                  onChange={(e) =>
                    setAssignUser((prev) => ({ ...prev, [c.card_code]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2.5 text-sm text-white"
                >
                  <option value="">{t("admin.cardsPickMember")}</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name || m.email || m.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy || !assignUser[c.card_code]}
                    onClick={() => void saveAssignment(c.card_code)}
                    className="flex-1 rounded-full px-4 py-2 text-xs font-bold text-[#0a0a0a] disabled:opacity-50"
                    style={{ backgroundColor: "#c49746" }}
                  >
                    {t("admin.cardsAssignBtn")}
                  </button>
                  {c.status === "active" ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void unassign(c.card_code)}
                      className="rounded-full border border-[#2e402a] px-3 py-2 text-xs text-white/60"
                    >
                      {t("admin.cardsUnassign")}
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
