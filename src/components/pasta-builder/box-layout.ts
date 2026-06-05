/**
 * Illustrator kutu koordinatları — viewBox: 0 0 909.7 403.3
 * public/pastera-kutu.svg ile aynı.
 */

export const BOX_VIEWBOX = { w: 909.7, h: 403.3 } as const;

/** Kutu ağzı — Illustrator ile aynı (referans). */
export const BOX_MOUTH = "727.2,0 182.6,0 0,161.1 909.7,161.1";

/** Karton iç — Illustrator arka rect üstü düz, kubbe ile uzatıyoruz. */
export const KRAFT_INTERIOR =
  "M 182.6 0 L 727.2 0 L 909.7 161.1 L 0 161.1 Z";

/** Karton üst — çok hafif, kesik çizgi olmasın. */
export const KRAFT_MOUND_CAP =
  "M 182.6 0 L 310 5 Q 455 10 600 5 L 727.2 0 Z";

export const PASTA_CENTER = { cx: 455, cy: 78 } as const;
export const MOUTH_BOTTOM = 155;
/** Makarna üst yüksekliği (clip yok, sadece çizim) */
export const MOUTH_TOP = 18;

/** Ağız genişliği — y seviyesinde sol/sağ. */
export function mouthSpanAtY(y: number): { left: number; right: number; width: number } {
  const t = y / 161.1;
  const left = 182.6 - 182.6 * t;
  const right = 727.2 + 182.5 * t;
  return { left, right, width: right - left };
}

/** Noktayı kutu ağzı yanlarına sıkıştır — yan taşma olmasın. */
export function clampToMouth(x: number, y: number, margin = 10): { x: number; y: number } {
  const span = mouthSpanAtY(y);
  return {
    x: Math.min(span.right - margin, Math.max(span.left + margin, x)),
    y,
  };
}

/** Dolu yığın — alçak kubbe, üstte kesik yok */
export const PASTA_MOUND =
  "M 25 153 L 885 153 Q 845 128 705 28 Q 455 10 205 28 Q 65 128 25 153 Z";

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
