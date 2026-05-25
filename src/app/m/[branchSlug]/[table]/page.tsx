import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MasaEntryClient } from "@/components/dine-in/MasaEntryClient";
import type { SupportedLocale } from "@/lib/cart";
import { getBranchBySlug } from "@/lib/branches-server";
import { message } from "@/lib/i18n";

type Props = {
  params: { branchSlug: string; table: string };
};

export default async function MasaEntryPage({ params }: Props) {
  const tableNumber = decodeURIComponent(params.table).trim();
  if (!tableNumber) redirect("/menu");

  const branch = await getBranchBySlug(params.branchSlug);
  if (!branch) {
    const locale = (cookies().get("pastera-locale")?.value === "tr" ? "tr" : "de") as SupportedLocale;
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-white/60">{message(locale, "common.branchNotFound")}</p>
      </div>
    );
  }

  return (
    <MasaEntryClient
      branchId={branch.id}
      branchSlug={branch.slug}
      branchName={branch.name}
      tableNumber={tableNumber}
    />
  );
}
