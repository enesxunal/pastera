"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";

export function OnlineOrderingPausedClient() {
  const { t } = useI18n();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-[#c49746]">
        {t("ordering.pausedKicker")}
      </p>
      <h1 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
        {t("ordering.pausedTitle")}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
        {t("ordering.pausedBody")}
      </p>
      <Link
        href="/menu"
        className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-bold text-[#0a0a0a]"
        style={{ backgroundColor: "#c49746" }}
      >
        {t("ordering.pausedCta")}
      </Link>
      <Link href="/" className="mt-4 text-sm text-white/45 hover:text-[#c49746]">
        {t("nav.start")}
      </Link>
    </div>
  );
}
