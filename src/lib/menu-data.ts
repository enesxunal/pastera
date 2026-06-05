import { menuPhotoForId } from "@/lib/menu-photo-map";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  vegan: boolean;
  image: string;
  description?: string;
};

const img = (id: string): string => menuPhotoForId(id);

export const PASTA_BASE = 6.9;

/** Kendin yap — tuzlu makarna (oluşturucu) */
export const BUILDER_PASTAS: MenuItem[] = [
  {
    id: "noodle-classic",
    name: "Classic",
    price: PASTA_BASE,
    vegan: false,
    image: img("pasta-klassisch"),
  },
  {
    id: "noodle-vegan",
    name: "Vegan",
    price: PASTA_BASE,
    vegan: true,
    image: img("pasta-vegan"),
  },
  {
    id: "noodle-black",
    name: "Schwarz",
    price: PASTA_BASE,
    vegan: false,
    image: img("pasta-klassisch"),
    description: "Tintenfisch-Nudeln",
  },
];

/** Tatlı — çikolatalı makarna (ayrı kendin yap) */
export const CHOCOLATE_PASTA: MenuItem = {
  id: "noodle-chocolate",
  name: "Schokoladen-Pasta",
  price: PASTA_BASE,
  vegan: false,
  image: img("pasta-klassisch"),
};

export const PASTAS: MenuItem[] = [...BUILDER_PASTAS, CHOCOLATE_PASTA];

const LEGACY_PASTA_MAP: Record<string, string> = {
  "pasta-klassisch": "noodle-classic",
  "pasta-vegan": "noodle-vegan",
  "noodle-fettuccine-classic": "noodle-classic",
  "noodle-fettuccine-pesto": "noodle-classic",
  "noodle-fettuccine-nero": "noodle-black",
  "noodle-fettuccine-vegan-classic": "noodle-vegan",
  "noodle-fettuccine-vegan-pesto": "noodle-vegan",
};

export function isChocolatePasta(pastaId: string): boolean {
  return normalizePastaId(pastaId) === "noodle-chocolate";
}

export function normalizeBuilderPastaId(raw: string): string {
  if (BUILDER_PASTAS.some((p) => p.id === raw)) return raw;
  if (LEGACY_PASTA_MAP[raw]) return LEGACY_PASTA_MAP[raw];
  return BUILDER_PASTAS[0].id;
}

export function normalizePastaId(raw: string): string {
  if (raw === CHOCOLATE_PASTA.id) return raw;
  return normalizeBuilderPastaId(raw);
}

/** 2 — Soslar */
export const SAUCES: MenuItem[] = [
  {
    id: "s-domates-vegan",
    name: "Tomatensauce (vegan)",
    price: 1.0,
    vegan: true,
    image: img("s-vegane-tomatensauce"),
  },
  { id: "s-bolognese", name: "Bolognese", price: 2.0, vegan: false, image: img("s-bolognese") },
  { id: "s-curry", name: "Curry", price: 1.0, vegan: false, image: img("s-currysauce") },
  { id: "s-krema", name: "Sahnesauce", price: 1.0, vegan: false, image: img("s-sahnesauce") },
  { id: "s-pesto", name: "Pesto (vegan)", price: 1.0, vegan: true, image: img("s-veganes-pesto") },
  { id: "s-arrabbiata", name: "Arrabbiata (vegan)", price: 1.5, vegan: true, image: img("s-arrabbiata") },
];

/** 3 — Ana toppingler */
export const TOPPINGS_MAIN: MenuItem[] = [
  { id: "t-julienne-rind", name: "Julienne Rind", price: 2.0, vegan: false, image: img("sp-rind-mariniert") },
  { id: "t-julienne-haehnchen", name: "Julienne Hähnchen", price: 1.5, vegan: false, image: img("sp-haehnchen-mariniert") },
  { id: "t-jumbo-garnelen", name: "Jumbo-Garnelen", price: 2.5, vegan: false, image: img("sp-schwarze-garnelen") },
  { id: "t-tenders", name: "Chicken Tenders", price: 1.5, vegan: false, image: img("sp-haehnchen-mariniert") },
  { id: "t-falafel", name: "Falafel", price: 1.0, vegan: true, image: "" },
  { id: "t-tofu", name: "Tofu", price: 2.0, vegan: true, image: img("sp-tofu") },
  { id: "t-seitan", name: "Seitan", price: 2.0, vegan: true, image: img("sp-seitan") },
];

