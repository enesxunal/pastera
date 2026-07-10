import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth-server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getCardScanPayload } from "@/lib/card-scan-server";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const isAdmin = isAdminRequest(req);
  const viewerId = await getAuthenticatedUserId();
  const payload = await getCardScanPayload(params.code, { isAdmin, viewerId });

  if (!payload.ok) {
    const status =
      payload.error === "invalid_code"
        ? 400
        : payload.error === "not_found"
          ? 404
          : payload.error === "db_setup"
            ? 503
            : 500;
    return NextResponse.json(payload, { status });
  }

  return NextResponse.json(payload);
}
