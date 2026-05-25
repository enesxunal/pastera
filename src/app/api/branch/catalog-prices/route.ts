import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getBranchById } from "@/lib/branches-server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";
import { getCatalogAllFromDb } from "@/lib/catalog-server";

async function branchFromCookie() {
  const branchId = cookies().get("pastera_branch_id")?.value;
  if (!branchId) return null;
  const branch = await getBranchById(branchId);
  if (!branch) return null;
  return branch;
}

export async function GET() {
  const branch = await branchFromCookie();
  if (!branch) return NextResponse.json({ ok: false }, { status: 401 });

  const catalog = (await getCatalogAllFromDb()) ?? [];
  const svc = createSupabaseServiceClient();
  const overrides = new Map<string, number>();

  if (svc) {
    const { data } = await svc
      .from("branch_catalog_prices")
      .select("catalog_item_id, price")
      .eq("branch_id", branch.id);
    for (const row of data ?? []) {
      overrides.set(row.catalog_item_id, Number(row.price));
    }
  }

  const items = catalog
    .filter((c) => c.is_active)
    .map((c) => ({
      id: c.id,
      category: c.category,
      name_de: c.name_de,
      name_tr: c.name_tr,
      base_price: c.price,
      branch_price: overrides.get(c.id) ?? null,
      effective_price: overrides.has(c.id) ? overrides.get(c.id)! : c.price,
    }));

  return NextResponse.json({
    ok: true,
    branch: { id: branch.id, name: branch.name, can_edit_prices: branch.can_edit_prices },
    items,
  });
}

export async function POST(request: Request) {
  const branch = await branchFromCookie();
  if (!branch) return NextResponse.json({ ok: false }, { status: 401 });
  if (!branch.can_edit_prices) {
    return NextResponse.json({ ok: false, error: "price_edit_disabled" }, { status: 403 });
  }

  let body: { catalog_item_id?: string; price?: number };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!body.catalog_item_id || typeof body.price !== "number" || body.price < 0) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const { error } = await svc.from("branch_catalog_prices").upsert(
    {
      branch_id: branch.id,
      catalog_item_id: body.catalog_item_id,
      price: body.price,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "branch_id,catalog_item_id" },
  );

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const branch = await branchFromCookie();
  if (!branch) return NextResponse.json({ ok: false }, { status: 401 });
  if (!branch.can_edit_prices) {
    return NextResponse.json({ ok: false, error: "price_edit_disabled" }, { status: 403 });
  }

  const itemId = new URL(request.url).searchParams.get("catalog_item_id");
  if (!itemId) return NextResponse.json({ ok: false }, { status: 400 });

  const svc = createSupabaseServiceClient();
  if (!svc) return NextResponse.json({ ok: false, error: "no_service" }, { status: 503 });

  const { error } = await svc
    .from("branch_catalog_prices")
    .delete()
    .eq("branch_id", branch.id)
    .eq("catalog_item_id", itemId);

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
