import { catalogItemById } from "@/lib/catalog-static";
import type { CatalogItem } from "@/lib/catalog-types";
import {
  filterVegan,
  getMenuItem,
  INGREDIENTS,
  normalizePastaId,
  PASTAS,
  SAUCES,
  SPECIALS,
  type MenuItem,
} from "@/lib/menu-data";

const KEY = "pastera-warenkorb-v4";

export type CartExtraLine = { id: string; qty: number };

export type CartSnapshot = {
  v: 4;
  veganOnly: boolean;
  pastaId: string;
  sauceIds: string[];
  ingredientIds: string[];
  specialIds: string[];
  extras: CartExtraLine[];
};

export type SupportedLocale = "de" | "tr";

function label(item: CatalogItem | MenuItem, locale: SupportedLocale): string {
  if ("name_de" in item) return locale === "tr" ? item.name_tr : item.name_de;
  return item.name;
}

export function saveCartSnapshot(snapshot: Omit<CartSnapshot, "v">): void {
  if (typeof window === "undefined") return;
  const payload: CartSnapshot = { v: 4, ...snapshot };
  window.sessionStorage.setItem(KEY, JSON.stringify(payload));
  window.dispatchEvent(new Event("pastera-cart-update"));
}

function migrateToV4(data: Record<string, unknown>): CartSnapshot | null {
  const arr = (x: unknown) => (Array.isArray(x) ? x.filter((id) => typeof id === "string") : []);

  if (data.v === 2 && typeof data.pastaId === "string") {
    const pastaId = normalizePastaId(data.pastaId);
    const pasta = PASTAS.find((p) => p.id === pastaId) ?? PASTAS[0];
    return {
      v: 4,
      veganOnly: pasta.vegan,
      pastaId,
      sauceIds: arr((data as { sauceIds?: unknown }).sauceIds),
      ingredientIds: arr((data as { ingredientIds?: unknown }).ingredientIds),
      specialIds: [],
      extras: [],
    };
  }

  if (data.v === 3 && typeof data.pastaId === "string") {
    const pastaId = normalizePastaId(data.pastaId);
    const pasta = PASTAS.find((p) => p.id === pastaId) ?? PASTAS[0];
    return {
      v: 4,
      veganOnly: pasta.vegan,
      pastaId,
      sauceIds: arr(data.sauceIds),
      ingredientIds: arr(data.ingredientIds),
      specialIds: arr(data.specialIds),
      extras: [],
    };
  }

  if (data.v !== 4) return null;
  if (typeof data.pastaId !== "string") return null;

  const pastaId = normalizePastaId(data.pastaId);
  const pasta = PASTAS.find((p) => p.id === pastaId) ?? PASTAS[0];

  const extrasRaw = data.extras;
  const extras: CartExtraLine[] = Array.isArray(extrasRaw)
    ? extrasRaw
        .map((x) => x as Partial<CartExtraLine>)
        .filter((x) => typeof x.id === "string" && typeof x.qty === "number" && x.qty > 0)
        .map((x) => ({ id: x.id as string, qty: Math.min(99, Math.floor(x.qty!)) }))
    : [];

  return {
    v: 4,
    veganOnly: pasta.vegan,
    pastaId,
    sauceIds: arr(data.sauceIds),
    ingredientIds: arr(data.ingredientIds),
    specialIds: arr(data.specialIds),
    extras,
  };
}

export function loadCartSnapshot(): CartSnapshot | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) {
    const legacy = window.sessionStorage.getItem("pastera-warenkorb-v2");
    if (!legacy) return null;
    try {
      const data = JSON.parse(legacy) as Record<string, unknown>;
      const migrated = migrateToV4(data);
      if (migrated) {
        saveCartSnapshot(migrated);
        window.sessionStorage.removeItem("pastera-warenkorb-v2");
      }
      return migrated;
    } catch {
      return null;
    }
  }
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    return migrateToV4(data);
  } catch {
    return null;
  }
}

