import { NextResponse } from "next/server";
import { listActiveBranches } from "@/lib/branches-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const branches = await listActiveBranches();
  return NextResponse.json({
    ok: true,
    branches: branches.map((b) => ({
      id: b.id,
      slug: b.slug,
      name: b.name,
      radius_km: b.radius_km,
      has_location: b.lat != null && b.lng != null,
    })),
  });
}
