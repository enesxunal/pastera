"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import type { ReactNode } from "react";

export function MenuPageFrame({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div
        className="mb-8 inline-block rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0a0a0a]"
        style={{ backgroundColor: "#c49746" }}
      >
        {t("menuHub.badge")}
      </div>
      {children}
    </div>
  );
}
