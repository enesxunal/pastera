import { redirect } from "next/navigation";
import { getBranchBySlug } from "@/lib/branches-server";
import { MasaEntryClient } from "@/components/dine-in/MasaEntryClient";

type Props = {
  params: { branchSlug: string; table: string };
};

export default async function MasaEntryPage({ params }: Props) {
  const tableNumber = decodeURIComponent(params.table).trim();
  if (!tableNumber) redirect("/menu");

  const branch = await getBranchBySlug(params.branchSlug);
  if (!branch) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-white/60">Şube bulunamadı / Filiale nicht gefunden.</p>
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
