export type LayerKind = "sauce" | "topping" | "other";

export function layerKind(id: string): LayerKind {
  if (id.startsWith("s-")) return "sauce";
  if (id.startsWith("t-")) return "topping";
  return "other";
}

export function sauceColor(id: string): string {
  const map: Record<string, string> = {
    "s-domates-vegan": "#c73e2e",
    "s-tomatensauce": "#c73e2e",
    "s-bolognese": "#7a3428",
    "s-curry": "#d4a017",
    "s-krema": "#f5f0e4",
    "s-sahnesauce": "#f5f0e4",
    "s-pesto": "#4a7c3f",
    "s-veganes-pesto": "#4a7c3f",
    "s-arrabbiata": "#d4382a",
    "s-choc-dark": "#3d2314",
    "s-choc-white": "#f2e8d8",
    "s-pesto-genovese": "#4a7c3f",
    "s-champignon-rahm": "#e8e0d0",
    "s-paprika-geroestet": "#c45a2a",
  };
  return map[id] ?? "#c49746";
}

/** Sos opaklığı — krema daha açık, domates daha yoğun. */
export function sauceOpacity(id: string): number {
  if (id.includes("krema") || id.includes("sahne") || id.includes("choc-white") || id.includes("rahm"))
    return 0.62;
  if (id.includes("pesto")) return 0.58;
  return 0.72;
}

export function pastaTint(pastaId?: string): { noodle: string; glow: string; shadow: string } {
  if (pastaId?.includes("vegan"))
    return { noodle: "#c8d4a0", glow: "#8faa6a", shadow: "#5a7040" };
  if (pastaId?.includes("nero") || pastaId === "noodle-black")
    return { noodle: "#2a2a2a", glow: "#111", shadow: "#000" };
  if (pastaId?.includes("chocolate") || pastaId?.includes("choc"))
    return { noodle: "#8b5a3c", glow: "#5c3820", shadow: "#3d2314" };
  return { noodle: "#f0d898", glow: "#d4b060", shadow: "#a08040" };
}

export type ToppingPieceKind =
  | "tomato"
  | "chicken"
  | "beef"
  | "shrimp"
  | "olive"
  | "corn"
  | "mushroom"
  | "green"
  | "broccoli"
  | "cheese"
  | "falafel"
  | "tofu"
  | "seitan"
  | "onion"
  | "garlic"
  | "nut"
  | "banana"
  | "strawberry"
  | "kiwi"
  | "pear"
  | "passion"
  | "chunk";

/** Her malzeme kendi görünümüne map edilir — domates asla sarı olmaz. */
export function toppingPieceType(id: string): ToppingPieceKind {
  const k = id.toLowerCase();

  if (k.includes("cherry") || k.includes("tomaten") || k.includes("domates")) return "tomato";
  if (k.includes("haehnchen") || k.includes("tenders") || k.includes("tavuk")) return "chicken";
  if (k.includes("rind") || k.includes("dana") || k.includes("filet")) return "beef";
  if (k.includes("garnelen")) return "shrimp";
  if (k.includes("zeytin") || k.includes("oliven")) return "olive";
  if (k.includes("mais")) return "corn";
  if (k.includes("mantar") || k.includes("champignon")) return "mushroom";
  if (k.includes("brokkoli")) return "broccoli";
  if (k.includes("mozzarella") || k.includes("gorgonzola")) return "cheese";
  if (k.includes("falafel")) return "falafel";
  if (k.includes("tofu")) return "tofu";
  if (k.includes("seitan")) return "seitan";
  if (k.includes("zwiebel") || k.includes("sogan") || k.includes("roest")) return "onion";
  if (k.includes("sarimsak") || k.includes("knoblauch")) return "garlic";
  if (k.includes("ceviz") || k.includes("kaju") || k.includes("walnuss") || k.includes("cashew"))
    return "nut";
  if (k.includes("choc-muz") || k.includes("banane")) return "banana";
  if (k.includes("choc-cilek") || k.includes("erdbeer")) return "strawberry";
  if (k.includes("choc-kiwi") || k === "t-choc-kiwi") return "kiwi";
  if (k.includes("birne")) return "pear";
  if (k.includes("passion")) return "passion";
  if (
    k.includes("spinat") ||
    k.includes("rucola") ||
    k.includes("rosmarin") ||
    k.includes("jalapeno")
  )
    return "green";

  return "chunk";
}

/** Zeytin rengi — id'ye göre. */
export function oliveColor(id: string): "black" | "green" {
  return id.includes("siyah") || id.includes("schwarz") ? "black" : "green";
}
