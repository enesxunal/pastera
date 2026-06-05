import { catalogItemById } from "@/lib/catalog-static";
import type { CatalogItem } from "@/lib/catalog-types";
import { menuItemLabel } from "@/lib/menu-i18n";
import {
  CHOCOLATE_PASTA,
  getMenuItem,
  isChocolateBowl,
  normalizePastaId,
  PASTAS,
  saucesForBuilder,
  saucesForChocolateBowl,
  toppingsForBuilder,
  toppingsForChocolateBowl,
  type MenuItem,
} from "@/lib/menu-data";

const KEY = "pastera-warenkorb-v5";
const LEGACY_KEY = "pastera-warenkorb-v4";

export const MAX_CART_BOWLS = 5;

export type CartExtraLine = { id: string; qty: number };

export type CartBowl = {
  id: string;
  pastaId: string;
  sauceIds: string[];
  ingredientIds: string[];
  specialIds: string[];
};

export type CartSnapshot = {
  v: 5;
  bowls: CartBowl[];
  extras: CartExtraLine[];
};

export type SupportedLocale = "de" | "tr";

function label(item: CatalogItem | MenuItem, locale: SupportedLocale): string {
  if ("name_de" in item) return locale === "tr" ? item.name_tr : item.name_de;
  return menuItemLabel(item.id, locale, item.name);
}

function newBowlId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function strArr(x: unknown): string[] {
  return Array.isArray(x) ? x.filter((id) => typeof id === "string") : [];
}

function normalizeExtras(raw: unknown): CartExtraLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => x as Partial<CartExtraLine>)
    .filter((x) => typeof x.id === "string" && typeof x.qty === "number" && x.qty > 0)
    .map((x) => ({ id: x.id as string, qty: Math.min(99, Math.floor(x.qty!)) }));
}

function normalizeBowl(raw: unknown): CartBowl | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Partial<CartBowl>;
  if (typeof b.pastaId !== "string") return null;
  return {
    id: typeof b.id === "string" && b.id ? b.id : newBowlId(),
    pastaId: normalizePastaId(b.pastaId),
    sauceIds: strArr(b.sauceIds),
    ingredientIds: strArr(b.ingredientIds),
    specialIds: strArr(b.specialIds),
  };
}

function normalizeSnapshot(data: Omit<CartSnapshot, "v">): CartSnapshot | null {
  const bowls = data.bowls
    .map(normalizeBowl)
    .filter((x): x is CartBowl => Boolean(x))
    .slice(0, MAX_CART_BOWLS);
  const extras = normalizeExtras(data.extras);
  if (bowls.length === 0 && extras.length === 0) return null;
  return { v: 5, bowls, extras };
}

function persistSnapshot(snapshot: CartSnapshot | null): void {
  if (typeof window === "undefined") return;
  if (!snapshot) {
    window.sessionStorage.removeItem(KEY);
    window.sessionStorage.removeItem(LEGACY_KEY);
    window.dispatchEvent(new Event("pastera-cart-update"));
    return;
  }
  window.sessionStorage.setItem(KEY, JSON.stringify(snapshot));
  window.sessionStorage.removeItem(LEGACY_KEY);
  window.dispatchEvent(new Event("pastera-cart-update"));
}

export function saveCartSnapshot(snapshot: Omit<CartSnapshot, "v">): void {
  persistSnapshot(normalizeSnapshot(snapshot));
}

function migrateLegacyV4(data: Record<string, unknown>): CartSnapshot | null {
  const arr = strArr;

  if (data.v === 2 && typeof data.pastaId === "string") {
    return normalizeSnapshot({
      bowls: [
        {
          id: newBowlId(),
          pastaId: normalizePastaId(data.pastaId),
          sauceIds: arr((data as { sauceIds?: unknown }).sauceIds),
          ingredientIds: arr((data as { ingredientIds?: unknown }).ingredientIds),
          specialIds: [],
        },
      ],
      extras: [],
    });
  }

  if (data.v === 3 && typeof data.pastaId === "string") {
    return normalizeSnapshot({
      bowls: [
        {
          id: newBowlId(),
          pastaId: normalizePastaId(data.pastaId),
          sauceIds: arr(data.sauceIds),
          ingredientIds: arr(data.ingredientIds),
          specialIds: arr(data.specialIds),
        },
      ],
      extras: [],
    });
  }

  if (data.v === 4 && typeof data.pastaId === "string") {
    return normalizeSnapshot({
      bowls: [
        {
          id: newBowlId(),
          pastaId: normalizePastaId(data.pastaId),
          sauceIds: arr(data.sauceIds),
          ingredientIds: arr(data.ingredientIds),
          specialIds: arr(data.specialIds),
        },
      ],
      extras: normalizeExtras(data.extras),
    });
  }

  return null;
}

