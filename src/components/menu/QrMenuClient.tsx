"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export const QR_MENU_PDF_PATH = "/pastera-menu-qr.pdf";

function prefersNativePdfViewer(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return isIOS;
}

export function QrMenuClient() {
  const { t } = useI18n();
  const [showEmbed, setShowEmbed] = useState(false);
  const pdfSrc = `${QR_MENU_PDF_PATH}#view=FitH&toolbar=0&navpanes=0`;

  useEffect(() => {
    if (prefersNativePdfViewer()) {
      window.location.replace(QR_MENU_PDF_PATH);
      return;
    }
    setShowEmbed(true);
  }, []);

  if (!showEmbed) {
    return <div className="fixed inset-0 bg-[#0a0a0a]" aria-busy="true" />;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a]">
      <iframe
        src={pdfSrc}
        title={t("qrMenu.title")}
        className="h-[100dvh] w-full border-0"
      />
    </div>
  );
}
