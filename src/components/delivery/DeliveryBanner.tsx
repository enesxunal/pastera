"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadDeliveryContext, type DeliveryContext } from "@/lib/delivery-context";
import { useI18n } from "@/components/providers/I18nProvider";

export function DeliveryBanner() {
  const { t } = useI18n();
  const [ctx, setCtx] = useState<DeliveryContext | null>(null);

  useEffect(() => {
    setCtx(loadDeliveryContext());
    const refresh = () => setCtx(loadDeliveryContext());
    window.addEventListener("pastera-delivery-update", refresh);
    return () => window.removeEventListener("pastera-delivery-update", refresh);
  }, []);

  if (!ctx) return null;

  const address = [ctx.street, ctx.postal, ctx.city].filter(Boolean).join(", ");

  return (
    <div className="border-b border-[#c49746]/30 bg-[#1a2418]/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm sm:px-6">
        <p className="min-w-0 break-words font-medium text-[#c49746]">
          {t("delivery.banner")}{" "}
          <span className="text-white">{address}</span>
          <span className="ml-2 text-white/45">
            · {ctx.branchName} · {ctx.distanceKm} km
          </span>
        </p>
        <div className="flex gap-3">
          <Link href="/menu" className="text-xs font-semibold text-white/70 hover:text-white hover:underline">
            {t("delivery.menu")}
          </Link>
          <Link href="/lieferung" className="text-xs text-white/45 hover:text-white hover:underline">
            {t("delivery.change")}
          </Link>
        </div>
      </div>
    </div>
  );
}
