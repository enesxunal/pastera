import type { SupportedLocale } from "@/lib/cart";
import type { OrderRow } from "@/lib/order-types";
import { buildReceiptFromOrder, receiptToPlainLines } from "@/lib/build-receipt";
import { RECEIPT_WIDTH_MM, receiptPrintableWidthMm } from "@/lib/receipt-config";

export type PrintReceiptOptions = {
  branchName: string;
  locale: SupportedLocale;
  /** true = yazdırma penceresi açılır (sessiz yazıcı için kullanıcı bir kez termal seçer) */
  autoPrint?: boolean;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildReceiptHtml(plainLines: string[], widthMm: number): string {
  const body = plainLines
    .map((l) => `<div class="line">${escapeHtml(l) || "&nbsp;"}</div>`)
    .join("");
  const printableMm = receiptPrintableWidthMm(widthMm as 58 | 80);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <title>Pastera Fiş</title>
  <style>
    @page { size: ${widthMm}mm auto; margin: 2mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: ${printableMm}mm;
      max-width: ${printableMm}mm;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.35;
      color: #000;
      background: #fff;
      padding: 2mm;
    }
    .line { white-space: pre; overflow: hidden; }
    @media print {
      body { width: ${printableMm}mm; }
    }
  </style>
</head>
<body>${body}</body>
</html>`;
}

/** Termal fiş — yeni pencerede açar; autoPrint ile doğrudan yazdırma diyaloğu */
export function printOrderReceipt(order: OrderRow, options: PrintReceiptOptions): boolean {
  if (typeof window === "undefined") return false;

  const payload = buildReceiptFromOrder(order, options.branchName, options.locale);
  const lines = receiptToPlainLines(payload, options.locale, RECEIPT_WIDTH_MM);
  const html = buildReceiptHtml(lines, RECEIPT_WIDTH_MM);

  const win = window.open("", "_blank", "width=400,height=720");
  if (!win) {
    alert(
      options.locale === "de"
        ? "Pop-up blockiert — bitte Pop-ups erlauben."
        : "Açılır pencere engellendi — lütfen izin verin.",
    );
    return false;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();

  const doPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      /* ignore */
    }
  };

  if (options.autoPrint) {
    win.onload = () => {
      setTimeout(doPrint, 250);
    };
    if (win.document.readyState === "complete") {
      setTimeout(doPrint, 250);
    }
  }

  return true;
}

export function isAutoPrintEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("pastera_auto_print") !== "0";
}

export function setAutoPrintEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("pastera_auto_print", enabled ? "1" : "0");
}
