"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";
import { saveDineInContext } from "@/lib/dine-in-context";

type Props = {
  branchId: string;
  branchSlug: string;
  branchName: string;
  tableNumber: string;
};

export function MasaEntryClient({ branchId, branchSlug, branchName, tableNumber }: Props) {
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    saveDineInContext({
      branchId,
      branchSlug,
      branchName,
      tableNumber,
    });
    router.replace("/menu");
  }, [branchId, branchSlug, branchName, tableNumber, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24">
      <p className="text-center text-white/50">{t("dineIn.loading")}</p>
    </div>
  );
}
