import type { CatalogCategory, CatalogItem } from "@/lib/catalog-types";
import type { MenuItem } from "@/lib/menu-data";
import {
  DESSERTS,
  PASTAS,
  SAUCES,
  STANDARD_PASTAS,
  TOPPINGS,
} from "@/lib/menu-data";

import { catalogNameTr } from "@/lib/catalog-name-tr";

function mapItems(items: MenuItem[], category: CatalogCategory, start: number): CatalogItem[] {
  return items.map((item, i) => ({
    id: item.id,
    category,
    name_de: item.name,
    name_tr: catalogNameTr(item.id, item.name),
    price: item.price,
    vegan: item.vegan,
    image: item.image,
    sort_order: start + i,
    is_active: true,
  }));
}

/** Fallback-Katalog aus dem Code (wenn DB leer oder nicht konfiguriert). */
export function getStaticCatalog(): CatalogItem[] {
  const out: CatalogItem[] = [];
  let o = 0;
  const blocks: { items: MenuItem[]; cat: CatalogCategory }[] = [
    { items: PASTAS, cat: "pasta_base" },
    { items: SAUCES, cat: "sauce" },
    { items: TOPPINGS, cat: "topping" },
    { items: STANDARD_PASTAS, cat: "chef_special" },
    { items: DESSERTS, cat: "dessert" },
  ];
  for (const { items, cat } of blocks) {
    out.push(...mapItems(items, cat, o));
    o += items.length;
  }
  return out;
}

export function catalogItemById(catalog: CatalogItem[], id: string): CatalogItem | undefined {
  return catalog.find((x) => x.id === id);
}

export function catalogByCategory(catalog: CatalogItem[], category: CatalogCategory): CatalogItem[] {
  return catalog.filter((x) => x.category === category && x.is_active).sort((a, b) => a.sort_order - b.sort_order);
}
