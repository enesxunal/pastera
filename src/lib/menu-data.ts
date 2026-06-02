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

/** Schritt 1 — Nudeln */
export const PASTAS: MenuItem[] = [
  {
    id: "noodle-fettuccine-classic",
    name: "Fettuccine Classic",
    price: 4.9,
    vegan: false,
    image: img("pasta-klassisch"),
  },
  {
    id: "noodle-fettuccine-pesto",
    name: "Fettuccine Pesto",
    price: 4.9,
    vegan: false,
    image: img("pasta-klassisch"),
  },
  {
    id: "noodle-fettuccine-nero",
    name: "Fettuccine Nero di Seppia",
    price: 6.9,
    vegan: false,
    image: img("pasta-klassisch"),
  },
  {
    id: "noodle-fettuccine-vegan-classic",
    name: "Fettuccine Vegan Classic",
    price: 4.9,
    vegan: true,
    image: img("pasta-vegan"),
  },
  {
    id: "noodle-fettuccine-vegan-pesto",
    name: "Fettuccine Vegan Pesto",
    price: 4.9,
    vegan: true,
    image: img("pasta-vegan"),
  },
];

const LEGACY_PASTA_MAP: Record<string, string> = {
  "pasta-klassisch": "noodle-fettuccine-classic",
  "pasta-vegan": "noodle-fettuccine-vegan-classic",
  spaghetti: "noodle-fettuccine-classic",
  penne: "noodle-fettuccine-classic",
  tagliatelle: "noodle-fettuccine-classic",
  gnocchi: "noodle-fettuccine-classic",
};

export function normalizePastaId(raw: string): string {
  if (PASTAS.some((p) => p.id === raw)) return raw;
  if (LEGACY_PASTA_MAP[raw]) return LEGACY_PASTA_MAP[raw];
  return PASTAS[0].id;
}

/** Schritt 2 — Klassische Saucen */
export const SAUCES_CLASSIC: MenuItem[] = [
  { id: "s-bolognese", name: "Bolognese", price: 2.0, vegan: false, image: img("s-bolognese") },
  { id: "s-pesto-genovese", name: "Pesto Genovese", price: 2.0, vegan: false, image: img("s-pesto") },
  { id: "s-champignon-rahm", name: "Champignon Rahmsauce", price: 1.5, vegan: false, image: img("s-sahnesauce") },
  { id: "s-tomatensauce", name: "Tomatensauce", price: 1.5, vegan: true, image: img("s-tomatensauce") },
  { id: "s-arrabbiata", name: "Arrabbiata", price: 1.5, vegan: true, image: img("s-arrabbiata") },
  { id: "s-paprika-geroestet", name: "Geröstete Paprikasauce", price: 2.0, vegan: true, image: "" },
  { id: "s-sweet-chili-cream", name: "Sweet Chili Cream", price: 2.0, vegan: true, image: "" },
  { id: "s-zitronen-rahm", name: "Zitronen-Rahmsauce", price: 2.0, vegan: false, image: "" },
  { id: "s-spinat-parmesan", name: "Spinat-Parmesan-Sauce", price: 2.0, vegan: false, image: img("t-blattspinat") },
  { id: "s-extra-parmesan", name: "Extra viel Parmesan", price: 1.0, vegan: false, image: img("t-extra-parmesan") },
];

/** Schritt 2 — Vegane Saucen */
export const SAUCES_VEGAN: MenuItem[] = [
  { id: "s-vegane-tomatensauce", name: "Vegane Tomatensauce", price: 1.5, vegan: true, image: img("s-vegane-tomatensauce") },
  { id: "s-veganes-pesto", name: "Veganes Pesto", price: 2.0, vegan: true, image: img("s-veganes-pesto") },
  { id: "s-vegane-sahnesauce", name: "Vegane Sahnesauce", price: 2.0, vegan: true, image: img("s-vegane-sahnesauce") },
  {
    id: "s-vegane-parmesan-sahne",
    name: "Vegane Parmesan-Sahnesauce",
    price: 2.5,
    vegan: true,
    image: img("s-vegane-sahnesauce"),
  },
  { id: "s-kokos-curry", name: "Kokos-Curry Sauce", price: 2.0, vegan: true, image: img("s-vegane-currysauce") },
  { id: "s-paprika-geroestet-v", name: "Geröstete Paprikasauce", price: 2.0, vegan: true, image: "" },
  { id: "s-spinat-knoblauch-v", name: "Spinat-Knoblauch-Sauce", price: 2.0, vegan: true, image: "" },
  { id: "s-sweet-chili-v", name: "Sweet Chili Sauce", price: 1.8, vegan: true, image: "" },
];