export function clearCartSnapshot(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
  window.sessionStorage.removeItem("pastera-warenkorb-v2");
  window.sessionStorage.removeItem("pastera-warenkorb-v1");
  window.dispatchEvent(new Event("pastera-cart-update"));
}

function allowedIds(items: MenuItem[], veganOnly: boolean): Set<string> {
  const list = veganOnly ? filterVegan(items) : items;
  return new Set(list.map((i) => i.id));
}

function pickMenuItems(
  ids: string[],
  allow: Set<string>,
  catalog: CatalogItem[],
  locale: SupportedLocale,
): MenuItem[] {
  return ids
    .filter((id) => allow.has(id))
    .map((id) => {
      const c = catalogItemById(catalog, id);
      if (c)
        return {
          id: c.id,
          name: label(c, locale),
          price: c.price,
          vegan: c.vegan,
          image: c.image,
        } satisfies MenuItem;
      return getMenuItem(id);
    })
    .filter((x): x is MenuItem => Boolean(x));
}

export type BowlLine = {
  kind: "pasta" | "sauce" | "special" | "topping";
  label: string;
  amount: number;
};

export type ResolvedExtraLine = {
  id: string;
  qty: number;
  label: string;
  unitPrice: number;
  lineTotal: number;
  image: string;
  category: string;
};

export type ResolvedCartSections = {
  pastaName: string;
  bowlLines: BowlLine[];
  bowlSubtotal: number;
  boxLayers: { id: string; name: string; image?: string }[];
  extras: ResolvedExtraLine[];
  extrasSubtotal: number;
  total: number;
};

function buildBowlParts(
  snapshot: CartSnapshot,
  catalog: CatalogItem[],
  locale: SupportedLocale,
): Pick<ResolvedCartSections, "pastaName" | "bowlLines" | "bowlSubtotal" | "boxLayers"> {
  const pastaId = normalizePastaId(snapshot.pastaId);
  const pastaStatic = PASTAS.find((p) => p.id === pastaId) ?? PASTAS[0];
  const pastaCat = catalogItemById(catalog, pastaId);
  const pasta: MenuItem = pastaCat
    ? {
        id: pastaCat.id,
        name: label(pastaCat, locale),
        price: pastaCat.price,
        vegan: pastaCat.vegan,
        image: pastaCat.image,
      }
    : { ...pastaStatic, name: label(pastaStatic, locale) };

  const aS = allowedIds(SAUCES, false);
  const aI = allowedIds(INGREDIENTS, false);
  const aSp = allowedIds(SPECIALS, false);

  const sauceItems = pickMenuItems(snapshot.sauceIds, aS, catalog, locale);
  const ingItems = pickMenuItems(snapshot.ingredientIds, aI, catalog, locale);
  const specialItems = pickMenuItems(snapshot.specialIds, aSp, catalog, locale);

  const bowlLines: BowlLine[] = [
    { kind: "pasta", label: pasta.name, amount: pasta.price },
    ...sauceItems.map((i) => ({
      kind: "sauce" as const,
      label: i.name,
      amount: i.price,
    })),
    ...specialItems.map((i) => ({
      kind: "special" as const,
      label: i.name,
      amount: i.price,
    })),
    ...ingItems.map((i) => ({
      kind: "topping" as const,
      label: i.name,
      amount: i.price,
    })),
  ];

  const bowlSubtotal =
    pasta.price +
    sauceItems.reduce((s, i) => s + i.price, 0) +
    specialItems.reduce((s, i) => s + i.price, 0) +
    ingItems.reduce((s, i) => s + i.price, 0);

  const boxLayers = [
    ...sauceItems.map((i) => ({ id: i.id, name: i.name, image: i.image })),
    ...specialItems.map((i) => ({ id: i.id, name: i.name, image: i.image })),
    ...ingItems.map((i) => ({ id: i.id, name: i.name, image: i.image })),
  ];

  return { pastaName: pasta.name, bowlLines, bowlSubtotal, boxLayers };
}