function parseStoredCart(raw: string): CartSnapshot | null {
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (data.v === 5 && Array.isArray(data.bowls)) {
      return normalizeSnapshot({
        bowls: data.bowls,
        extras: normalizeExtras(data.extras),
      });
    }
    return migrateLegacyV4(data);
  } catch {
    return null;
  }
}

export function loadCartSnapshot(): CartSnapshot | null {
  if (typeof window === "undefined") return null;

  const current = window.sessionStorage.getItem(KEY);
  if (current) return parseStoredCart(current);

  const legacy = window.sessionStorage.getItem(LEGACY_KEY);
  if (legacy) {
    const migrated = parseStoredCart(legacy);
    if (migrated) persistSnapshot(migrated);
    return migrated;
  }

  const v2 = window.sessionStorage.getItem("pastera-warenkorb-v2");
  if (v2) {
    const migrated = parseStoredCart(v2);
    if (migrated) {
      persistSnapshot(migrated);
      window.sessionStorage.removeItem("pastera-warenkorb-v2");
    }
    return migrated;
  }

  return null;
}

export function clearCartSnapshot(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
  window.sessionStorage.removeItem(LEGACY_KEY);
  window.sessionStorage.removeItem("pastera-warenkorb-v2");
  window.sessionStorage.removeItem("pastera-warenkorb-v1");
  window.dispatchEvent(new Event("pastera-cart-update"));
}

function emptyCart(): CartSnapshot {
  return { v: 5, bowls: [], extras: [] };
}

export function getBowlFromCart(id: string): CartBowl | null {
  return loadCartSnapshot()?.bowls.find((b) => b.id === id) ?? null;
}

export type AddBowlResult =
  | { ok: true; id: string }
  | { ok: false; reason: "max_bowls" };

export function addBowlToCart(bowl: Omit<CartBowl, "id">): AddBowlResult {
  const snap = loadCartSnapshot() ?? emptyCart();
  if (snap.bowls.length >= MAX_CART_BOWLS) return { ok: false, reason: "max_bowls" };
  const id = newBowlId();
  saveCartSnapshot({
    bowls: [...snap.bowls, { id, ...bowl }],
    extras: snap.extras,
  });
  return { ok: true, id };
}

export function updateBowlInCart(id: string, bowl: Omit<CartBowl, "id">): boolean {
  const snap = loadCartSnapshot();
  if (!snap) return false;
  const index = snap.bowls.findIndex((b) => b.id === id);
  if (index < 0) return false;
  const bowls = [...snap.bowls];
  bowls[index] = { id, ...bowl };
  saveCartSnapshot({ bowls, extras: snap.extras });
  return true;
}

export function removeBowlFromCart(id: string): void {
  const snap = loadCartSnapshot();
  if (!snap) return;
  saveCartSnapshot({
    bowls: snap.bowls.filter((b) => b.id !== id),
    extras: snap.extras,
  });
}

