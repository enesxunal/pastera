import { NextResponse, type NextRequest } from "next/server";
import { getStaticCatalog } from "@/lib/catalog-static";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });
  const now = new Date().toISOString();
  const rows = getStaticCatalog().map((r) => ({
    ...r,
    updated_at: now,
  }));
  const { error } = await svc.from("catalog_items").upsert(rows, { onConflict: "id" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, count: rows.length });
}
