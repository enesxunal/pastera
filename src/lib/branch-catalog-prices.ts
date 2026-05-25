import type { CatalogItem } from "@/lib/catalog-types";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export type BranchPriceOverride = {
  catalog_item_id: string;
  price: number;
};

export async function getBranchPriceOverrides(branchId: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  const svc = createSupabaseServiceClient();
  if (!svc) return map;

  const { data, error } = await svc
    .from("branch_catalog_prices")
    .select("catalog_item_id, price")
    .eq("branch_id", branchId);

  if (error || !data) return map;
  for (const row of data) {
    map.set(row.catalog_item_id, Number(row.price));
  }
  return map;
}

export function applyBranchPrices(catalog: CatalogItem[], overrides: Map<string, number>): CatalogItem[] {
  if (!overrides.size) return catalog;
  return catalog.map((item) => {
    const p = overrides.get(item.id);
    return p !== undefined ? { ...item, price: p } : item;
  });
}
