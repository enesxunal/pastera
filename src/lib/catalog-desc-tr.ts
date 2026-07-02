/** Türkçe ürün açıklamaları */
export const CATALOG_DESC_TR: Record<string, string> = {
  "std-bolognese-classico": "Domates sosu, dana kıyma, parmesan, fesleğen",
  "std-chicken-cremesosse": "Parmesan krema sosu, tavuk göğsü, parmesan, maydanoz",
  "std-tartufo-deluxe": "Trüf krema sosu, mantar, parmesan, taze trüf",
  "std-pesto-verde": "Fesleğenli pesto, çam fıstığı, parmesan, baby ıspanak",
  "std-manzo-cremoso": "Dana dilimleri, trüf krema sosu, mantar, parmesan",
  "std-crunchy-chicken": "Çıtır tavuk, parmesan krema sosu, parmesan, maydanoz",
  "std-funghi-cremoso": "Mantar, parmesan krema sosu, parmesan, maydanoz",
  "std-arrabbiata-piccante": "Acı domates sosu, chili, sarımsak, maydanoz, parmesan",
};

export function catalogDescTr(id: string): string | undefined {
  return CATALOG_DESC_TR[id];
}
