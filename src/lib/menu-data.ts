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
export const VEGAN_PASTA_BASE = 7.9;

/** Kendin yap — tuzlu makarna (oluşturucu) */
export const BUILDER_PASTAS: MenuItem[] = [
  {
    id: "noodle-classic",
    name: "Pasta all'Uovo",
    price: PASTA_BASE,
    vegan: false,
    image: img("pasta-klassisch"),
  },
  {
    id: "noodle-spinach",
    name: "Spinat-Pasta",
    price: PASTA_BASE,
    vegan: false,
    image: img("pasta-vegan"),
  },
  {
    id: "noodle-vegan",
    name: "Vegane Klassik Pasta",
    price: VEGAN_PASTA_BASE,
    vegan: true,
    image: img("pasta-vegan"),
  },
  {
    id: "noodle-vegan-spinach",
    name: "Vegane Spinat-Pasta",
    price: VEGAN_PASTA_BASE,
    vegan: true,
    image: img("pasta-vegan"),
  },
];

/** Tatlı — çikolatalı makarna (ayrı kendin yap) */
export const CHOCOLATE_PASTA: MenuItem = {
  id: "noodle-chocolate",
  name: "Schokoladen-Pasta",
  price: PASTA_BASE,
  vegan: false,
  image: img("noodle-chocolate"),
};

export const PASTAS: MenuItem[] = [...BUILDER_PASTAS, CHOCOLATE_PASTA];

