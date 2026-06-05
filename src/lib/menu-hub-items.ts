import type { CatalogItem } from "@/lib/catalog-types";
import { catalogByCategory, catalogDesserts, catalogItemById } from "@/lib/catalog-static";
import { catalogNameTr } from "@/lib/catalog-name-tr";
import { CHOCOLATE_PASTA, PASTA_BASE } from "@/lib/menu-data";
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

/** Tatlılar: 2 hazır + çikolatalı makarna kartı */
export function tatliMenuItems(catalog: CatalogItem[]): CatalogItem[] {
  const sweets = catalogDesserts(catalog);
  const chocolate =
    catalogItemById(catalog, CHOCOLATE_PASTA.id) ??
    ({
      id: CHOCOLATE_PASTA.id,
      category: "pasta_base",
      name_de: CHOCOLATE_PASTA.name,
      name_tr: catalogNameTr(CHOCOLATE_PASTA.id, CHOCOLATE_PASTA.name),
      price: CHOCOLATE_PASTA.price,
      vegan: CHOCOLATE_PASTA.vegan,
      image: CHOCOLATE_PASTA.image,
      sort_order: 999,
      is_active: true,
    } satisfies CatalogItem);
  return [...sweets, chocolate];
}

export function isMenuBuilderItem(id: string): boolean {
  return id === MENU_KENDIN_YAP_ID || id === CHOCOLATE_PASTA.id;
}

export function menuBuilderHref(id: string): string {
  if (id === MENU_KENDIN_YAP_ID) return "/builder";
  if (id === CHOCOLATE_PASTA.id) return "/builder/chocolate";
  return "/builder";
}

export function isMenuCartItem(id: string): boolean {
  return id.startsWith("std-") || (id.startsWith("d-") && id !== CHOCOLATE_PASTA.id);
}
