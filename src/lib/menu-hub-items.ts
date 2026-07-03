import type { CatalogItem } from "@/lib/catalog-types";
import { catalogByCategory } from "@/lib/catalog-static";
import { PASTA_BASE, VEGAN_PASTA_BASE } from "@/lib/menu-data";
import { menuPhotoForId } from "@/lib/menu-photo-map";

export const MENU_KENDIN_YAP_ID = "menu-kendin-yap";
export const MENU_KENDIN_YAP_VEGAN_ID = "menu-kendin-yap-vegan";

function kendinYapItem(
  id: string,
  name_de: string,
  name_tr: string,
  price: number,
  vegan: boolean,
  imageKey: string,
): CatalogItem {
  return {
    id,
    category: "pasta_base",
    name_de,
    name_tr,
    price,
    vegan,
    image: menuPhotoForId(imageKey),
    sort_order: id === MENU_KENDIN_YAP_ID ? 0 : 1,
    is_active: true,
  };
}

/** Menü kartı — Kendin yap klasik */
export function kendinYapClassicMenuItem(): CatalogItem {
  return kendinYapItem(
    MENU_KENDIN_YAP_ID,
    "Selbst zusammenstellen",
    "Kendin yap",
    PASTA_BASE,
    false,
    "pasta-klassisch",
  );
}

/** Menü kartı — Kendin yap vegan */
export function kendinYapVeganMenuItem(): CatalogItem {
  return kendinYapItem(
    MENU_KENDIN_YAP_VEGAN_ID,
    "Vegan selbst zusammenstellen",
    "Vegan kendin yap",
    VEGAN_PASTA_BASE,
    true,
    "pasta-vegan",
  );
}

/** Makarnalar: 2× Kendin yap + hazır tabaklar */
export function makarnaMenuItems(catalog: CatalogItem[]): CatalogItem[] {
  const ready = catalogByCategory(catalog, "chef_special");
  return [kendinYapClassicMenuItem(), kendinYapVeganMenuItem(), ...ready];
}

export function isMenuBuilderItem(id: string): boolean {
  return id === MENU_KENDIN_YAP_ID || id === MENU_KENDIN_YAP_VEGAN_ID;
}

export function menuBuilderHref(id: string): string {
  if (id === MENU_KENDIN_YAP_VEGAN_ID) return "/builder/vegan";
  return "/builder";
}

export function isMenuCartItem(id: string): boolean {
  return id.startsWith("std-");
}
