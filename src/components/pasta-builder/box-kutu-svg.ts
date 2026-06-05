/** Illustrator'dan gelen pastera-kutu.svg — arka / ön katmanları ayırır. */

export type KutuSvgParts = {
  defs: string;
  arka: string;
  on: string;
};

let cache: KutuSvgParts | null = null;
let loadPromise: Promise<KutuSvgParts> | null = null;

export async function loadKutuSvg(): Promise<KutuSvgParts> {
  if (cache) return cache;
  if (loadPromise) return loadPromise;

  loadPromise = fetch("/pastera-kutu.svg")
    .then((r) => {
      if (!r.ok) throw new Error("pastera-kutu.svg yüklenemedi");
      return r.text();
    })
    .then((text) => {
      const doc = new DOMParser().parseFromString(text, "image/svg+xml");
      const defs = doc.querySelector("defs")?.innerHTML ?? "";
      const arka = doc.querySelector("#arka")?.innerHTML ?? "";
      const on =
        doc.querySelector("#_ön")?.innerHTML ??
        doc.querySelector('[data-name="ön"]')?.innerHTML ??
        doc.querySelector("#ön")?.innerHTML ??
        "";
      cache = { defs, arka, on };
      return cache;
    });

  return loadPromise;
}

/** Aynı sayfada birden fazla kutu olunca id çakışmasın diye. */
export function prefixSvgIds(html: string, uid: string): string {
  return html
    .replace(/\bid="([^"]+)"/g, `id="${uid}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${uid}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${uid}-$1"`)
    .replace(/xlink:href="#([^"]+)"/g, `xlink:href="#${uid}-$1"`);
}
