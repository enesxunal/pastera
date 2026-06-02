import type { CatalogItem } from "@/lib/catalog-types";
import { getStaticCatalog } from "@/lib/catalog-static";

/** Aktuelle Menü-IDs aus dem Code (Poster-Stand). */
export function staticCatalogIds(): Set<string> {
  return new Set(getStaticCatalog().map((r) => r.id));
}

/** Nur Zeilen, die im aktuellen Menü-Code vorkommen (keine alten Suppen/Getränke usw.). */
export function filterToCurrentMenu(items: CatalogItem[]): CatalogItem[] {
  const allow = staticCatalogIds();
  return items.filter((i) => allow.has(i.id));
}
