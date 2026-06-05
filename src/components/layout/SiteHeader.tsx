"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";

const paths = [
  { href: "/", key: "start" as const },
  { href: "/menu", key: "menu" as const },
  { href: "/warenkorb", key: "cart" as const },
];

export function SiteHeader() {
  const { locale, setLocale, t } = useI18n();
  const { user, loading } = useAuth();

  return (
    <header className="relative z-20 border-b border-[#2e402a] bg-matte/90 backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c49746]/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90">
          <Image
            src="/pastera-Logo-beyaz.png"
            alt="Pastera"
            width={120}
            height={36}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-0.5 sm:gap-1">
            {paths.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-2 py-2 text-xs text-white/85 transition-colors hover:bg-forest/40 hover:text-white sm:px-4 sm:text-sm"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 border-l border-[#2e402a]/60 pl-2 sm:flex">
            {!loading && user ? (
              <Link
                href="/auth/account"
                className="rounded-full px-3 py-1.5 text-xs text-[#c49746] transition hover:bg-forest/40"
              >
                {t("auth.myAccount")}
              </Link>
            ) : !loading ? (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-full px-3 py-1.5 text-xs text-white/75 transition hover:bg-forest/40 hover:text-white"
                >
                  {t("auth.loginLink")}
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-[#0a0a0a] transition hover:opacity-90"
                  style={{ backgroundColor: "#c49746" }}
                >
                  {t("auth.registerLink")}
                </Link>
              </>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 border-l border-[#2e402a]/60 pl-2 text-[10px] sm:pl-3 sm:text-[11px]" aria-label={t("lang.aria")}>
            <button
              type="button"
              onClick={() => setLocale("de")}
              className={`px-1 py-0.5 transition hover:text-white/80 ${
                locale === "de" ? "text-[#c49746]" : "text-white/35"
              }`}
            >
              {t("lang.de")}
            </button>
            <span className="text-white/20">·</span>
            <button
              type="button"
              onClick={() => setLocale("tr")}
              className={`px-1 py-0.5 transition hover:text-white/80 ${
                locale === "tr" ? "text-[#c49746]" : "text-white/35"
              }`}
            >
              {t("lang.tr")}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
