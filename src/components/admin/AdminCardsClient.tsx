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
  const [newCode, setNewCode] = useState("kart-002");
  const [newTier, setNewTier] = useState<NfcCardTier>("gold");
  const [assignUser, setAssignUser] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [cardsRes, membersRes] = await Promise.all([
      fetch("/api/admin/cards"),
      fetch("/api/admin/members"),
    ]);
    if (cardsRes.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const cardsJson = (await cardsRes.json()) as { cards?: CardRow[] };
    const membersJson = (await membersRes.json()) as { members?: MemberOption[] };
    setCards(cardsJson.cards ?? []);
    setMembers(
      (membersJson.members ?? []).map((m) => ({
        id: m.id,
        full_name: m.full_name,
        email: m.email,
      })),
    );
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createCard() {
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardCode: newCode, tier: newTier }),
    });
    const j = (await res.json()) as { ok?: boolean; error?: string };
    setBusy(false);
    if (!j.ok) {
      setMsg(j.error === "duplicate_code" ? t("admin.cardsDuplicate") : t("admin.cardsError"));
      return;
    }
    setMsg(t("admin.cardsCreated"));
    void load();
  }

  async function cardAction(code: string, action: "assign" | "unassign" | "revoke", userId?: string) {
    setBusy(true);
    setMsg("");
    const res = await fetch(`/api/admin/cards/${encodeURIComponent(code)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId }),
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

      <div className="mt-8 rounded-2xl border border-[#2e402a] bg-[#111] p-5">
        <h2 className="font-display text-lg font-bold text-[#c49746]">{t("admin.cardsCreate")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="kart-002"
            className="rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 text-sm text-white"
          />
          <select
            value={newTier}
            onChange={(e) => setNewTier(e.target.value as NfcCardTier)}
            className="rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 text-sm text-white"
          >
            <option value="gold">Gold VIP</option>
            <option value="black">Black VIP</option>
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={() => void createCard()}
            className="rounded-full px-5 py-2 text-sm font-bold text-[#0a0a0a] disabled:opacity-50"
            style={{ backgroundColor: "#c49746" }}
          >
            {t("admin.cardsCreateBtn")}
          </button>
        </div>
      </div>

      {msg ? <p className="mt-4 text-sm text-[#c49746]">{msg}</p> : null}

      <ul className="mt-8 space-y-4">
        {cards.map((c) => (
          <li key={c.id} className="rounded-xl border border-[#2e402a] bg-[#111] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-bold text-white">{c.card_code}</p>
                <p className="mt-1 text-sm uppercase tracking-wider text-[#c49746]">
                  {c.tier === "black" ? "Black VIP" : "Gold VIP"} · {c.status}
                </p>
                {c.member ? (
                  <p className="mt-2 text-sm text-white/70">
                    {c.member.full_name || c.member.email}
                  </p>
                ) : null}
                <a
                  href={c.scanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-[#c49746] underline"
                >
                  {c.scanUrl}
                </a>
              </div>
            </div>

            {c.status === "unassigned" ? (
              <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-[#2e402a] pt-4">
                <label className="block text-xs text-white/45">
                  {t("admin.cardsAssignMember")}
                  <select
                    value={assignUser[c.card_code] ?? ""}
                    onChange={(e) =>
                      setAssignUser((prev) => ({ ...prev, [c.card_code]: e.target.value }))
                    }
                    className="mt-1 block w-full min-w-[200px] rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 text-sm text-white"
                  >
                    <option value="">—</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name || m.email || m.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  disabled={busy || !assignUser[c.card_code]}
                  onClick={() =>
                    void cardAction(c.card_code, "assign", assignUser[c.card_code])
                  }
                  className="rounded-full px-4 py-2 text-xs font-bold text-[#0a0a0a] disabled:opacity-50"
                  style={{ backgroundColor: "#c49746" }}
                >
                  {t("admin.cardsAssignBtn")}
                </button>
              </div>
            ) : null}

            {c.status === "active" ? (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-[#2e402a] pt-4">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void cardAction(c.card_code, "unassign")}
                  className="rounded-full border border-[#2e402a] px-4 py-2 text-xs text-white/70"
                >
                  {t("admin.cardsUnassign")}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void cardAction(c.card_code, "revoke")}
                  className="rounded-full border border-red-900/50 px-4 py-2 text-xs text-red-300/80"
                >
                  {t("admin.cardsRevoke")}
                </button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
