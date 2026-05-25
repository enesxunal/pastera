import { menuPhotoForId } from "@/lib/menu-photo-map";

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  vegan: boolean;
  image: string;
};

/** Eine Pastasorte – Nutzer wählt klassisch oder vegan, danach Belag. */
export const PASTAS: MenuItem[] = [
  {
    id: "pasta-klassisch",
    name: "Pasta klassisch",
    price: 8.5,
    vegan: false,
    image: menuPhotoForId("pasta-klassisch"),
  },
  {
    id: "pasta-vegan",
    name: "Pasta vegan",
    price: 8.5,
    vegan: true,
    image: menuPhotoForId("pasta-vegan"),
  },
];

/** Alte Warenkörbe (Spaghetti, Penne, …) auf die neue Basis abbilden. */
const LEGACY_PASTA_IDS = new Set([
  "spaghetti",
  "penne",
  "tagliatelle",
  "gnocchi",
]);

export function normalizePastaId(raw: string): string {
  if (PASTAS.some((p) => p.id === raw)) return raw;
  if (LEGACY_PASTA_IDS.has(raw)) return "pasta-klassisch";
  return PASTAS[0].id;
}

export const SUPPEN: MenuItem[] = [
  {
    id: "suppe-aubergine-cremig",
    name: "Cremige Auberginensuppe",
    price: 6.5,
    vegan: false,
    image: menuPhotoForId("suppe-aubergine-cremig"),
  },
];

export const VORSPEISEN: MenuItem[] = [
  {
    id: "vorspeise-auberginen-garnelen",
    name: "Gegrillte Auberginen mit Garnelen",
    price: 11.9,
    vegan: false,
    image: menuPhotoForId("vorspeise-auberginen-garnelen"),
  },
  {
    id: "vorspeise-pilzpfanne",
    name: "Pilzpfanne im Tontopf (Vegan)",
    price: 9.5,
    vegan: true,
    image: menuPhotoForId("vorspeise-pilzpfanne"),
  },
  {
    id: "vorspeise-carpaccio",
    name: "Rinder-Carpaccio",
    price: 12.5,
    vegan: false,
    image: menuPhotoForId("vorspeise-carpaccio"),
  },
  {
    id: "vorspeise-rinderfiletstreifen",
    name: "Rinderfiletstreifen",
    price: 12.9,
    vegan: false,
    image: menuPhotoForId("vorspeise-rinderfiletstreifen"),
  },
  {
    id: "vorspeise-city-chick-wings",
    name: "Hähnchenflügel (City Chick Wings)",
    price: 9.9,
    vegan: false,
    image: menuPhotoForId("vorspeise-city-chick-wings"),
  },
];

/** Klassische Saucen (Basis-Auswahl) */
export const SAUCEN_KLASSISCH: MenuItem[] = [
  {
    id: "s-tomatensauce",
    name: "Tomatensauce",
    price: 3.5,
    vegan: true,
    image: menuPhotoForId("s-tomatensauce"),
  },
  {
    id: "s-bolognese",
    name: "Bolognese",
    price: 4.5,
    vegan: false,
    image: menuPhotoForId("s-bolognese"),
  },
  {
    id: "s-sahnesauce",
    name: "Sahnesauce",
    price: 4.0,
    vegan: false,
    image: menuPhotoForId("s-sahnesauce"),
  },
  {
    id: "s-currysauce",
    name: "Currysauce",
    price: 4.0,
    vegan: false,
    image: menuPhotoForId("s-currysauce"),
  },
  {
    id: "s-pesto",
    name: "Pesto",
    price: 4.0,
    vegan: false,
    image: menuPhotoForId("s-pesto"),
  },
  {
    id: "s-arrabbiata",
    name: "Arrabbiata",
    price: 3.5,
    vegan: true,
    image: menuPhotoForId("s-arrabbiata"),
  },
];

