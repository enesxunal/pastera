export type LayerKind = "sauce" | "topping" | "other";

export function layerKind(id: string): LayerKind {
  if (id.startsWith("s-")) return "sauce";
  if (id.startsWith("t-")) return "topping";
  return "other";
}

export function sauceColor(id: string): string {
  const map: Record<string, string> = {
    "s-domates-vegan": "#c73e2e",
    "s-bolognese": "#7a3428",
    "s-curry": "#e8a317",
    "s-krema": "#f3efe4",
    "s-pesto": "#4a7c3f",
    "s-arrabbiata": "#d4382a",
    "s-choc-dark": "#3d2314",
    "s-choc-white": "#f2e8d8",
  };
  return map[id] ?? "#c49746";
}

export function pastaTint(pastaId?: string): { noodle: string; glow: string } {
  if (pastaId === "noodle-vegan") return { noodle: "#9eb87a", glow: "#4a6b38" };
  if (pastaId === "noodle-black") return { noodle: "#1f1f1f", glow: "#0a0a0a" };
  if (pastaId === "noodle-chocolate") return { noodle: "#6b4423", glow: "#3d2314" };
  return { noodle: "#e8c882", glow: "#c49746" };
}

/** Tutarlı topping konumu (id hash). */
export function toppingPosition(id: string, index: number): { left: number; top: number } {
  let h = index * 17;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * 13) % 100;
  const left = 22 + (h % 56);
  const top = 18 + ((h * 3) % 42);
  return { left, top };
}

export function toppingAccent(id: string): string {
  if (id.includes("choc") || id.includes("muz") || id.includes("cilek")) return "#e8a0a8";
  if (id.includes("mantar") || id.includes("brokkoli") || id.includes("spinat")) return "#6b9e5c";
  if (id.includes("julienne") || id.includes("tenders") || id.includes("rind")) return "#c48a5a";
  if (id.includes("garnelen")) return "#f4a89a";
  if (id.includes("falafel") || id.includes("tofu") || id.includes("seitan")) return "#d4b86a";
  return "#c49746";
}
