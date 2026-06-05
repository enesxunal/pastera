import type { SupportedLocale } from "@/lib/cart";
import { catalogDescDe } from "@/lib/catalog-desc-de";
import { catalogDescTr } from "@/lib/catalog-desc-tr";
import { catalogNameTr } from "@/lib/catalog-name-tr";

export function menuItemLabel(id: string, locale: SupportedLocale, fallbackDe: string): string {
  if (locale === "tr") return catalogNameTr(id, fallbackDe);
  return fallbackDe;
}

export function menuItemDescription(
  id: string,
  locale: SupportedLocale,
  fallbackDe?: string,
): string | undefined {
  const mapped = locale === "tr" ? catalogDescTr(id) : catalogDescDe(id);
  if (mapped) return mapped;
  return locale === "de" ? fallbackDe : catalogDescTr(id) ?? undefined;
}

/** MenuItem veya katalog satırını locale ile göster */
export function localizeMenuItem<T extends { id: string; name: string; description?: string }>(
  item: T,
  locale: SupportedLocale,
): T {
  return {
    ...item,
    name: menuItemLabel(item.id, locale, item.name),
    description: item.description
      ? menuItemDescription(item.id, locale, item.description)
      : menuItemDescription(item.id, locale),
  };
}