/** 3 — Ekstra toppingler */
export const TOPPINGS_EXTRA: MenuItem[] = [
  { id: "t-cherry", name: "Cherrytomaten", price: 1.0, vegan: true, image: img("t-cherrytomaten") },
  { id: "t-babyspinat", name: "Babyspinat", price: 1.0, vegan: true, image: img("t-blattspinat") },
  { id: "t-mantar", name: "Champignons", price: 1.0, vegan: true, image: img("t-champignons") },
  { id: "t-rucola", name: "Rucola", price: 1.0, vegan: true, image: img("t-rucola") },
  { id: "t-birne", name: "Birne", price: 1.0, vegan: true, image: "" },
  { id: "t-brokkoli", name: "Brokkoli", price: 1.0, vegan: true, image: img("t-brokkoli") },
  { id: "t-ceviz", name: "Walnüsse", price: 1.0, vegan: true, image: "" },
  { id: "t-mais", name: "Mais", price: 1.0, vegan: true, image: img("t-mais") },
  { id: "t-gorgonzola", name: "Gorgonzola", price: 1.5, vegan: false, image: "" },
  { id: "t-siyah-zeytin", name: "Schwarze Oliven", price: 1.0, vegan: true, image: img("t-gruene-oliven") },
  { id: "t-rosmarin", name: "Rosmarin", price: 0.5, vegan: true, image: "" },
  { id: "t-yesil-zeytin", name: "Grüne Oliven", price: 1.0, vegan: true, image: img("t-gruene-oliven") },
  { id: "t-passion-fruit", name: "Passionsfrucht", price: 2.0, vegan: true, image: "" },
  { id: "t-kurutulmus-sogan", name: "Röstzwiebeln", price: 0.5, vegan: true, image: img("t-roestzwiebeln") },
  { id: "t-jalapeno", name: "Jalapeño", price: 1.0, vegan: true, image: img("t-jalapenos") },
  { id: "t-sarimsak", name: "Knoblauch", price: 0.5, vegan: true, image: "" },
  { id: "t-mozzarella", name: "Mozzarella in Lake", price: 1.0, vegan: false, image: img("t-mini-mozzarella") },
  { id: "t-taze-sogan", name: "Frühlingszwiebeln", price: 1.0, vegan: true, image: img("t-fruehlingszwiebeln") },
  { id: "t-kaju", name: "Cashewkerne", price: 1.0, vegan: true, image: "" },
];

/** Çikolatalı makarna — soslar */
export const SAUCES_CHOCOLATE: MenuItem[] = [
  { id: "s-choc-dark", name: "Schokolade", price: 1.0, vegan: false, image: "" },
  { id: "s-choc-white", name: "Weiße Schokolade", price: 1.0, vegan: false, image: "" },
];

/** Çikolatalı makarna — meyve toppingleri */
export const TOPPINGS_CHOCOLATE_FRUITS: MenuItem[] = [
  { id: "t-choc-muz", name: "Banane", price: 1.0, vegan: true, image: "" },
  { id: "t-choc-cilek", name: "Erdbeeren", price: 1.0, vegan: true, image: "" },
  { id: "t-choc-kiwi", name: "Kiwi", price: 1.0, vegan: true, image: "" },
  { id: "t-choc-birne", name: "Birne", price: 1.0, vegan: true, image: "" },
  { id: "t-choc-passion", name: "Passionsfrucht", price: 2.0, vegan: true, image: "" },
];

export const TOPPINGS_CHOCOLATE = [...SAUCES_CHOCOLATE, ...TOPPINGS_CHOCOLATE_FRUITS];

export const CHOCOLATE_BOWL_MARKER = "chocolate-bowl";

export function isChocolateBowl(snapshot: { specialIds: string[] }): boolean {
  return snapshot.specialIds.includes(CHOCOLATE_BOWL_MARKER);
}

/** Standart makarna (sabit fiyat) */
export const STANDARD_PASTAS: MenuItem[] = [
  {
    id: "std-pera-e-miel",
    name: "Pera E Miel",
    price: 9.8,
    vegan: false,
    image: img("pasta-klassisch"),
    description: "Classic · Birne, Rosmarin, Walnüsse, Sahne, Gorgonzola",
  },
  {
    id: "std-kremali-tavuk",
    name: "Cremige Hähnchen-Pasta",
    price: 8.9,
    vegan: false,
    image: img("sp-haehnchen-mariniert"),
    description: "Sahnesauce, Hähnchen, Champignons",
  },
  {
    id: "std-domates",
    name: "Tomatensauce-Pasta",
    price: 6.5,
    vegan: true,
    image: img("s-tomatensauce"),
    description: "Tomatensauce",
  },
  {
    id: "std-pesto-mozzarella",
    name: "Pesto mit Mozzarella",
    price: 7.5,
    vegan: false,
    image: img("s-pesto"),
    description: "Pesto, Mozzarella",
  },
  {
    id: "std-curry-tavuk",
    name: "Curry-Hähnchen-Pasta",
    price: 8.5,
    vegan: false,
    image: img("sp-curry-sahne-haehnchen"),
    description: "Curry, Hähnchen",
  },
  {
    id: "std-bolognese",
    name: "Bolognese-Pasta",
    price: 8.8,
    vegan: false,
    image: img("s-bolognese"),
    description: "Bolognese",
  },
  {
    id: "std-manti",
    name: "Mantı",
    price: 7.9,
    vegan: false,
    image: img("pasta-klassisch"),
    description: "Türkische Teigtaschen",
  },
];