export function resolveCartSections(
  snapshot: CartSnapshot,
  catalog: CatalogItem[],
  locale: SupportedLocale = "de",
): ResolvedCartSections {
  const { pastaName, bowlLines, bowlSubtotal, boxLayers } = buildBowlParts(snapshot, catalog, locale);

  const extras: ResolvedExtraLine[] = [];
  let extrasSubtotal = 0;
  for (const ex of snapshot.extras) {
    const c = catalogItemById(catalog, ex.id);
    if (!c || !c.is_active) continue;
    const unit = c.price;
    const lineTotal = unit * ex.qty;
    extrasSubtotal += lineTotal;
    extras.push({
      id: ex.id,
      qty: ex.qty,
      label: label(c, locale),
      unitPrice: unit,
      lineTotal,
      image: c.image,
      category: c.category,
    });
  }

  return {
    pastaName,
    bowlLines,
    bowlSubtotal,
    boxLayers,
    extras,
    extrasSubtotal,
    total: bowlSubtotal + extrasSubtotal,
  };
}

export function resolveCartLines(
  snapshot: CartSnapshot,
  catalog: CatalogItem[],
  locale: SupportedLocale = "de",
): {
  lines: { label: string; amount: number }[];
  boxLayers: { id: string; name: string; image?: string }[];
  pastaName: string;
  total: number;
} {
  const sec = resolveCartSections(snapshot, catalog, locale);
  const lines: { label: string; amount: number }[] = [
    ...sec.bowlLines.map((l) => ({ label: l.label, amount: l.amount })),
    ...sec.extras.map((e) => ({ label: `${e.qty}× ${e.label}`, amount: e.lineTotal })),
  ];
  return {
    lines,
    boxLayers: sec.boxLayers,
    pastaName: sec.pastaName,
    total: sec.total,
  };
}

export function addExtraToCart(id: string, qty = 1): void {
  const n = Math.max(1, Math.min(99, Math.floor(qty)));
  const snap = loadCartSnapshot();
  if (!snap) {
    const pasta = PASTAS[0];
    saveCartSnapshot({
      veganOnly: pasta.vegan,
      pastaId: pasta.id,
      sauceIds: [],
      ingredientIds: [],
      specialIds: [],
      extras: [{ id, qty: n }],
    });
    return;
  }
  const next = { ...snap, extras: [...snap.extras] };
  const i = next.extras.findIndex((e) => e.id === id);
  if (i >= 0) next.extras[i] = { id, qty: Math.min(99, next.extras[i].qty + n) };
  else next.extras.push({ id, qty: n });
  saveCartSnapshot(next);
}

export function removeExtraFromCart(id: string): void {
  const snap = loadCartSnapshot();
  if (!snap) return;
  const filtered = snap.extras.filter((e) => e.id !== id);
  if (filtered.length === snap.extras.length) return;
  saveCartSnapshot({ ...snap, extras: filtered });
}

/** Sets extra line quantity; qty ≤ 0 removes the line. */
export function setExtraQtyInCart(id: string, qty: number): void {
  const q = Math.floor(qty);
  if (q <= 0) {
    removeExtraFromCart(id);
    return;
  }
  const capped = Math.min(99, q);
  const snap = loadCartSnapshot();
  if (!snap) {
    const pasta = PASTAS[0];
    saveCartSnapshot({
      veganOnly: pasta.vegan,
      pastaId: pasta.id,
      sauceIds: [],
      ingredientIds: [],
      specialIds: [],
      extras: [{ id, qty: capped }],
    });
    return;
  }
  const next = { ...snap, extras: [...snap.extras] };
  const i = next.extras.findIndex((e) => e.id === id);
  if (i >= 0) next.extras[i] = { id, qty: capped };
  else next.extras.push({ id, qty: capped });
  saveCartSnapshot(next);
}
