import type { CatalogCategory, CatalogItem } from "@/lib/catalog-types";
import type { MenuItem } from "@/lib/menu-data";
import {
  DRINKS,
  PASTAS,
  SAUCEN_KLASSISCH,
  SAUCEN_VEGAN,
  SPECIALS,
  SUPPEN,
  TOPPINGS,
  VORSPEISEN,
} from "@/lib/menu-data";

/** Kısa Türkçe ürün adları (yoksa Almanca ad kullanılır). */
const NAME_TR: Partial<Record<string, string>> = {
  "pasta-klassisch": "Klasik makarna",
  "pasta-vegan": "Vegan makarna",
  "suppe-aubergine-cremig": "Kremalı patlıcan çorbası",
  "vorspeise-auberginen-garnelen": "Izgara patlıcan ve karides",
  "vorspeise-pilzpfanne": "Mantar tavası (vegan)",
  "vorspeise-carpaccio": "Sığır carpaccio",
  "vorspeise-rinderfiletstreifen": "Bonfile şeritleri",
  "vorspeise-city-chick-wings": "Tavuk kanatları",
  "d-wasser": "Sade su 0,5l",
  "d-sprudel": "Maden suyu",
  "d-cola": "Kola 0,33l",
  "d-limo": "Ev limonatası",
  "d-espresso": "Espresso",
  "d-wein": "Kırmızı şarap (kadeh)",
};

function mapItems(items: MenuItem[], category: CatalogCategory, start: number): CatalogItem[] {
  return items.map((item, i) => ({
    id: item.id,
    category,
    name_de: item.name,
    name_tr: NAME_TR[item.id] ?? item.name,
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
    { items: SAUCEN_KLASSISCH, cat: "sauce" },
    { items: SAUCEN_VEGAN, cat: "sauce" },
    { items: SPECIALS, cat: "special" },
    { items: TOPPINGS, cat: "topping" },
    { items: SUPPEN, cat: "soup" },
    { items: VORSPEISEN, cat: "starter" },
    { items: DRINKS, cat: "drink" },
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