/** Schritt 3 — Klassische Toppings */
export const TOPPINGS_CLASSIC: MenuItem[] = [
  { id: "t-rindfleisch", name: "Rindfleisch", price: 3.5, vegan: false, image: img("sp-rind-mariniert") },
  { id: "t-haehnchen", name: "Hähnchen", price: 2.0, vegan: false, image: img("sp-haehnchen-mariniert") },
  { id: "t-pastrima", name: "Pastrima (Türkischer Rinderschinken)", price: 2.5, vegan: false, image: "" },
  { id: "t-garnelen", name: "Gebratene Garnelen", price: 3.5, vegan: false, image: img("sp-schwarze-garnelen") },
  { id: "t-pinienkerne", name: "Pinienkerne", price: 1.5, vegan: true, image: img("t-pinienkerne") },
  { id: "t-mozzarella", name: "Mozzarella", price: 1.0, vegan: false, image: img("t-mini-mozzarella") },
  { id: "t-cherrytomaten", name: "Cherrytomaten", price: 0.7, vegan: true, image: img("t-cherrytomaten") },
  { id: "t-babyspinat", name: "Babyspinat", price: 0.7, vegan: true, image: img("t-blattspinat") },
  { id: "t-rucola", name: "Rucola", price: 0.7, vegan: true, image: img("t-rucola") },
  { id: "t-brokkoli", name: "Brokkoli", price: 0.7, vegan: true, image: img("t-brokkoli") },
  { id: "t-mais", name: "Mais", price: 0.5, vegan: true, image: img("t-mais") },
  { id: "t-oliven", name: "Oliven", price: 0.5, vegan: true, image: img("t-gruene-oliven") },
  { id: "t-roestzwiebeln", name: "Röstzwiebeln", price: 0.5, vegan: true, image: img("t-roestzwiebeln") },
  { id: "t-jalapenos", name: "Jalapeños in Olivenöl", price: 0.5, vegan: true, image: img("t-jalapenos") },
  { id: "t-knoblauch-oel", name: "Knoblauchöl", price: 0.5, vegan: true, image: "" },
  { id: "t-walnuesse", name: "Walnüsse", price: 1.5, vegan: true, image: "" },
  { id: "t-getrocknete-tomaten", name: "Getrocknete Tomaten", price: 1.0, vegan: true, image: img("t-getrocknete-tomaten") },
  { id: "t-feta", name: "Feta", price: 1.5, vegan: false, image: "" },
  { id: "t-paprika-grill", name: "Gegrillte Paprika", price: 0.7, vegan: true, image: "" },
  { id: "t-avocado", name: "Avocado", price: 1.5, vegan: true, image: "" },
  { id: "t-aubergine-grill", name: "Gegrillte Aubergine", price: 0.7, vegan: true, image: img("vorspeise-auberginen-garnelen") },
  { id: "t-zucchini", name: "Zucchini", price: 0.7, vegan: true, image: "" },
  { id: "t-rote-zwiebeln", name: "Rote Zwiebeln", price: 0.7, vegan: true, image: img("t-rote-zwiebeln") },
  { id: "t-champignons-extra", name: "Extra Champignons", price: 1.0, vegan: true, image: img("t-champignons") },
  { id: "t-rinder-bacon", name: "Rinder-Bacon (Helal)", price: 2.5, vegan: false, image: "" },
  { id: "t-gorgonzola", name: "Gorgonzola", price: 2.0, vegan: false, image: "" },
  { id: "t-extra-haehnchen", name: "Extra Hähnchen", price: 2.5, vegan: false, image: img("sp-haehnchen-mariniert") },
  { id: "t-extra-garnelen", name: "Extra Garnelen", price: 4.0, vegan: false, image: img("sp-schwarze-garnelen") },
  { id: "t-steakstreifen", name: "Steakstreifen", price: 3.5, vegan: false, image: img("vorspeise-rinderfiletstreifen") },
  { id: "t-thunfisch", name: "Thunfisch", price: 2.0, vegan: false, image: "" },
  { id: "t-basilikum", name: "Frisches Basilikum", price: 0.5, vegan: true, image: "" },
  { id: "t-extra-knoblauch", name: "Extra Knoblauch", price: 0.5, vegan: true, image: "" },
];

