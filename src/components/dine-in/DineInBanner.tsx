"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadDineInContext, type DineInContext } from "@/lib/dine-in-context";
import { useI18n } from "@/components/providers/I18nProvider";

export function DineInBanner() {
  const { t } = useI18n();
  const [ctx, setCtx] = useState<DineInContext | null>(null);

  useEffect(() => {
    setCtx(loadDineInContext());
    const refresh = () => setCtx(loadDineInContext());
    window.addEventListener("pastera-dine-in-update", refresh);
    return () => window.removeEventListener("pastera-dine-in-update", refresh);
  }, []);

  if (!ctx) return null;

  return (
    <div className="border-b border-[#c49746]/30 bg-[#2e402a]/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm sm:px-6">
        <p className="font-medium text-[#c49746]">
          {t("dineIn.banner")}{" "}
          <span className="text-white">
            {t("dineIn.table")} {ctx.tableNumber}
          </span>
          <span className="ml-2 text-white/45">· {ctx.branchName}</span>
        </p>
        <Link href="/menu" className="text-xs font-semibold text-white/70 underline-offset-2 hover:text-white hover:underline">
          {t("dineIn.menu")}
        </Link>
      </div>
    </div>
  );
}
