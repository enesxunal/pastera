/** Türkçe ürün açıklamaları */
export const CATALOG_DESC_TR: Record<string, string> = {
  "noodle-black": "Mürekkep balığı noodle",
  "std-pera-e-miel": "Klasik · armut, rozmarin, ceviz, krema, gorgonzola",
  "std-kremali-tavuk": "Krema sosu, tavuk, mantar",
  "std-domates": "Domates sosu",
  "std-pesto-mozzarella": "Pesto, mozzarella",
  "std-curry-tavuk": "Köri, tavuk",
  "std-bolognese": "Bolognese sosu",
  "std-manti": "Türk mantısı",
};

export function catalogDescTr(id: string): string | undefined {
  return CATALOG_DESC_TR[id];
}
