"use client";

import { useI18n } from "@/components/providers/I18nProvider";
import type { OrderRow } from "@/lib/order-types";
import { printOrderReceipt } from "@/lib/print-order-receipt";

type Props = {
  order: OrderRow;
  branchName: string;
  className?: string;
  autoPrint?: boolean;
};

export function PrintReceiptButton({ order, branchName, className, autoPrint }: Props) {
  const { locale, t } = useI18n();

  return (
    <button
      type="button"
      onClick={() => {
        printOrderReceipt(order, { branchName, locale, autoPrint: autoPrint ?? false });
      }}
      className={
        className ??
        "rounded-full border border-[#2e402a] px-3 py-1.5 text-xs font-semibold text-white/70 hover:border-[#c49746]/50 hover:text-[#c49746]"
      }
    >
      {t("receipt.print")}
    </button>
  );
}
