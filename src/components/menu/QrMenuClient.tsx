"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/providers/I18nProvider";

export const QR_MENU_PDF_PATH = "/pastera-menu-qr.pdf";

export function QrMenuClient() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-dvh flex-col bg-[#080808]">
      <header className="shrink-0 border-b border-[#2e402a]/80 bg-[#0a0a0a]/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link href="/" className="shrink-0">
            <Image
              src="/pastera-Logo-beyaz.png"
              alt="Pastera"
              width={96}
              height={28}
              className="h-6 w-auto opacity-90"
            />
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={QR_MENU_PDF_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#2e402a] px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-[#c49746]/50 hover:text-[#c49746]"
            >
              {t("qrMenu.openPdf")}
            </a>
            <a
              href={QR_MENU_PDF_PATH}
              download="Pastera-Menu.pdf"
              className="rounded-full px-3 py-1.5 text-xs font-bold text-[#0a0a0a]"
              style={{ backgroundColor: "#c49746" }}
            >
              {t("qrMenu.download")}
            </a>
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-5xl text-center text-xs text-white/40 sm:text-left">
          {t("qrMenu.hint")}
        </p>
      </header>

      <div className="relative min-h-0 flex-1">
        <iframe
          src={`${QR_MENU_PDF_PATH}#view=FitH`}
          title={t("qrMenu.title")}
          className="absolute inset-0 h-full w-full border-0 bg-[#111]"
        />
      </div>
    </div>
  );
}
