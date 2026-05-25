"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { clearDeliveryContext, loadDeliveryContext } from "@/lib/delivery-context";
import { loadDineInContext } from "@/lib/dine-in-context";

export function ErfolgClient() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [mode, setMode] = useState<"dine_in" | "delivery" | "web">("web");

  useEffect(() => {
    const fromUrl = searchParams.get("id");
    const fromStorage =
      typeof window !== "undefined" ? sessionStorage.getItem("pastera-order-short-id") : null;
    setOrderId(fromUrl || fromStorage);
    if (loadDineInContext()) setMode("dine_in");
    else if (loadDeliveryContext()) {
      setMode("delivery");
      clearDeliveryContext();
    } else setMode("web");
    if (fromStorage) sessionStorage.removeItem("pastera-order-short-id");
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <div
        className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-[#0a0a0a]"
        style={{ backgroundColor: "#c49746" }}
      >
        ✓
      </div>
      <h1 className="font-display text-3xl font-bold text-white">{t("success.title")}</h1>
      {orderId ? (
        <p className="mt-4 font-display text-2xl font-bold tracking-wider text-[#c49746]">
          {t("success.orderNo")} {orderId}
        </p>
      ) : null}
      <p className="mt-4 text-white/60">
        {mode === "dine_in"
          ? t("success.bodyDineIn")
          : mode === "delivery"
            ? t("success.bodyDelivery")
            : t("success.bodyWeb")}
      </p>
      {mode === "web" ? (
        <p className="mt-2 text-xs text-white/40">{t("success.demoNote")}</p>
      ) : null}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/menu"
          className="inline-flex justify-center rounded-full px-8 py-3 font-display text-sm font-bold text-[#0a0a0a]"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("success.ctaMenu")}
        </Link>
        <Link
          href="/"
          className="inline-flex justify-center rounded-full border-2 border-[#2e402a] px-8 py-3 text-sm font-semibold text-white/85 hover:border-[#c49746]/45"
        >
          {t("success.ctaHome")}
        </Link>
      </div>
    </div>
  );
}
