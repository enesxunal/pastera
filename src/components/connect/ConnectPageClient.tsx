"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  PASTERA_BIOLINK_ITEMS,
  PASTERA_PHONE_DISPLAY,
  PASTERA_WEBSITE_URL,
} from "@/lib/pastera-links";

const ICONS: Record<string, string> = {
  website: "🌐",
  menu: "🍝",
  builder: "✨",
  builderVegan: "🌱",
  phone: "📞",
  google: "⭐",
  instagram: "📸",
  facebook: "📘",
  tiktok: "🎵",
};

export function ConnectPageClient() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0a0a0a] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 55% at 50% -10%, rgba(46,64,42,0.55) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 100% 100%, rgba(196,151,70,0.2) 0%, transparent 50%)`,
        }}
        aria-hidden
      />
      <div className="pastera-brand-bar" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-12">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-16 w-44">
            <Image
              src="/pastera-Logo-beyaz.png"
              alt="Pastera"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#c49746]">
            {t("connect.kicker")}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">{t("connect.title")}</h1>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/55">{t("connect.intro")}</p>
        </div>

        <ul className="mt-10 flex flex-1 flex-col gap-3">
          {PASTERA_BIOLINK_ITEMS.map((item) => {
            const label = t(`connect.links.${item.id}`);
            const sub =
              item.id === "phone"
                ? PASTERA_PHONE_DISPLAY
                : item.id === "website"
                  ? PASTERA_WEBSITE_URL.replace(/^https?:\/\//, "")
                  : undefined;
            const className =
              "group flex min-h-[3.75rem] items-center gap-4 rounded-2xl border-2 border-[#2e402a] bg-[#111]/90 px-4 py-3 shadow-md transition hover:border-[#c49746]/60 hover:bg-[#141414] active:scale-[0.99]";

            const inner = (
              <>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2e402a]/80 text-xl"
                  aria-hidden
                >
                  {ICONS[item.id]}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block font-display text-sm font-bold text-white group-hover:text-[#c49746]">
                    {label}
                  </span>
                  {sub ? <span className="mt-0.5 block truncate text-xs text-white/45">{sub}</span> : null}
                </span>
                <span className="text-sm text-white/30" aria-hidden>
                  →
                </span>
              </>
            );

            if (item.tel) {
              return (
                <li key={item.id}>
                  <a href={item.href} className={className}>
                    {inner}
                  </a>
                </li>
              );
            }

            if (item.external) {
              return (
                <li key={item.id}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {inner}
                  </a>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <Link href={item.href} className={className}>
                  {inner}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-center text-[11px] text-white/30">© {new Date().getFullYear()} Pastera</p>
      </div>
    </div>
  );
}
