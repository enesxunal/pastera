/** Almanca ürün açıklamaları */
export const CATALOG_DESC_DE: Record<string, string> = {
  "std-bolognese-classico": "Tomatensoße, Rinderhack, Parmesan, Basilikum",
  "std-chicken-cremesosse": "Parmesan-Cremesoße, Hähnchenbrust, Parmesan, Petersilie",
  "std-tartufo-deluxe": "Trüffel-Cremesoße, Champignons, Parmesan, frische Trüffel",
  "std-pesto-verde": "Basilikum-Pesto, Pinienkerne, Parmesan, Babyspinat",
  "std-manzo-cremoso": "Rinderstreifen, Trüffel-Cremesoße, Champignons, Parmesan",
  "std-crunchy-chicken": "Knuspriges Hähnchen, Parmesan-Cremesoße, Parmesan, Petersilie",
  "std-funghi-cremoso": "Champignons, Parmesan-Cremesoße, Parmesan, Petersilie",
  "std-arrabbiata-piccante": "Scharfe Tomatensoße, Chili, Knoblauch, Petersilie, Parmesan",
};

export function catalogDescDe(id: string): string | undefined {
  return CATALOG_DESC_DE[id];
}
