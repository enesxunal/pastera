import { NextResponse, type NextRequest } from "next/server";
import { normalizeMenuImagePath } from "@/lib/normalize-menu-image";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

/** Supabase catalog_items.image alanlarını NFC yola çevirir (tek seferlik düzeltme). */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const { data, error } = await svc.from("catalog_items").select("id,image");
  if (error || !data) {
    return NextResponse.json({ ok: false, error: error?.message ?? "no_rows" }, { status: 500 });
  }

  let fixed = 0;
  for (const row of data) {
    const image = (row.image as string | null) ?? "";
    const next = normalizeMenuImagePath(image);
    if (next && next !== image) {
      const { error: upErr } = await svc.from("catalog_items").update({ image: next }).eq("id", row.id);
      if (!upErr) fixed += 1;
    }
  }

  return NextResponse.json({ ok: true, fixed, total: data.length });
}
