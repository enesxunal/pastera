/**
 * Illustrator kutu koordinatları — viewBox: 0 0 909.7 403.3
 * public/pastera-kutu.svg ile aynı.
 */

export const BOX_VIEWBOX = { w: 909.7, h: 403.3 } as const;

/** Ağız — makarna/sos/malzeme burada (clipPath). */
export const BOX_MOUTH = "727.2,0 182.6,0 0,161.1 909.7,161.1";

export const PASTA_CENTER = { cx: 455, cy: 80 } as const;
export const MOUTH_BOTTOM = 158;
export const MOUTH_TOP = 8;

/** Makarna yığını genişliği */
export const PASTA_PILE_LEFT = 80;
export const PASTA_PILE_RIGHT = 830;

/** Topping grafik boyutu çarpanı */
export const TOPPING_SIZE = 3.2;

export type ScatterPoint = { cx: number; cy: number; rot: number; scale: number };

function hash(id: string, salt: number): number {
  let h = salt * 997;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i) * (i + 3)) | 0;
  return Math.abs(h);
}

function dist(a: ScatterPoint, b: ScatterPoint): number {
  return Math.hypot(a.cx - b.cx, a.cy - b.cy);
}

/** Bir topping için 4–5 parça — kutu ağzı içinde dağınık. */
export function scatterToppingPieces(layerId: string, count = 5): ScatterPoint[] {
  const out: ScatterPoint[] = [];
  const minGap = 42;

  for (let i = 0; i < count; i++) {
    let best: ScatterPoint | null = null;
    for (let attempt = 0; attempt < 48; attempt++) {
      const h = hash(layerId, i * 29 + attempt * 67);
      const candidate: ScatterPoint = {
        cx: 110 + (h % 690),
        cy: 14 + ((h >> 4) % 128),
        rot: -40 + (h % 80),
        scale: (0.85 + ((h >> 6) % 30) / 100) * TOPPING_SIZE,
      };
      if (out.every((p) => dist(p, candidate) >= minGap)) {
        best = candidate;
        break;
      }
      if (!best) best = candidate;
    }
    out.push(
      best ?? {
        cx: 180 + (i % 3) * 200,
        cy: 30 + Math.floor(i / 3) * 40,
        rot: i * 18,
        scale: 0.9 * TOPPING_SIZE,
      },
    );
  }
  return out;
}
