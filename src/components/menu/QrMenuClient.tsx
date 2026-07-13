"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export const QR_MENU_PDF_PATH = "/pastera-menu-qr.pdf";

type RenderedPage = {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
};

export function QrMenuClient() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(0);
  const busyRef = useRef(false);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const renderPdf = useCallback(async () => {
    const container = containerRef.current;
    if (!container || busyRef.current) return;

    const width = container.clientWidth;
    if (width < 1) return;
    if (Math.abs(width - lastWidthRef.current) < 2 && lastWidthRef.current > 0) return;

    busyRef.current = true;
    lastWidthRef.current = width;

    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const doc = await pdfjs.getDocument(QR_MENU_PDF_PATH).promise;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rendered: RenderedPage[] = [];

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const base = page.getViewport({ scale: 1 });
        const scale = (width / base.width) * dpr;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        await page.render({ canvasContext: ctx, viewport }).promise;

        rendered.push({
          pageNumber: i,
          dataUrl: canvas.toDataURL("image/jpeg", 0.9),
          width: Math.floor(viewport.width / dpr),
          height: Math.floor(viewport.height / dpr),
        });
      }

      setPages(rendered);
      setError(false);
      setLoading(false);
    } catch {
      setError(true);
      setLoading(false);
    } finally {
      busyRef.current = false;
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void renderPdf();
      }, 100);
    };

    schedule();

    const observer = new ResizeObserver(schedule);
    observer.observe(container);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [renderPdf]);

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-3xl px-3 sm:px-4">
      {loading ? (
        <p className="py-20 text-center text-sm text-white/45">{t("qrMenu.loading")}</p>
      ) : error ? (
        <p className="py-20 text-center text-sm text-white/50">{t("qrMenu.error")}</p>
      ) : (
        <div className="flex flex-col gap-2 py-4 sm:gap-3 sm:py-6">
          {pages.map((page) => (
            <img
              key={page.pageNumber}
              src={page.dataUrl}
              alt={`${t("qrMenu.title")} — ${page.pageNumber}`}
              width={page.width}
              height={page.height}
              className="h-auto w-full bg-white shadow-sm"
              loading={page.pageNumber <= 2 ? "eager" : "lazy"}
              decoding="async"
            />
          ))}
        </div>
      )}
    </div>
  );
}
