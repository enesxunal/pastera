import { NextResponse, type NextRequest } from "next/server";
import { deactivateLegacyCatalogItems, seedCatalogToDb } from "@/lib/catalog-seed";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });
  try {
    const count = await seedCatalogToDb(svc);
    const deactivated = await deactivateLegacyCatalogItems(svc);
    return NextResponse.json({ ok: true, count, deactivated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "seed_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
