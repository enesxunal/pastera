/** Almanca ürün açıklamaları */
export const CATALOG_DESC_DE: Record<string, string> = {
  "noodle-black": "Tintenfisch-Nudeln",
  "std-pera-e-miel": "Classic · Birne, Rosmarin, Walnüsse, Sahne, Gorgonzola",
  "std-kremali-tavuk": "Sahnesauce, Hähnchen, Champignons",
  "std-domates": "Tomatensauce",
  "std-pesto-mozzarella": "Pesto, Mozzarella",
  "std-curry-tavuk": "Curry, Hähnchen",
  "std-bolognese": "Bolognese",
  "std-manti": "Türkische Teigtaschen",
};

export function catalogDescDe(id: string): string | undefined {
  return CATALOG_DESC_DE[id];
}
