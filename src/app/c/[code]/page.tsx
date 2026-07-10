import { CardScanClient } from "@/components/cards/CardScanClient";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { isAdminCookie } from "@/lib/admin-auth";
import { getCardScanPayload } from "@/lib/card-scan-server";

export const dynamic = "force-dynamic";

export default async function CardPage({ params }: { params: { code: string } }) {
  const isAdmin = isAdminCookie();
  const viewerId = await getAuthenticatedUserId();
  const initial = await getCardScanPayload(params.code, { isAdmin, viewerId });

  return (
    <div className="min-h-dvh bg-[#080808]">
      <CardScanClient code={params.code} initial={initial} />
    </div>
  );
}