/** Schritt 3 — Vegane Toppings */
export const TOPPINGS_VEGAN: MenuItem[] = [
  { id: "t-seitan", name: "Seitan", price: 1.8, vegan: true, image: img("sp-seitan") },
  { id: "t-tofu", name: "Tofu", price: 1.5, vegan: true, image: img("sp-tofu") },
  { id: "t-austernpilz", name: "Austernpilz", price: 1.8, vegan: true, image: "" },
  { id: "t-rucola-v", name: "Rucola", price: 0.7, vegan: true, image: img("t-rucola") },
  { id: "t-getrocknete-tomaten-v", name: "Getrocknete Tomaten", price: 1.0, vegan: true, image: img("t-getrocknete-tomaten") },
  { id: "t-cherrytomaten-v", name: "Kirschtomaten", price: 0.7, vegan: true, image: img("t-cherrytomaten") },
  { id: "t-rote-zwiebeln-v", name: "Rote Zwiebeln", price: 0.5, vegan: true, image: img("t-rote-zwiebeln") },
  { id: "t-oliven-v", name: "Oliven", price: 0.5, vegan: true, image: img("t-gruene-oliven") },
  { id: "t-pinienkerne-v", name: "Pinienkerne", price: 1.0, vegan: true, image: img("t-pinienkerne") },
  { id: "t-mais-v", name: "Mais", price: 0.5, vegan: true, image: img("t-mais") },
  { id: "t-babyspinat-v", name: "Babyspinat", price: 0.7, vegan: true, image: img("t-blattspinat") },
  { id: "t-vegan-parmesan", name: "Extra Veganer Parmesan", price: 0.8, vegan: true, image: "" },
  { id: "t-walnuesse-v", name: "Walnüsse", price: 1.5, vegan: true, image: "" },
];

/** Chef Specials — klassisch */
export const CHEF_SPECIALS_CLASSIC: MenuItem[] = [
  {
    id: "cs-bbq-chicken",
    name: "BBQ Chicken Pasta",
    price: 9.9,
    vegan: false,
    image: img("sp-haehnchen-mariniert"),
    description: "Fettuccine, BBQ-Hähnchen, Cremesauce, rote Zwiebeln",
  },
  {
    id: "cs-curry-chicken",
    name: "Curry Chicken Pasta",
    price: 10.4,
    vegan: false,
    image: img("sp-curry-sahne-haehnchen"),
    description: "Fettuccine, Curry-Sahnesauce, Hähnchen, Paprika, Frühlingszwiebeln",
  },
  {
    id: "cs-beef-mushroom",
    name: "Creamy Beef Mushroom",
    price: 11.4,
    vegan: false,
    image: img("sp-rind-mariniert"),
    description: "Fettuccine, Rindfleisch, Champignon-Rahmsauce, Röstzwiebeln",
  },
  {
    id: "cs-burrata-cherry",
    name: "Burrata & Cherry Tomato",
    price: 10.9,
    vegan: false,
    image: img("t-cherrytomaten"),
    description: "Fettuccine, Burrata, Kirschtomaten, Rucola, Basilikum, Olivenöl",
  },
  {
    id: "cs-lemon-shrimp",
    name: "Lemon Shrimp Pasta",
    price: 11.4,
    vegan: false,
    image: img("sp-schwarze-garnelen"),
    description: "Fettuccine, Garnelen, Zitronen-Rahmsauce, Rucola",
  },
  {
    id: "cs-spinach-parmesan",
    name: "Spinat Parmesan Pasta",
    price: 9.9,
    vegan: false,
    image: img("t-blattspinat"),
    description: "Fettuccine, Spinat-Parmesan-Sauce, Kirschtomaten, Pinienkerne, Parmesan",
  },
  {
    id: "cs-pastera-signature",
    name: "Pastera Signature",
    price: 11.4,
    vegan: false,
    image: img("pasta-klassisch"),
    description: "Fettuccine Pesto, Pastrima, getrocknete Tomaten, Walnüsse, Parmesan",
  },
];

