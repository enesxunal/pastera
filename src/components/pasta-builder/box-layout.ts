import { menuPhotoForId } from "@/lib/menu-photo-map";

/** Menü kartlarıyla aynı kutu fotoğrafı. */
export function pastaBoxPhoto(pastaId?: string): string {
  if (pastaId === "noodle-vegan") return menuPhotoForId("pasta-vegan");
  return menuPhotoForId("pasta-klassisch");
}

export function pastaBoxFilter(pastaId?: string): string | undefined {
  if (pastaId === "noodle-black") return "brightness(0.42) contrast(1.15) saturate(0.7)";
  if (pastaId === "noodle-chocolate") return "sepia(0.45) brightness(0.82) saturate(1.1)";
  return undefined;
}

/** Fotoğraftaki ağız alanı (menü görseliyle hizalı). */
export const BOX_OPENING = {
  left: "13%",
  top: "5%",
  width: "74%",
  height: "36%",
  clipPath: "polygon(11% 2%, 89% 2%, 97% 96%, 3% 96%)",
} as const;

export type ScatterPoint = {
  left: number;
  top: number;
  rot: number;
  scale: number;
};

function hash(id: string, salt: number): number {
  let h = salt * 997;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i) * (i + 3)) | 0;
  return Math.abs(h);
}

function dist(a: ScatterPoint, b: ScatterPoint): number {
  return Math.hypot(a.left - b.left, a.top - b.top);
}

/** Her malzeme farklı noktada — üst üste binmesin. */
export function scatterForLayers(ids: string[]): ScatterPoint[] {
  const out: ScatterPoint[] = [];
  const minGap = 14;

  for (let i = 0; i < ids.length; i++) {
    let best: ScatterPoint | null = null;
    for (let attempt = 0; attempt < 32; attempt++) {
      const h = hash(ids[i], i * 17 + attempt * 53);
      const angle = ((h % 360) * Math.PI) / 180;
      const radius = 18 + ((h >> 4) % 28);
      const candidate: ScatterPoint = {
        left: 50 + Math.cos(angle) * radius * 0.85,
        top: 52 + Math.sin(angle) * radius * 0.55,
        rot: -28 + (h % 56),
        scale: 0.82 + ((h >> 8) % 28) / 100,
      };
      const ok = out.every((p) => dist(p, candidate) >= minGap);
      if (ok) {
        best = candidate;
        break;
      }
      if (!best || dist(candidate, { left: 50, top: 52, rot: 0, scale: 1 }) > dist(best, { left: 50, top: 52, rot: 0, scale: 1 })) {
        best = candidate;
      }
    }
    out.push(best ?? { left: 38 + i * 11, top: 48 + (i % 3) * 8, rot: i * 12, scale: 0.9 });
  }
  return out;
}
