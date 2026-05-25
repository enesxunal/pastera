"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { isAutoPrintEnabled, setAutoPrintEnabled } from "@/lib/print-order-receipt";
import { RECEIPT_WIDTH_MM } from "@/lib/receipt-config";

export function AutoPrintToggle() {
  const { t } = useI18n();
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isAutoPrintEnabled());
  }, []);

  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-white/55">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => {
          const v = e.target.checked;
          setOn(v);
          setAutoPrintEnabled(v);
        }}
        className="rounded border-[#2e402a]"
      />
      {t("receipt.autoPrint")} ({RECEIPT_WIDTH_MM} mm)
    </label>
  );
}
