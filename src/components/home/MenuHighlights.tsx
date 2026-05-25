"use client";

import Image from "next/image";
import Link from "next/link";
import { MENU_HIGHLIGHTS } from "@/lib/menu-data";
import { formatEur } from "@/lib/format";
import { useI18n } from "@/components/providers/I18nProvider";

export function MenuHighlights() {
  const { t } = useI18n();

  return (
    <section className="mt-20 border-t border-[#2e402a] pt-16" id="speisekarte">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            {t("home.highlightsTitle")}
          </h2>
          <p className="mt-2 max-w-xl text-white/60">{t("home.highlightsIntro")}</p>
        </div>
        <Link
          href="/menu"
          className="text-sm font-semibold text-[#c49746] underline-offset-4 hover:underline"
        >
          {t("home.highlightsLink")}
        </Link>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {MENU_HIGHLIGHTS.map((item) => (
          <Link
            key={item.id}
            href={item.href ?? "/menu"}
            className="group flex flex-col overflow-hidden rounded-2xl border-2 border-[#2e402a] border-l-4 border-l-[#c49746] bg-[#0f0f0f] shadow-lg transition hover:border-[#c49746]/80 hover:shadow-[0_0_32px_-8px_rgba(196,151,70,0.35)]"
          >
            <div className="relative aspect-[16/10] w-full">
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 50vw, 380px"
                  unoptimized
                />
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#1a2218] via-[#0f140d] to-[#0a0a0a]"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            </div>
            <div className="flex flex-1 flex-col p-5">
              {item.badge && (
                <span
                  className="mb-2 inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "#2e402a", color: "#c49746" }}
                >
                  {item.badge}
                </span>
              )}
              <h3 className="font-display text-xl font-bold text-white group-hover:text-[#c49746]">
                {item.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{item.description}</p>
              <p className="mt-4 font-display text-lg font-bold" style={{ color: "#c49746" }}>
                {t("home.priceFrom")} {formatEur(item.priceFrom)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
