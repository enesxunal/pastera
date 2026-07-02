import type { CatalogItem } from "@/lib/catalog-types";
import { catalogByCategory } from "@/lib/catalog-static";
import { PASTA_BASE } from "@/lib/menu-data";
import { menuPhotoForId } from "@/lib/menu-photo-map";

export const MENU_KENDIN_YAP_ID = "menu-kendin-yap";

/** Menü kartı — Kendin yap (sanal ürün, DB'de yok) */
export function kendinYapMenuItem(): CatalogItem {
  return {
    id: MENU_KENDIN_YAP_ID,
    category: "pasta_base",
    name_de: "Selbst zusammenstellen",
    name_tr: "Kendin yap",
    price: PASTA_BASE,
    vegan: false,
    image: menuPhotoForId("pasta-klassisch"),
    sort_order: 0,
    is_active: true,
  };
}

/** Makarnalar: 1 Kendin yap + 7 hazır isimli */
export function makarnaMenuItems(catalog: CatalogItem[]): CatalogItem[] {
  const ready = catalogByCategory(catalog, "chef_special");
  return [kendinYapMenuItem(), ...ready];
}

export function isMenuBuilderItem(id: string): boolean {
  return id === MENU_KENDIN_YAP_ID;
}

export function menuBuilderHref(id: string): string {
  if (id === MENU_KENDIN_YAP_ID) return "/builder";
  return "/builder";
}

export function isMenuCartItem(id: string): boolean {
  return id.startsWith("std-");
}
