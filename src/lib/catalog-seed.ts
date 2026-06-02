import type { SupabaseClient } from "@supabase/supabase-js";
import { staticCatalogIds } from "@/lib/catalog-sync";
import { getStaticCatalog } from "@/lib/catalog-static";

export async function seedCatalogToDb(svc: SupabaseClient): Promise<number> {
  const now = new Date().toISOString();
  const rows = getStaticCatalog().map((r) => ({ ...r, updated_at: now }));
  const { error } = await svc.from("catalog_items").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(error.message);
  return rows.length;
}

export async function deactivateLegacyCatalogItems(svc: SupabaseClient): Promise<number> {
  const allow = staticCatalogIds();
  const { data, error } = await svc.from("catalog_items").select("id").eq("is_active", true);
  if (error) throw new Error(error.message);
  const legacy = (data ?? []).map((r) => r.id as string).filter((id) => !allow.has(id));
  if (!legacy.length) return 0;
  const now = new Date().toISOString();
  for (const id of legacy) {
    const { error: upErr } = await svc
      .from("catalog_items")
      .update({ is_active: false, updated_at: now })
      .eq("id", id);
    if (upErr) throw new Error(upErr.message);
  }
  return legacy.length;
}
