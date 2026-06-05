/** SVG ağız (viewBox 200×250) — boş grafik kutu. */
export const BOX_MOUTH_SVG = "52,28 148,28 172,82 28,82";

/** HTML overlay — SVG ağzıyla aynı oran. */
export const BOX_OPENING = {
  left: "14%",
  top: "11%",
  width: "72%",
  height: "22%",
  clipPath: "polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)",
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

/** Sos/topping — her biri farklı noktada. */
export function scatterForLayers(ids: string[]): ScatterPoint[] {
  const out: ScatterPoint[] = [];
  const minGap = 16;

  for (let i = 0; i < ids.length; i++) {
    let best: ScatterPoint | null = null;
    for (let attempt = 0; attempt < 40; attempt++) {
      const h = hash(ids[i], i * 19 + attempt * 61);
      const angle = ((h % 360) * Math.PI) / 180;
      const radius = 12 + ((h >> 3) % 32);
      const candidate: ScatterPoint = {
        left: 28 + ((h >> 5) % 44),
        top: 22 + ((h >> 7) % 38),
        rot: -22 + (h % 44),
        scale: 0.75 + ((h >> 9) % 22) / 100,
      };
      if (Math.cos(angle) > -0.2) {
        candidate.left = 50 + Math.cos(angle) * radius * 0.9;
        candidate.top = 38 + Math.sin(angle) * radius * 0.65;
      }
      const ok = out.every((p) => dist(p, candidate) >= minGap);
      if (ok) {
        best = candidate;
        break;
      }
      if (!best) best = candidate;
    }
    out.push(
      best ?? {
        left: 30 + (i % 4) * 14,
        top: 28 + Math.floor(i / 4) * 14,
        rot: i * 11,
        scale: 0.85,
      },
    );
  }
  return out;
}
