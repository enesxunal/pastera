"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";
import {
  PASTERA_ACTION_ITEMS,
  PASTERA_PHONE_DISPLAY,
  PASTERA_SOCIAL_ITEMS,
  PASTERA_WEBSITE_URL,
  type PasteraLinkItem,
} from "@/lib/pastera-links";
import {
  FacebookIcon,
  GoogleIcon,
  InstagramIcon,
  TikTokIcon,
} from "./ConnectSocialIcons";

const SOCIAL_STYLES: Record<
  string,
  {
    bg: string;
    ring: string;
    hoverGlow: string;
    Icon: typeof InstagramIcon;
    multicolor?: boolean;
  }
> = {
  instagram: {
    bg: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]",
    ring: "ring-[#ee2a7b]/40",
    hoverGlow: "hover:shadow-[0_0_28px_rgba(238,42,123,0.45)]",
    Icon: InstagramIcon,
  },
  facebook: {
    bg: "bg-[#1877F2]",
    ring: "ring-[#1877F2]/40",
    hoverGlow: "hover:shadow-[0_0_28px_rgba(24,119,242,0.45)]",
    Icon: FacebookIcon,
  },
  tiktok: {
    bg: "bg-gradient-to-br from-[#00f2ea] via-[#111] to-[#ff0050]",
    ring: "ring-white/20",
    hoverGlow: "hover:shadow-[0_0_28px_rgba(255,0,80,0.35)]",
    Icon: TikTokIcon,
  },
  google: {
    bg: "bg-white",
    ring: "ring-white/30",
    hoverGlow: "hover:shadow-[0_0_28px_rgba(66,133,244,0.4)]",
    Icon: GoogleIcon,
    multicolor: true,
  },
};

const ACTION_ICONS: Record<string, string> = {
  website: "🌐",
  menu: "🍝",
  qrMenu: "📋",
  builder: "✨",
  builderVegan: "🌱",
  phone: "📞",
};

function LinkAnchor({
  item,
  className,
  children,
}: {
  item: PasteraLinkItem;
  className: string;
  children: ReactNode;
}) {
  if (item.tel) {
    return (
      <a href={item.href} className={className}>
        {children}
      </a>
    );
  }
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={item.href} className={className}>
      {children}
    </Link>
  );
}

export function ConnectPageClient() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#080808] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(ellipse 90% 50% at 50% -5%, rgba(46,64,42,0.65) 0%, transparent 55%),
            radial-gradient(ellipse 70% 45% at 0% 100%, rgba(238,42,123,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 100% 80%, rgba(196,151,70,0.18) 0%, transparent 45%)`,
        }}
        aria-hidden
      />
      <div className="pastera-brand-bar" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-10 pt-10">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative h-14 w-40">
            <Image
              src="/pastera-Logo-beyaz.png"
              alt="Pastera"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.32em] text-[#c49746]">
            {t("connect.kicker")}
          </p>
        </div>

        {/* Sosyal medya — üstte, büyük marka logoları */}
        <section className="mt-8" aria-labelledby="connect-social-heading">
          <h2
            id="connect-social-heading"
            className="text-center font-display text-lg font-bold text-white"
          >
            {t("connect.socialTitle")}
          </h2>
          <p className="mt-1 text-center text-xs text-white/45">{t("connect.socialHint")}</p>

          <ul className="mt-5 grid grid-cols-4 gap-2.5">
            {PASTERA_SOCIAL_ITEMS.map((item) => {
              const style = SOCIAL_STYLES[item.id];
              const Icon = style.Icon;
              const label = t(`connect.links.${item.id}`);
              return (
                <li key={item.id}>
                  <LinkAnchor
                    item={item}
                    className={`group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-md transition duration-300 hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.97] ${style.hoverGlow}`}
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ring-2 sm:h-14 sm:w-14 sm:rounded-2xl ${style.bg} ${style.ring} transition group-hover:scale-105`}
                    >
                      <Icon
                        className={
                          style.multicolor
                            ? "h-6 w-6 sm:h-7 sm:w-7"
                            : "h-6 w-6 text-white drop-shadow-sm sm:h-7 sm:w-7"
                        }
                      />
                    </span>
                    <span className="text-center text-[10px] font-semibold leading-tight text-white/90 group-hover:text-white sm:text-[11px]">
                      {label}
                    </span>
                  </LinkAnchor>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Menü & sipariş */}
        <section className="mt-9 flex-1" aria-labelledby="connect-actions-heading">
          <h2
            id="connect-actions-heading"
            className="text-center font-display text-sm font-semibold uppercase tracking-widest text-white/40"
          >
            {t("connect.actionsTitle")}
          </h2>

          <ul className="mt-4 flex flex-col gap-2.5">
            {PASTERA_ACTION_ITEMS.map((item) => {
              const label = t(`connect.links.${item.id}`);
              const isPhone = item.id === "phone";
              const sub = isPhone
                ? PASTERA_PHONE_DISPLAY
                : item.id === "website"
                  ? PASTERA_WEBSITE_URL.replace(/^https?:\/\//, "")
                  : undefined;

              const cardClass = isPhone
                ? "group flex min-h-[3.5rem] items-center gap-3.5 rounded-2xl border border-[#c49746]/30 bg-gradient-to-r from-[#2e402a]/50 to-[#1a2218]/80 px-4 py-3 shadow-lg transition hover:border-[#c49746]/60 hover:from-[#2e402a]/70 active:scale-[0.99]"
                : "group flex min-h-[3.5rem] items-center gap-3.5 rounded-2xl border border-[#2e402a] bg-[#111]/90 px-4 py-3 transition hover:border-[#c49746]/50 hover:bg-[#141414] active:scale-[0.99]";

              return (
                <li key={item.id}>
                  <LinkAnchor item={item} className={cardClass}>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isPhone ? "bg-[#c49746]/20 text-lg" : "bg-[#2e402a]/80 text-lg"
                      }`}
                      aria-hidden
                    >
                      {ACTION_ICONS[item.id]}
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span
                        className={`block text-sm font-bold ${
                          isPhone ? "text-[#c49746]" : "text-white group-hover:text-[#c49746]"
                        }`}
                      >
                        {label}
                      </span>
                      {sub ? (
                        <span className="mt-0.5 block truncate text-xs text-white/45">{sub}</span>
                      ) : null}
                    </span>
                    <span className="text-sm text-white/25" aria-hidden>
                      →
                    </span>
                  </LinkAnchor>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-8 text-center text-[11px] text-white/25">
          © {new Date().getFullYear()} Pastera
        </p>
      </div>
    </div>
  );
}
