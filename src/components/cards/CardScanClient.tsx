"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { formatPcoin } from "@/lib/format-pcoin";
import type { MembershipTier } from "@/lib/membership";

type CardPayload =
  | { ok: false; error: string }
  | { ok: true; view: "revoked"; cardCode: string }
  | { ok: true; view: "unassigned" | "admin_unassigned"; cardCode: string; cardTier: "gold" | "black" }
  | {
      ok: true;
      view: "public";
      cardCode: string;
      cardTier: "gold" | "black";
      displayName: string;
    }
  | {
      ok: true;
      view: "owner";
      cardCode: string;
      cardTier: "gold" | "black";
      fullName: string | null;
      membershipTier: MembershipTier;
      discountPercent: number;
      loyaltyPoints: number;
    }
  | {
      ok: true;
      view: "admin";
      cardCode: string;
      cardTier: "gold" | "black";
      cardStatus: string;
      member: {
        id: string;
        fullName: string | null;
        email: string | null;
        phone: string | null;
        loyaltyPoints: number;
        membershipTier: MembershipTier;
        discountPercent: number;
      };
    };

function tierStyles(tier: "gold" | "black") {
  if (tier === "black") {
    return {
      bg: "from-[#0a0a0a] via-[#141414] to-[#0a0a0a]",
      border: "border-white/15",
      accent: "text-white",
      badge: "bg-white text-black",
      glow: "shadow-[0_0_60px_rgba(255,255,255,0.08)]",
      label: "BLACK VIP MEMBER",
    };
  }
  return {
    bg: "from-[#1a1408] via-[#2a2010] to-[#0f0c06]",
    border: "border-[#c49746]/50",
    accent: "text-[#e8c872]",
    badge: "bg-gradient-to-r from-[#c49746] to-[#e8c872] text-[#0a0a0a]",
    glow: "shadow-[0_0_60px_rgba(196,151,70,0.25)]",
    label: "GOLD VIP MEMBER",
  };
}

function VipCardShell({
  tier,
  children,
}: {
  tier: "gold" | "black";
  children: ReactNode;
}) {
  const s = tierStyles(tier);
  return (
    <div
      className={`relative mx-auto w-full max-w-sm overflow-hidden rounded-3xl border-2 ${s.border} bg-gradient-to-br ${s.bg} p-8 ${s.glow}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            tier === "black"
              ? "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.12), transparent 50%)"
              : "radial-gradient(circle at 80% 0%, rgba(196,151,70,0.35), transparent 55%)",
        }}
        aria-hidden
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function CardScanClient({ code }: { code: string }) {
  const { t } = useI18n();
  const [data, setData] = useState<CardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch(`/api/cards/${encodeURIComponent(code)}`, { credentials: "include" })
      .then(async (r) => {
        const j = (await r.json()) as CardPayload;
        setData(j);
      })
      .catch(() => setData({ ok: false, error: "network" }))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-white/50">
        {t("membership.loading")}
      </div>
    );
  }

  if (!data || !data.ok) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-white/60">{t("membership.notFound")}</p>
      </div>
    );
  }

  if (data.view === "revoked") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="font-display text-xl font-bold text-white">{t("membership.revokedTitle")}</p>
        <p className="mt-2 text-sm text-white/50">{t("membership.revokedHint")}</p>
      </div>
    );
  }

  if (data.view === "unassigned" || data.view === "admin_unassigned") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <VipCardShell tier={data.cardTier}>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">PASTERA</p>
          <p className={`mt-4 font-display text-lg font-bold ${tierStyles(data.cardTier).accent}`}>
            {data.cardTier === "black" ? "BLACK" : "GOLD"} · {t("membership.unassigned")}
          </p>
          <p className="mt-3 font-mono text-xs text-white/35">{data.cardCode}</p>
        </VipCardShell>
        {data.view === "admin_unassigned" ? (
          <p className="mt-6 text-sm text-[#c49746]">{t("membership.adminAssignHint")}</p>
        ) : (
          <p className="mt-6 text-sm text-white/45">{t("membership.unassignedHint")}</p>
        )}
      </div>
    );
  }

  if (data.view === "admin") {
    const s = tierStyles(data.cardTier);
    const m = data.member;
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[#c49746]">
          {t("membership.adminScanTitle")}
        </p>
        <VipCardShell tier={data.cardTier}>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">PASTERA</p>
          <p className={`mt-3 font-display text-sm font-bold ${s.accent}`}>{s.label}</p>
          <p className="mt-6 font-display text-2xl font-bold text-white">
            {m.fullName?.trim() || "—"}
          </p>
          <dl className="mt-8 space-y-3 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <dt className="text-white/45">{t("membership.discount")}</dt>
              <dd className="font-bold text-[#c49746]">{m.discountPercent}%</dd>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <dt className="text-white/45">{t("auth.pointsLabel")}</dt>
              <dd className="text-white">{formatPcoin(m.loyaltyPoints)} P Coin</dd>
            </div>
            {m.phone ? (
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-white/45">{t("delivery.phone")}</dt>
                <dd className="text-white">{m.phone}</dd>
              </div>
            ) : null}
            {m.email ? (
              <div className="flex justify-between pb-2">
                <dt className="text-white/45">E-Mail</dt>
                <dd className="truncate pl-4 text-white">{m.email}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-6 font-mono text-[10px] text-white/30">{data.cardCode}</p>
        </VipCardShell>
      </div>
    );
  }

  if (data.view === "owner") {
    const s = tierStyles(data.cardTier);
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <VipCardShell tier={data.cardTier}>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">PASTERA</p>
          <span className={`mt-4 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${s.badge}`}>
            {s.label}
          </span>
          <p className="mt-8 font-display text-3xl font-bold text-white">
            {data.fullName?.trim() || "VIP"}
          </p>
          <p className="mt-6 text-sm text-white/55">
            {t("membership.yourDiscount")}:{" "}
            <span className="font-bold text-[#c49746]">{data.discountPercent}%</span>
          </p>
          <p className="mt-2 text-sm text-white/45">
            {formatPcoin(data.loyaltyPoints)} P Coin
          </p>
        </VipCardShell>
        <p className="mt-8 text-center text-xs text-white/35">{t("membership.ownerHint")}</p>
      </div>
    );
  }

  if (data.view === "public") {
    const s = tierStyles(data.cardTier);
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <VipCardShell tier={data.cardTier}>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/40">PASTERA</p>
          <span
            className={`mt-4 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${s.badge}`}
          >
            {s.label}
          </span>
          <p className="mt-10 font-display text-3xl font-bold text-white">{data.displayName}</p>
          <p className="mt-4 text-sm text-white/40">{t("membership.publicHint")}</p>
        </VipCardShell>
      </div>
    );
  }

  return null;
}
