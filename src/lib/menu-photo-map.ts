/**
 * `public/web-Pastera-Menü-*.png` — Git/Vercel (Linux) dosya adları NFC.
 * Haritada olmayan ürünler: boş string (kartta gri alan).
 */
function pathFromSuffix(suffix: string): string {
  return `/web-Pastera-Menü-${suffix.normalize("NFC")}.png`;
}

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
  "d-wasser": "Stilles Wasser",
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
  "std-pera-e-miel": "Pera e Miele.png",
  "std-kremali-tavuk": "Pasta Cremosa.png",
  "std-domates": "Pasta al Pomodoro.png",
  "std-pesto-mozzarella": "Pasta al Pesto.png",
  "std-curry-tavuk": "Pasta Curry.png",
  "std-bolognese": "Pasta Bolognese.png",
  "std-manti": "Manti.png",
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
};

export function menuPhotoForId(id: string): string {
  const std = STD_PASTA_IMAGES[id];
  if (std) return `/${std.normalize("NFC")}`;
  const pub = PUBLIC_IMAGES[id];
  if (pub) return `/${pub.normalize("NFC")}`;
  const suf = ID_SUFFIX[id];
  if (!suf) return "";
  return pathFromSuffix(suf);
}
