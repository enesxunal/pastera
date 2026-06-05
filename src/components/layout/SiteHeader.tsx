"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";

const paths = [
  { href: "/", key: "start" as const },
  { href: "/menu", key: "menu" as const },
  { href: "/warenkorb", key: "cart" as const },
];

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6h15l-1.5 9H7.5L6 6Z" strokeLinejoin="round" />
      <path d="M6 6 5 3H2" strokeLinecap="round" />
      <circle cx="9" cy="20" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SiteHeader() {
  const { locale, setLocale, t } = useI18n();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  const langButtons = (
    <div className="flex items-center gap-1" aria-label={t("lang.aria")}>
      <button
        type="button"
        onClick={() => setLocale("de")}
        className={`flex min-h-11 min-w-11 items-center justify-center rounded-full text-sm font-semibold transition hover:bg-forest/40 ${
          locale === "de" ? "text-[#c49746]" : "text-white/40"
        }`}
      >
        {t("lang.de")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("tr")}
        className={`flex min-h-11 min-w-11 items-center justify-center rounded-full text-sm font-semibold transition hover:bg-forest/40 ${
          locale === "tr" ? "text-[#c49746]" : "text-white/40"
        }`}
      >
        {t("lang.tr")}
      </button>
    </div>
  );

  const authLinks = !loading && user ? (
    <Link
      href="/auth/account"
      onClick={closeMenu}
      className="flex min-h-11 items-center rounded-full px-4 text-sm text-[#c49746] transition hover:bg-forest/40"
    >
      {t("auth.myAccount")}
    </Link>
  ) : !loading ? (
    <>
      <Link
        href="/auth/login"
        onClick={closeMenu}
        className="flex min-h-11 items-center rounded-full px-4 text-sm text-white/75 transition hover:bg-forest/40 hover:text-white"
      >
        {t("auth.loginLink")}
      </Link>
      <Link
        href="/auth/register"
        onClick={closeMenu}
        className="flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-[#0a0a0a] transition hover:opacity-90"
        style={{ backgroundColor: "#c49746" }}
      >
        {t("auth.registerLink")}
      </Link>
    </>
  ) : null;

  const mobileMenu =
    menuOpen && portalReady
      ? createPortal(
          <div className="fixed inset-0 z-[200] md:hidden" role="presentation">
            <button
              type="button"
              className="absolute inset-0 bg-[#050505]/92"
              aria-label={t("nav.menuClose")}
              onClick={closeMenu}
            />
            <nav
              className="relative z-[1] max-h-[85dvh] overflow-y-auto border-b-2 border-[#2e402a] bg-[#0a0a0a] px-4 py-5 shadow-2xl"
              style={{
                marginTop: "4rem",
                paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
              }}
              aria-label={t("nav.menuOpen")}
            >
              <ul className="flex flex-col gap-2">
                {paths.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="flex min-h-12 items-center rounded-xl bg-[#141414] px-4 text-base font-semibold text-white transition active:bg-[#1c1c1c]"
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
              {authLinks ? (
                <div className="mt-5 flex flex-col gap-2 rounded-xl border border-[#2e402a] bg-[#111] p-3">
                  <p className="px-1 text-xs font-semibold uppercase tracking-widest text-[#c49746]">
                    {t("footer.account")}
                  </p>
                  {authLinks}
                </div>
              ) : null}
            </nav>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
    <header className="relative z-20 border-b border-[#2e402a] bg-matte/90 backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c49746]/40 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
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

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Masaüstü navigasyon */}
          <nav className="hidden items-center gap-0.5 md:flex md:gap-1">
            {paths.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-full px-3 py-2 text-sm text-white/85 transition-colors hover:bg-forest/40 hover:text-white lg:px-4"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 border-l border-[#2e402a]/60 pl-2 md:flex">
            {authLinks}
          </div>

          {langButtons}

          {/* Mobil: sepet ikonu */}
          <Link
            href="/warenkorb"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-white/85 transition hover:bg-forest/40 md:hidden"
            aria-label={t("nav.cartAria")}
          >
            <CartIcon />
          </Link>

          {/* Mobil: menü düğmesi */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 rounded-full text-white/85 transition hover:bg-forest/40 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
          >
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition-opacity ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </header>
    {mobileMenu}
    </>
  );
}