/** Chef Specials — vegan */
export const CHEF_SPECIALS_VEGAN: MenuItem[] = [
  {
    id: "vcs-creamy-parmesan",
    name: "Creamy Vegan Parmesan",
    price: 9.9,
    vegan: true,
    image: img("pasta-vegan"),
    description: "Fettuccine Vegan, Vegane Parmesan-Sahnesauce, Austernpilze, Extra veganer Parmesan",
  },
  {
    id: "vcs-curry-seitan",
    name: "Vegan Curry Seitan",
    price: 10.4,
    vegan: true,
    image: img("sp-seitan"),
    description: "Fettuccine Vegan Pesto, Kokos-Curry Sauce, Seitan, Rote Zwiebeln",
  },
  {
    id: "vcs-mediterranean",
    name: "Vegan Mediterranean",
    price: 9.9,
    vegan: true,
    image: img("pasta-vegan"),
    description: "Fettuccine Vegan, Veganes Pesto, Getrocknete Tomaten, Rucola, Pinienkerne",
  },
  {
    id: "vcs-paprika-deluxe",
    name: "Vegan Paprika Deluxe",
    price: 10.4,
    vegan: true,
    image: img("pasta-vegan"),
    description: "Fettuccine Vegan Pesto, Geröstete Paprikasauce, Austernpilze, Kirschtomaten",
  },
  {
    id: "vcs-spinach-supreme",
    name: "Vegan Spinach Supreme",
    price: 9.9,
    vegan: true,
    image: img("t-blattspinat"),
    description: "Fettuccine Vegan, Spinat-Knoblauch-Sauce, Tofu, Extra veganer Parmesan",
  },
  {
    id: "vcs-pastera-signature",
    name: "Pastera Signature Vegan",
    price: 10.9,
    vegan: true,
    image: img("pasta-vegan"),
    description: "Fettuccine Vegan Pesto, Seitan, Getrocknete Tomaten, Walnüsse, Extra veganer Parmesan",
  },
];

export const SPECIALS: MenuItem[] = [];
export const SAUCEN_KLASSISCH = SAUCES_CLASSIC;
export const SAUCEN_VEGAN = SAUCES_VEGAN;
export const SAUCES: MenuItem[] = [...SAUCES_CLASSIC, ...SAUCES_VEGAN];
export const TOPPINGS: MenuItem[] = [...TOPPINGS_CLASSIC, ...TOPPINGS_VEGAN];
export const INGREDIENTS = TOPPINGS;
export const SUPPEN: MenuItem[] = [];
export const VORSPEISEN: MenuItem[] = [];
export const DRINKS: MenuItem[] = [];

export function saucesForPasta(vegan: boolean): MenuItem[] {
  return vegan ? SAUCES_VEGAN : SAUCES_CLASSIC;
}

export function toppingsForPasta(vegan: boolean): MenuItem[] {
  return vegan ? TOPPINGS_VEGAN : TOPPINGS_CLASSIC;
}

const ALL: MenuItem[] = [
  ...PASTAS,
  ...SAUCES,
  ...TOPPINGS,
  ...CHEF_SPECIALS_CLASSIC,
  ...CHEF_SPECIALS_VEGAN,
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
    id: "highlight-builder",
    name: "Kreiere deine Pasta",
    description: "Nudel, Sauce & Toppings in 3 Schritten.",
    priceFrom: 4.9 + 1.5,
    badge: "3 Schritte",
    image: img("pasta-klassisch"),
    href: "/builder",
  },
  {
    id: "highlight-chef",
    name: "Chef Specials",
    description: "Fertige Lieblingskombinationen der Küche.",
    priceFrom: 9.9,
    badge: "Empfehlung",
    image: img("sp-curry-sahne-haehnchen"),
    href: "/menu#chef-specials",
  },
  {
    id: "highlight-vegan",
    name: "Vegane Pasta",
    description: "100 % pflanzlich — eigene Saucen, Toppings & Chef Bowls.",
    priceFrom: 4.9 + 1.5,
    badge: "Vegan",
    image: img("pasta-vegan"),
    href: "/builder?pasta=noodle-fettuccine-vegan-classic",
  },
];
