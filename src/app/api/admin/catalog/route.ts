import { NextResponse, type NextRequest } from "next/server";
import type { CatalogItem } from "@/lib/catalog-types";
import { getCatalogAllFromDb } from "@/lib/catalog-server";
import { getStaticCatalog } from "@/lib/catalog-static";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function isAdmin(req: NextRequest): boolean {
  return req.cookies.get("pastera_admin")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const rows = await getCatalogAllFromDb();
  if (!rows) {
    return NextResponse.json({
      ok: true,
      items: getStaticCatalog(),
      mode: "static",
      hint: "SUPABASE_SERVICE_ROLE_KEY setzen und catalog_items.sql ausführen.",
    });
  }
  return NextResponse.json({ ok: true, items: rows, mode: "remote" });
}

type BodyRow = Partial<CatalogItem> & { id: string };

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });
  let body: BodyRow;
  try {
    body = (await req.json()) as BodyRow;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const now = new Date().toISOString();
  const row = {
    id: body.id,
    category: body.category,
    name_de: body.name_de ?? "",
    name_tr: body.name_tr ?? "",
    price: Number(body.price ?? 0),
    vegan: Boolean(body.vegan),
    image: body.image ?? "",
    sort_order: Number(body.sort_order ?? 0),
    is_active: body.is_active !== false,
    updated_at: now,
  };
  const { error } = await svc.from("catalog_items").upsert(row, { onConflict: "id" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });
  let body: BodyRow;
  try {
    body = (await req.json()) as BodyRow;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = { updated_at: now };
  if (body.category !== undefined) patch.category = body.category;
  if (body.name_de !== undefined) patch.name_de = body.name_de;
  if (body.name_tr !== undefined) patch.name_tr = body.name_tr;
  if (body.price !== undefined) patch.price = Number(body.price);
  if (body.vegan !== undefined) patch.vegan = body.vegan;
  if (body.image !== undefined) patch.image = body.image;
  if (body.sort_order !== undefined) patch.sort_order = Number(body.sort_order);
  if (body.is_active !== undefined) patch.is_active = body.is_active;

  const { error } = await svc.from("catalog_items").update(patch).eq("id", body.id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await svc.from("catalog_items").update({ is_active: false }).eq("id", id);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
