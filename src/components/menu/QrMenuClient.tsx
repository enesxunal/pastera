"use client";

import { useI18n } from "@/components/providers/I18nProvider";

export const QR_MENU_PDF_PATH = "/pastera-menu-qr.pdf";

export function QrMenuClient() {
  const { t } = useI18n();
  const pdfSrc = `${QR_MENU_PDF_PATH}#view=FitH&toolbar=0&navpanes=0`;

  return (
    <div className="w-full">
      <iframe
        src={pdfSrc}
        title={t("qrMenu.title")}
        className="min-h-[75dvh] w-full border-0 bg-[#111] sm:min-h-[80dvh]"
      />
    </div>
  );
}