export const SAUCEN_VEGAN: MenuItem[] = [
  {
    id: "s-vegane-tomatensauce",
    name: "Vegane Tomatensauce",
    price: 3.5,
    vegan: true,
    image: menuPhotoForId("s-vegane-tomatensauce"),
  },
  {
    id: "s-vegane-currysauce",
    name: "Vegane Currysauce",
    price: 4.0,
    vegan: true,
    image: menuPhotoForId("s-vegane-currysauce"),
  },
  {
    id: "s-vegane-sahnesauce",
    name: "Vegane Sahnesauce",
    price: 4.0,
    vegan: true,
    image: menuPhotoForId("s-vegane-sahnesauce"),
  },
  {
    id: "s-veganes-pesto",
    name: "Veganes Pesto",
    price: 4.0,
    vegan: true,
    image: menuPhotoForId("s-veganes-pesto"),
  },
];

export const SAUCES: MenuItem[] = [...SAUCEN_KLASSISCH, ...SAUCEN_VEGAN];

export const SPECIALS: MenuItem[] = [
  {
    id: "sp-haehnchen-mariniert",
    name: "Mariniertes Hähnchen",
    price: 6.5,
    vegan: false,
    image: menuPhotoForId("sp-haehnchen-mariniert"),
  },
  {
    id: "sp-curry-sahne-haehnchen",
    name: "Curry-Sahne-Hähnchen",
    price: 7.5,
    vegan: false,
    image: menuPhotoForId("sp-curry-sahne-haehnchen"),
  },
  {
    id: "sp-rind-mariniert",
    name: "Mariniertes Rindfleisch",
    price: 8.5,
    vegan: false,
    image: menuPhotoForId("sp-rind-mariniert"),
  },
  {
    id: "sp-schwarze-garnelen",
    name: "Schwarze Garnelen (Black Garnele)",
    price: 9.5,
    vegan: false,
    image: menuPhotoForId("sp-schwarze-garnelen"),
  },
  {
    id: "sp-rinderfilet-demiglace",
    name: "Rinderfilet in Demiglace-Sauce",
    price: 9.9,
    vegan: false,
    image: menuPhotoForId("sp-rinderfilet-demiglace"),
  },
  {
    id: "sp-seitan",
    name: "Seitan-Streifen",
    price: 5.5,
    vegan: true,
    image: menuPhotoForId("sp-seitan"),
  },
  {
    id: "sp-tofu",
    name: "Tofu",
    price: 4.5,
    vegan: true,
    image: menuPhotoForId("sp-tofu"),
  },
];

export const TOPPINGS: MenuItem[] = [
  {
    id: "t-brokkoli",
    name: "Brokkoli",
    price: 1.5,
    vegan: true,
    image: menuPhotoForId("t-brokkoli"),
  },
  {
    id: "t-rucola",
    name: "Rucola",
    price: 1.2,
    vegan: true,
    image: menuPhotoForId("t-rucola"),
  },
  {
    id: "t-blattspinat",
    name: "Blattspinat",
    price: 1.2,
    vegan: true,
    image: menuPhotoForId("t-blattspinat"),
  },
  {
    id: "t-cherrytomaten",
    name: "Cherrytomaten",
    price: 1.2,
    vegan: true,
    image: menuPhotoForId("t-cherrytomaten"),
  },
  {
    id: "t-getrocknete-tomaten",
    name: "Getrocknete Tomaten",
    price: 1.5,
    vegan: true,
    image: menuPhotoForId("t-getrocknete-tomaten"),
  },
  {
    id: "t-jalapenos",
    name: "Jalapeños",
    price: 1.0,
    vegan: true,
    image: menuPhotoForId("t-jalapenos"),
  },
  {
    id: "t-champignons",
    name: "Champignons",
    price: 1.2,
    vegan: true,
    image: menuPhotoForId("t-champignons"),
  },
  {
    id: "t-mais",
    name: "Mais",
    price: 1.0,
    vegan: true,
    image: menuPhotoForId("t-mais"),
  },
  {
    id: "t-gruene-oliven",
    name: "Grüne Oliven",
    price: 1.3,
    vegan: true,
    image: menuPhotoForId("t-gruene-oliven"),
  },
  {
    id: "t-rote-zwiebeln",
    name: "Rote Zwiebeln",
    price: 0.8,
    vegan: true,
    image: menuPhotoForId("t-rote-zwiebeln"),
  },
  {
    id: "t-roestzwiebeln",
    name: "Röstzwiebeln",
    price: 0.8,
    vegan: true,
    image: menuPhotoForId("t-roestzwiebeln"),
  },
  {
    id: "t-fruehlingszwiebeln",
    name: "Frühlingszwiebeln",
    price: 0.8,
    vegan: true,
    image: menuPhotoForId("t-fruehlingszwiebeln"),
  },
  {
    id: "t-mini-mozzarella",
    name: "Mini-Mozzarella",
    price: 2.0,
    vegan: false,
    image: menuPhotoForId("t-mini-mozzarella"),
  },
  {
    id: "t-pinienkerne",
    name: "Pinienkerne",
    price: 1.8,
    vegan: true,
    image: menuPhotoForId("t-pinienkerne"),
  },
  {
    id: "t-extra-parmesan",
    name: "Extra Parmesan",
    price: 1.5,
    vegan: false,
    image: menuPhotoForId("t-extra-parmesan"),
  },
];