/** Tatlılar */
export const DESSERTS: MenuItem[] = [
  { id: "d-tiramisu", name: "Tiramisu", price: 6.5, vegan: false, image: "" },
  { id: "d-creme-brulee", name: "Crème brûlée", price: 6.5, vegan: false, image: "" },
];

export const CHEF_SPECIALS_CLASSIC = STANDARD_PASTAS;
export const CHEF_SPECIALS_VEGAN: MenuItem[] = [];
export const SPECIALS: MenuItem[] = [];
export const SAUCEN_KLASSISCH = SAUCES.filter((s) => !s.vegan);
export const SAUCEN_VEGAN = SAUCES.filter((s) => s.vegan);
export const TOPPINGS: MenuItem[] = [
  ...TOPPINGS_MAIN,
  ...TOPPINGS_EXTRA,
  ...TOPPINGS_CHOCOLATE_FRUITS,
];
export const INGREDIENTS = TOPPINGS;
export const SUPPEN: MenuItem[] = [];
export const VORSPEISEN: MenuItem[] = [];
export const DRINKS: MenuItem[] = [];

export function saucesForPasta(pastaId: string): MenuItem[] {
  const id = normalizePastaId(pastaId);
  if (id === "noodle-chocolate") return [];
  const pasta = PASTAS.find((p) => p.id === id) ?? PASTAS[0];
  if (pasta.vegan) return SAUCES.filter((s) => s.vegan);
  return SAUCES.filter((s) => !s.vegan || s.id === "s-arrabbiata");
}

export type ToppingGroups = {
  main: MenuItem[];
  extra: MenuItem[];
  chocolate: MenuItem[];
};

export function toppingGroupsForPasta(pastaId: string): ToppingGroups {
  const id = normalizePastaId(pastaId);
  if (id === "noodle-chocolate") {
    return { main: [], extra: [], chocolate: TOPPINGS_CHOCOLATE_FRUITS };
  }
  const pasta = PASTAS.find((p) => p.id === id) ?? PASTAS[0];
  const veganOk = (i: MenuItem) => !pasta.vegan || i.vegan;
  return {
    main: TOPPINGS_MAIN.filter(veganOk),
    extra: TOPPINGS_EXTRA.filter(veganOk),
    chocolate: [],
  };
}

export function toppingsForPasta(pastaId: string): MenuItem[] {
  const g = toppingGroupsForPasta(pastaId);
  if (g.chocolate.length) return g.chocolate;
  return [...g.main, ...g.extra];
}

export function filterVegan<T extends MenuItem>(items: T[]): T[] {
  return items.filter((i) => i.vegan);
}

export function saucesForChocolateBowl(): MenuItem[] {
  return SAUCES_CHOCOLATE;
}

export function toppingsForChocolateBowl(): MenuItem[] {
  return TOPPINGS_CHOCOLATE_FRUITS;
}

const ALL: MenuItem[] = [
  ...PASTAS,
  ...SAUCES,
  ...SAUCES_CHOCOLATE,
  ...TOPPINGS,
  ...STANDARD_PASTAS,
  ...DESSERTS,
];

export function getMenuItem(id: string): MenuItem | undefined {
  return ALL.find((x) => x.id === id);
}

export type MenuHighlight = {
  id: string;
  name: string;
  description: string;
  priceFrom: number;
  badge?: string;
  image: string;
  href?: string;
};

export const MENU_HIGHLIGHTS: MenuHighlight[] = [
  {
    id: "highlight-builder",
    name: "Kreiere deine Pasta",
    description: "Makarna, sos ve topping — 3 adımda.",
    priceFrom: PASTA_BASE,
    badge: "3 Schritte",
    image: img("pasta-klassisch"),
    href: "/builder",
  },
  {
    id: "highlight-standard",
    name: "Standart Makarna",
    description: "Hazır tabaklar — sabit fiyat.",
    priceFrom: 6.5,
    badge: "Favorit",
    image: img("sp-curry-sahne-haehnchen"),
    href: "/menu#makarnalar",
  },
  {
    id: "highlight-dessert",
    name: "Tatlı & Schoko",
    description: "Tiramisu, Crème brûlée & Schokoladen-Pasta.",
    priceFrom: 6.5,
    badge: "Süß",
    image: img("pasta-klassisch"),
    href: "/builder/chocolate",
  },
];
