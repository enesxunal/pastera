import type { CatalogItem } from "@/lib/catalog-types";
import { applyBranchPrices, getBranchPriceOverrides } from "@/lib/branch-catalog-prices";
import { getStaticCatalog } from "@/lib/catalog-static";
import { catalogNameTr } from "@/lib/catalog-name-tr";
import { normalizeMenuImagePath } from "@/lib/normalize-menu-image";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

function mapRow(r: {
  id: string;
  category: string;
  name_de: string;
  name_tr: string;
  price: number;
  vegan: boolean;
  image: string | null;
  sort_order: number;
  is_active: boolean;
}): CatalogItem {
  return {
    id: r.id,
    category: r.category as CatalogItem["category"],
    name_de: r.name_de,
    name_tr: catalogNameTr(r.id, r.name_tr?.trim() || r.name_de),
    price: Number(r.price),
    vegan: r.vegan,
    image: normalizeMenuImagePath(r.image ?? ""),
    sort_order: r.sort_order,
    is_active: r.is_active,
  };
}

/** Öffentlich: nur aktive Zeilen; optional şube fiyat override. */
export async function getCatalogFromDb(branchId?: string | null): Promise<CatalogItem[]> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("catalog_items")
      .select("id,category,name_de,name_tr,price,vegan,image,sort_order,is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error || !data?.length) return getStaticCatalog();
    let items = data.map((r) => mapRow(r as Parameters<typeof mapRow>[0]));
    if (branchId) {
      const overrides = await getBranchPriceOverrides(branchId);
      items = applyBranchPrices(items, overrides);
    }
    return items;
  } catch {
    return getStaticCatalog();
  }
}

/** Admin: alle Zeilen (Service Role). */
export async function getCatalogAllFromDb(): Promise<CatalogItem[] | null> {
  const svc = createSupabaseServiceClient();
  if (!svc) return null;
  const { data, error } = await svc
    .from("catalog_items")
    .select("id,category,name_de,name_tr,price,vegan,image,sort_order,is_active")
    .order("sort_order", { ascending: true });
  if (error || !data) return null;
  return data.map((r) => mapRow(r as Parameters<typeof mapRow>[0]));
}
