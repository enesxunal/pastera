"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto border-t border-[#2e402a] bg-matte/95">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c49746]/30 to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Image
              src="/pastera-Logo-beyaz.png"
              alt="Pastera"
              width={100}
              height={30}
              className="h-7 w-auto opacity-90"
            />
            <p className="mt-3 max-w-xs text-sm text-white/45">{t("footer.tagline")}</p>
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-4 text-sm">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#c49746]">
                {t("footer.explore")}
              </p>
              <ul className="space-y-1.5 text-white/60">
                <li>
                  <Link href="/menu" className="hover:text-white">
                    {t("nav.menu")}
                  </Link>
                </li>
                <li>
                  <Link href="/builder" className="hover:text-white">
                    {t("nav.pasta")}
                  </Link>
                </li>
                <li>
                  <Link href="/lieferung" className="hover:text-white">
                    {t("footer.delivery")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#c49746]">
                {t("footer.account")}
              </p>
              <ul className="space-y-1.5 text-white/60">
                <li>
                  <Link href="/auth/login" className="hover:text-white">
                    {t("auth.loginLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-white">
                    {t("auth.registerLink")}
                  </Link>
                </li>
                <li>
                  <Link href="/auth/account" className="hover:text-white">
                    {t("footer.myAccount")}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <p className="mt-8 border-t border-[#2e402a]/60 pt-6 text-center text-xs text-white/35">
          © {year} Pastera · {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
