/**
 * `public/web-Pastera-Menü-*.png` — Git/Vercel (Linux) dosya adları NFC.
 * Haritada olmayan ürünler: boş string (kartta gri alan).
 */
function pathFromSuffix(suffix: string): string {
  return `/web-Pastera-Menü-${suffix.normalize("NFC")}.png`;
}

/** Menü PNG yolları — id takma adları */
const PHOTO_ID_ALIAS: Record<string, string> = {
  "s-domates-vegan": "s-vegane-tomatensauce",
  "s-vegan-pesto": "s-veganes-pesto",
  "sp-haehnchen-mariniert": "sp-haehnchen-mariniert",
  "sp-rind-mariniert": "sp-rind-mariniert",
  "sp-schwarze-garnelen": "sp-schwarze-garnelen",
  "sp-tofu": "sp-tofu",
  "sp-seitan": "sp-seitan",
  "t-cherrytomaten": "t-cherrytomaten",
  "t-cherry": "t-cherrytomaten",
  "t-blattspinat": "t-blattspinat",
  "t-babyspinat": "t-blattspinat",
  "t-champignons": "t-champignons",
  "t-mantar": "t-champignons",
  "t-jalapenos": "t-jalapenos",
  "t-jalapeno": "t-jalapenos",
  "t-gruene-oliven": "t-gruene-oliven",
  "t-yesil-zeytin": "t-gruene-oliven",
  "t-rote-zwiebeln": "t-rote-zwiebeln",
  "t-kirmizi-sogan": "t-rote-zwiebeln",
  "t-roestzwiebeln": "t-roestzwiebeln",
  "t-kurutulmus-sogan": "t-roestzwiebeln",
  "t-fruehlingszwiebeln": "t-fruehlingszwiebeln",
  "t-taze-sogan": "t-fruehlingszwiebeln",
  "t-getrocknete-tomaten": "t-getrocknete-tomaten",
  "t-kuru-domates": "t-getrocknete-tomaten",
  "t-mini-mozzarella": "t-mini-mozzarella",
  "t-mozzarella": "t-mini-mozzarella",
  "menu-kendin-yap": "pasta-klassisch",
  "menu-kendin-yap-vegan": "pasta-vegan",
};

const ID_SUFFIX: Partial<Record<string, string>> = {
  "pasta-klassisch": "pasta",
  "pasta-vegan": "vegan-pasta",
  "suppe-aubergine-cremig": "Cremige Auberginensuppe",
  "vorspeise-carpaccio": "Carpaccio-",
  "vorspeise-pilzpfanne": "Pilzpfanne im Tontopf",
  "vorspeise-city-chick-wings": "Hähnchenflügel",
  "vorspeise-auberginen-garnelen": "Gegrillte Auberginen mit Garnelen",
  "vorspeise-rinderfiletstreifen": "Rinderfiletstreifen",
  "s-tomatensauce": "Tomatensauce",
  "s-bolognese": "Bolognese",
  "s-sahnesauce": "Sahne",
  "s-currysauce": "Curry",
  "s-pesto": "Pesto",
  "s-arrabbiata": "Arrabbiata",
  "s-vegane-tomatensauce": "Vegan-Tomaten",
  "s-vegane-currysauce": "Vegan-Curry",
  "s-vegane-sahnesauce": "Vegan-Sahne",
  "s-veganes-pesto": "vegan-pesto",
  "t-brokkoli": "Brokkoli",
  "t-rucola": "Rucola",
  "t-blattspinat": "Blattspinat",
  "t-cherrytomaten": "Cherrytomaten",
  "t-getrocknete-tomaten": "Getrocknete Tomaten",
  "t-jalapenos": "Jalapeños",
  "t-champignons": "Champignons",
  "t-mais": "Mais",
  "t-gruene-oliven": "Grüne Oliven",
  "t-rote-zwiebeln": "Rote Zwiebeln",
  "t-roestzwiebeln": "Röstzwiebeln",
  "t-fruehlingszwiebeln": "Frühlingszwiebeln",
  "t-mini-mozzarella": "Mini-Mozzarella",
  "t-pinienkerne": "Pinienkerne",
  "t-extra-parmesan": "Extra Parmesan",
  "t-kuru-domates": "Getrocknete Tomaten",
  "sp-haehnchen-mariniert": "Mariniertes Hähnchen",
  "sp-curry-sahne-haehnchen": "Curry-Sahne-Hähnchen",
  "sp-rind-mariniert": "Mariniertes Rindfleisch",
  "sp-schwarze-garnelen": "Schwarze Garnelen",
  "sp-rinderfilet-demiglace": "Rinderfilet in Demiglace-Sauce",
  "sp-seitan": "Seitan-Streifen",
  "sp-tofu": "tofu",
};

/** `public/` — hazır makarna fotoğrafları */
const STD_PASTA_IMAGES: Partial<Record<string, string>> = {
  "std-bolognese-classico": "bolognese-classicop.png",
  "std-chicken-cremesosse": "chkicken-creme.png",
  "std-tartufo-deluxe": "tartufo.png",
  "std-pesto-verde": "pesto-new.png",
  "std-manzo-cremoso": "manzo.png",
  "std-crunchy-chicken": "crunchyckicken.png",
  "std-funghi-cremoso": "funghi.png",
  "std-arrabbiata-piccante": "piccante.png",
};

/** `public/` — topping / malzeme fotoğrafları */
const PUBLIC_IMAGES: Partial<Record<string, string>> = {
  "t-tenders": "tenders.png",
  "t-falafel": "falafel.png",
  "t-seitan": "seitan.png",
  "t-birne": "armut.png",
  "t-choc-birne": "armut.png",
  "t-ceviz": "ceviz.png",
  "t-gorgonzola": "gorgonzola.png",
  "t-rosmarin": "rozmarin.png",
  "t-passion-fruit": "passion.png",
  "t-choc-passion": "passion.png",
  "t-sarimsak": "sarımsak.png",
  "t-kaju": "kaju.png",
  "d-tiramisu": "tiramusu.png",
  "d-creme-brulee": "Creme brulee.png",
  "noodle-chocolate": "cikolata-makarna.jpg",
  "s-choc-dark": "cikolata-sos.png",
  "s-choc-white": "beyaz-cikolata.png",
  "t-choc-muz": "muz.png",
  "t-choc-cilek": "cilek.png",
  "t-choc-kiwi": "kiwi.png",
};

export function menuPhotoForId(id: string): string {
  const resolved = PHOTO_ID_ALIAS[id] ?? id;
  const std = STD_PASTA_IMAGES[resolved];
  if (std) return `/${std.normalize("NFC")}`;
  const pub = PUBLIC_IMAGES[resolved];
  if (pub) return `/${pub.normalize("NFC")}`;
  const suf = ID_SUFFIX[resolved];
  if (!suf) return "";
  return pathFromSuffix(suf);
}