function allowedIds(items: MenuItem[]): Set<string> {
  return new Set(items.map((i) => i.id));
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
      const staticItem = getMenuItem(id);
      if (!staticItem) return null;
      return {
        ...staticItem,
        name: menuItemLabel(id, locale, staticItem.name),
      } satisfies MenuItem;
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

export type ResolvedBowl = {
  id: string;
  pastaName: string;
  bowlLines: BowlLine[];
  bowlSubtotal: number;
  boxLayers: { id: string; name: string; image?: string }[];
  isChocolate: boolean;
};

export type ResolvedCartSections = {
  bowls: ResolvedBowl[];
  bowlsSubtotal: number;
  extras: ResolvedExtraLine[];
  extrasSubtotal: number;
  total: number;
};

function buildBowlParts(
  bowl: CartBowl,
  catalog: CatalogItem[],
  locale: SupportedLocale,
): Omit<ResolvedBowl, "id" | "isChocolate"> & { isChocolate: boolean } {
  const chocolate = isChocolateBowl(bowl);

  if (chocolate) {
    const pastaCat = catalogItemById(catalog, CHOCOLATE_PASTA.id);
    const pastaName = pastaCat
      ? label(pastaCat, locale)
      : menuItemLabel(CHOCOLATE_PASTA.id, locale, CHOCOLATE_PASTA.name);
    const pastaPrice = CHOCOLATE_PASTA.price;

    const aS = allowedIds(saucesForChocolateBowl());
    const aT = allowedIds(toppingsForChocolateBowl());
    const sauceItems = pickMenuItems(bowl.sauceIds, aS, catalog, locale);
    const ingItems = pickMenuItems(bowl.ingredientIds, aT, catalog, locale);

    const bowlLines: BowlLine[] = [
      { kind: "pasta", label: pastaName, amount: pastaPrice },
      ...sauceItems.map((i) => ({
        kind: "sauce" as const,
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
      pastaPrice +
      sauceItems.reduce((s, i) => s + i.price, 0) +
      ingItems.reduce((s, i) => s + i.price, 0);

    const boxLayers = [
      ...sauceItems.map((i) => ({ id: i.id, name: i.name, image: i.image })),
      ...ingItems.map((i) => ({ id: i.id, name: i.name, image: i.image })),
    ];

    return { pastaName, bowlLines, bowlSubtotal, boxLayers, isChocolate: true };
  }

  const pastaId = normalizePastaId(bowl.pastaId);
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

  const aS = allowedIds(saucesForBuilder());
  const aT = allowedIds(toppingsForBuilder());

  const sauceItems = pickMenuItems(bowl.sauceIds, aS, catalog, locale);
  const ingItems = pickMenuItems(bowl.ingredientIds, aT, catalog, locale);

  const bowlLines: BowlLine[] = [
    { kind: "pasta", label: pasta.name, amount: pasta.price },
    ...sauceItems.map((i) => ({
      kind: "sauce" as const,
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
    ingItems.reduce((s, i) => s + i.price, 0);

  const boxLayers = [
    ...sauceItems.map((i) => ({ id: i.id, name: i.name, image: i.image })),
    ...ingItems.map((i) => ({ id: i.id, name: i.name, image: i.image })),
  ];

  return { pastaName: pasta.name, bowlLines, bowlSubtotal, boxLayers, isChocolate: false };
}

export function resolveCartSections(
  snapshot: CartSnapshot,
  catalog: CatalogItem[],
  locale: SupportedLocale = "de",
): ResolvedCartSections {
  const bowls: ResolvedBowl[] = snapshot.bowls.map((bowl) => {
    const parts = buildBowlParts(bowl, catalog, locale);
    return { id: bowl.id, ...parts };
  });
  const bowlsSubtotal = bowls.reduce((sum, bowl) => sum + bowl.bowlSubtotal, 0);

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
    bowls,
    bowlsSubtotal,
    extras,
    extrasSubtotal,
    total: bowlsSubtotal + extrasSubtotal,
  };
}

export function resolveCartLines(
  snapshot: CartSnapshot,
  catalog: CatalogItem[],
  locale: SupportedLocale = "de",
): {
  lines: { label: string; amount: number }[];
  total: number;
} {
  const sec = resolveCartSections(snapshot, catalog, locale);
  const lines: { label: string; amount: number }[] = [];
  const multi = sec.bowls.length > 1;

  sec.bowls.forEach((bowl, index) => {
    const prefix = multi ? `${index + 1}. ` : "";
    bowl.bowlLines.forEach((line) => {
      lines.push({ label: `${prefix}${line.label}`, amount: line.amount });
    });
  });

  for (const extra of sec.extras) {
    lines.push({ label: `${extra.qty}× ${extra.label}`, amount: extra.lineTotal });
  }

  return { lines, total: sec.total };
}

export function addExtraToCart(id: string, qty = 1): void {
  const n = Math.max(1, Math.min(99, Math.floor(qty)));
  const snap = loadCartSnapshot() ?? emptyCart();
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
  const snap = loadCartSnapshot() ?? emptyCart();
  const next = { ...snap, extras: [...snap.extras] };
  const i = next.extras.findIndex((e) => e.id === id);
  if (i >= 0) next.extras[i] = { id, qty: capped };
  else next.extras.push({ id, qty: capped });
  saveCartSnapshot(next);
}