/** Alias für Konfigurator & Warenkorb (Toppings). */
export const INGREDIENTS = TOPPINGS;

export const DRINKS: MenuItem[] = [
  {
    id: "d-wasser",
    name: "Stilles Wasser 0,5l",
    price: 3.5,
    vegan: true,
    image: menuPhotoForId("d-wasser"),
  },
  {
    id: "d-sprudel",
    name: "Mineralwasser prickelnd",
    price: 3.5,
    vegan: true,
    image: menuPhotoForId("d-wasser"),
  },
  {
    id: "d-cola",
    name: "Cola 0,33l",
    price: 3.9,
    vegan: true,
    image: menuPhotoForId("d-wasser"),
  },
  {
    id: "d-limo",
    name: "Hauslimonade",
    price: 4.5,
    vegan: true,
    image: menuPhotoForId("d-wasser"),
  },
  {
    id: "d-espresso",
    name: "Espresso",
    price: 2.5,
    vegan: true,
    image: menuPhotoForId("d-wasser"),
  },
  {
    id: "d-wein",
    name: "Rotwein Glas",
    price: 5.5,
    vegan: true,
    image: menuPhotoForId("d-wasser"),
  },
];

const ALL: MenuItem[] = [
  ...PASTAS,
  ...SUPPEN,
  ...VORSPEISEN,
  ...SAUCES,
  ...SPECIALS,
  ...TOPPINGS,
  ...DRINKS,
];

export function getMenuItem(id: string): MenuItem | undefined {
  return ALL.find((x) => x.id === id);
}

export function filterVegan<T extends MenuItem>(items: T[]): T[] {
  return items.filter((i) => i.vegan);
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
    id: "suppe-highlight",
    name: "Cremige Auberginensuppe",
    description: "Aus der Suppenkarte – warm und cremig.",
    priceFrom: SUPPEN[0].price,
    badge: "Suppe",
    image: menuPhotoForId("suppe-aubergine-cremig"),
    href: "/menu/vorspeisen",
  },
  {
    id: "pasta-bar",
    name: "Pasta nach Wahl",
    description: "Zuerst klassisch oder vegan, dann Saucen, Specials und Toppings.",
    priceFrom: Math.min(...PASTAS.map((p) => p.price)),
    badge: "Konfigurator",
    image: menuPhotoForId("pasta-klassisch"),
    href: "/menu/pasta",
  },
  {
    id: "vegan-line",
    name: "Vegane Linie",
    description: "Vegane Saucen, Seitan, Tofu und pflanzliche Toppings.",
    priceFrom: Math.min(...filterVegan(SAUCES).map((p) => p.price)) + 2,
    badge: "Plant-based",
    image: menuPhotoForId("pasta-vegan"),
    href: "/menu/pasta",
  },
];