const LEGACY_PASTA_MAP: Record<string, string> = {
  "pasta-klassisch": "noodle-classic",
  "pasta-spinat": "noodle-spinach",
  "pasta-vegan": "noodle-vegan",
  "pasta-vegan-spinat": "noodle-vegan-spinach",
  "noodle-fettuccine-classic": "noodle-classic",
  "noodle-fettuccine-pesto": "noodle-classic",
  "noodle-fettuccine-nero": "noodle-classic",
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
export const SAUCES_CLASSIC: MenuItem[] = [
  { id: "s-tomatensauce", name: "Tomatensauce", price: 1.5, vegan: false, image: img("s-tomatensauce") },
  { id: "s-pesto", name: "Pesto", price: 1.5, vegan: false, image: img("s-pesto") },
  { id: "s-arrabbiata", name: "Arrabbiata", price: 1.5, vegan: true, image: img("s-arrabbiata") },
  { id: "s-bolognese", name: "Bolognese", price: 2.0, vegan: false, image: img("s-bolognese") },
  { id: "s-trueffel", name: "Trüffelsoße", price: 2.5, vegan: false, image: "" },
];

export const SAUCES_VEGAN: MenuItem[] = [
  { id: "s-domates-vegan", name: "Tomatensauce", price: 1.5, vegan: true, image: img("s-vegane-tomatensauce") },
  { id: "s-arrabbiata", name: "Arrabbiata", price: 1.5, vegan: true, image: img("s-arrabbiata") },
  { id: "s-vegan-pesto", name: "Veganes Pesto", price: 2.0, vegan: true, image: img("s-veganes-pesto") },
  { id: "s-vegan-trueffel", name: "Vegane Trüffelsoße", price: 3.0, vegan: true, image: "" },
];

export const SAUCES: MenuItem[] = [
  ...SAUCES_CLASSIC,
  ...SAUCES_VEGAN.filter((x) => !SAUCES_CLASSIC.some((c) => c.id === x.id)),
];

/** 3 — Ana toppingler */
export const TOPPINGS_MAIN: MenuItem[] = [
  { id: "t-julienne-haehnchen", name: "Hähnchen", price: 2.5, vegan: false, image: img("sp-haehnchen-mariniert") },
  { id: "t-pastrami", name: "Pastrami", price: 2.5, vegan: false, image: "" },
  { id: "t-julienne-rind", name: "Rindfleisch", price: 3.5, vegan: false, image: img("sp-rind-mariniert") },
  { id: "t-jumbo-garnelen", name: "Jumbo-Garnelen", price: 3.5, vegan: false, image: img("sp-schwarze-garnelen") },
  { id: "t-tenders", name: "Chicken Tenders", price: 3.5, vegan: false, image: img("t-tenders") },
  { id: "t-falafel", name: "Falafel", price: 2.5, vegan: true, image: img("t-falafel") },
  { id: "t-tofu", name: "Tofu", price: 2.5, vegan: true, image: img("sp-tofu") },
  { id: "t-seitan", name: "Seitan", price: 3.5, vegan: true, image: img("t-seitan") },
];

/** 3 — Ekstra toppingler */
export const TOPPINGS_EXTRA: MenuItem[] = [
  { id: "t-cherry", name: "Cherrytomaten", price: 1.0, vegan: true, image: img("t-cherrytomaten") },
  { id: "t-babyspinat", name: "Babyspinat", price: 1.0, vegan: true, image: img("t-blattspinat") },
  { id: "t-mantar", name: "Champignons", price: 1.0, vegan: true, image: img("t-champignons") },
  { id: "t-rucola", name: "Rucola", price: 1.0, vegan: true, image: img("t-rucola") },
  { id: "t-mais", name: "Mais", price: 1.0, vegan: true, image: img("t-mais") },
  { id: "t-gorgonzola", name: "Gorgonzola", price: 1.5, vegan: false, image: img("t-gorgonzola") },
  { id: "t-rosmarin", name: "Rosmarin", price: 0.5, vegan: true, image: img("t-rosmarin") },
  { id: "t-yesil-zeytin", name: "Grüne Oliven", price: 1.0, vegan: true, image: img("t-gruene-oliven") },
  { id: "t-kurutulmus-sogan", name: "Röstzwiebeln", price: 0.5, vegan: true, image: img("t-roestzwiebeln") },
  { id: "t-jalapeno", name: "Jalapeño", price: 1.0, vegan: true, image: img("t-jalapenos") },
  { id: "t-sarimsak", name: "Knoblauch", price: 0.5, vegan: true, image: img("t-sarimsak") },
  { id: "t-mozzarella", name: "Mozzarella", price: 1.5, vegan: false, image: img("t-mini-mozzarella") },
  { id: "t-taze-sogan", name: "Frühlingszwiebeln", price: 1.0, vegan: true, image: img("t-fruehlingszwiebeln") },
  { id: "t-kirmizi-sogan", name: "Zwiebeln", price: 1.0, vegan: true, image: img("t-rote-zwiebeln") },
  { id: "t-ceviz", name: "Walnüsse", price: 1.5, vegan: true, image: img("t-ceviz") },
  { id: "t-pinienkerne", name: "Pinienkerne", price: 1.5, vegan: true, image: img("t-pinienkerne") },
  { id: "t-extra-parmesan", name: "Extra Parmesan", price: 1.5, vegan: false, image: img("t-extra-parmesan") },
  { id: "t-kuru-domates", name: "Getrocknete Tomaten", price: 1.5, vegan: true, image: img("t-getrocknete-tomaten") },
  { id: "t-badem", name: "Geröstete Mandeln", price: 1.5, vegan: true, image: "" },
];

/** Çikolatalı makarna — soslar */
export const SAUCES_CHOCOLATE: MenuItem[] = [
  { id: "s-choc-dark", name: "Schokolade", price: 1.0, vegan: false, image: img("s-choc-dark") },
  { id: "s-choc-white", name: "Weiße Schokolade", price: 1.0, vegan: false, image: img("s-choc-white") },
];

/** Çikolatalı makarna — meyve toppingleri */
export const TOPPINGS_CHOCOLATE_FRUITS: MenuItem[] = [
  { id: "t-choc-muz", name: "Banane", price: 1.0, vegan: true, image: img("t-choc-muz") },
  { id: "t-choc-cilek", name: "Erdbeeren", price: 1.0, vegan: true, image: img("t-choc-cilek") },
  { id: "t-choc-kiwi", name: "Kiwi", price: 1.0, vegan: true, image: img("t-choc-kiwi") },
  { id: "t-choc-birne", name: "Birne", price: 1.0, vegan: true, image: img("t-choc-birne") },
  { id: "t-choc-passion", name: "Passionsfrucht", price: 2.0, vegan: true, image: img("t-choc-passion") },
];

export const TOPPINGS_CHOCOLATE = [...SAUCES_CHOCOLATE, ...TOPPINGS_CHOCOLATE_FRUITS];

export const CHOCOLATE_BOWL_MARKER = "chocolate-bowl";

export function isChocolateBowl(snapshot: { specialIds: string[] }): boolean {
  return snapshot.specialIds.includes(CHOCOLATE_BOWL_MARKER);
}

/** Standart makarna (sabit fiyat) — görseller: public/ */
export const STANDARD_PASTAS: MenuItem[] = [
  {
    id: "std-bolognese-classico",
    name: "Bolognese Classico",
    price: 9.9,
    vegan: false,
    image: img("std-bolognese-classico"),
    description: "Tomatensoße, Rinderhack, Parmesan, Basilikum",
  },
  {
    id: "std-chicken-cremesosse",
    name: "Chicken Cremesoße",
    price: 11.9,
    vegan: false,
    image: img("std-chicken-cremesosse"),
    description: "Parmesan-Cremesoße, Hähnchenbrust, Parmesan, Petersilie",
  },
  {
    id: "std-tartufo-deluxe",
    name: "Tartufo Deluxe",
    price: 14.9,
    vegan: false,
    image: img("std-tartufo-deluxe"),
    description: "Trüffel-Cremesoße, Champignons, Parmesan, frische Trüffel",
  },
  {
    id: "std-pesto-verde",
    name: "Pesto Verde",
    price: 10.9,
    vegan: false,
    image: img("std-pesto-verde"),
    description: "Basilikum-Pesto, Pinienkerne, Parmesan, Babyspinat",
  },
  {
    id: "std-manzo-cremoso",
    name: "Manzo Cremoso",
    price: 12.4,
    vegan: false,
    image: img("std-manzo-cremoso"),
    description: "Rinderstreifen, Trüffel-Cremesoße, Champignons, Parmesan",
  },
  {
    id: "std-crunchy-chicken",
    name: "Crunchy Chicken",
    price: 12.9,
    vegan: false,
    image: img("std-crunchy-chicken"),
    description: "Knuspriges Hähnchen, Parmesan-Cremesoße, Parmesan, Petersilie",
  },
  {
    id: "std-funghi-cremoso",
    name: "Funghi Cremoso",
    price: 10.4,
    vegan: false,
    image: img("std-funghi-cremoso"),
    description: "Champignons, Parmesan-Cremesoße, Parmesan, Petersilie",
  },
  {
    id: "std-arrabbiata-piccante",
    name: "Arrabbiata Piccante",
    price: 9.4,
    vegan: false,
    image: img("std-arrabbiata-piccante"),
    description: "Scharfe Tomatensoße, Chili, Knoblauch, Petersilie, Parmesan",
  },
];

/** Tatlılar */
export const DESSERTS: MenuItem[] = [
  { id: "d-tiramisu", name: "Tiramisu", price: 6.5, vegan: false, image: img("d-tiramisu") },
  { id: "d-creme-brulee", name: "Crème brûlée", price: 6.5, vegan: false, image: img("d-creme-brulee") },
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
/** İçecekler — Almanya'da yaygın seçenekler (fiyatlar sonra güncellenebilir) */
export const DRINKS: MenuItem[] = [
  { id: "dr-pastera-zitrone", name: "Pastera Limonade Zitrone", price: 3.5, vegan: true, image: "" },
  { id: "dr-fritz-kola", name: "fritz-kola Original", price: 3.5, vegan: true, image: "" },
  { id: "dr-fritz-zero", name: "fritz-kola Super Zero", price: 3.5, vegan: true, image: "" },
  { id: "dr-fritz-mischmasch", name: "fritz-kola Mischmasch", price: 3.5, vegan: true, image: "" },
  { id: "dr-fritz-orange", name: "fritz-limo Orange", price: 3.5, vegan: true, image: "" },
];

/** Kendin yap — soslar makarna çeşidine göre değişmez */
export function saucesForBuilder(pastaId?: string): MenuItem[] {
  return saucesForPasta(pastaId ?? BUILDER_PASTAS[0].id);
}

/** Kendin yap — toppingler makarna çeşidine göre değişmez */
export function toppingsForBuilder(pastaId?: string): MenuItem[] {
  return toppingsForPasta(pastaId ?? BUILDER_PASTAS[0].id);
}

export function saucesForPasta(pastaId: string): MenuItem[] {
  const id = normalizePastaId(pastaId);
  if (id === "noodle-chocolate") return [];
  return id.includes("vegan") ? SAUCES_VEGAN : SAUCES_CLASSIC;
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
  if (id.includes("vegan")) {
    return {
      main: TOPPINGS_MAIN.filter((x) => x.vegan),
      extra: TOPPINGS_EXTRA.filter((x) => x.id !== "t-gorgonzola" && x.id !== "t-mozzarella" && x.id !== "t-extra-parmesan"),
      chocolate: [],
    };
  }
  return {
    main: TOPPINGS_MAIN,
    extra: TOPPINGS_EXTRA,
    chocolate: [],
  };
}

export function toppingsForPasta(pastaId: string): MenuItem[] {
  const id = normalizePastaId(pastaId);
  if (id === "noodle-chocolate") return TOPPINGS_CHOCOLATE_FRUITS;
  return toppingsForBuilder();
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
  ...DRINKS,
];

export function getMenuItem(id: string): MenuItem | undefined {
  return ALL.find((x) => x.id === id);
}

export type MenuHighlight = {
  id: "builder" | "standard" | "dessert";
  priceFrom: number;
  image: string;
  href?: string;
};

export const MENU_HIGHLIGHTS: MenuHighlight[] = [
  {
    id: "builder",
    priceFrom: PASTA_BASE,
    image: img("pasta-klassisch"),
    href: "/builder",
  },
  {
    id: "standard",
    priceFrom: 9.4,
    image: img("std-bolognese-classico"),
    href: "/menu#makarnalar",
  },
  {
    id: "dessert",
    priceFrom: 6.5,
    image: img("noodle-chocolate"),
    href: "/builder/chocolate",
  },
];
