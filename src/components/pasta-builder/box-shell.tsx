/**
 * Pastera kutu kabuğu — SVG path'leri.
 * viewBox: 0 0 200 260
 *
 * Kutu şeklini değiştirmek için:
 * 1) public/pastera-box-empty.svg dosyasını Illustrator/Figma'da aç
 * 2) Koordinatları buradaki BOX_MOUTH ve BOX_PATHS ile aynı tut
 */

/** Ağız poligonu (makarna/sos burada). */
export const BOX_MOUTH = "48,22 152,22 178,90 22,90";

export const BOX_PATHS = {
  /** Sol yan panel */
  sideLeft: "M4 256 L24 92 L48 22 L0 24 L0 256 Z",
  /** Sağ yan panel */
  sideRight: "M196 256 L176 92 L152 22 L200 24 L200 256 Z",
  /** Ön yüz (logo burada) */
  front: "M22 90 L178 90 L196 256 L4 256 Z",
  /** İç karton (ağız) */
  inner: BOX_MOUTH,
} as const;

export const BOX_LOGO = {
  title: { x: 100, y: 152, size: 18 },
  subtitle: { x: 100, y: 166, size: 5.5 },
} as const;

export const BOX_COLORS = {
  greenDark: "#1a2e22",
  greenMid: "#2f4d3a",
  greenSide: "#243d2e",
  gold: "#c49746",
  kraftTop: "#e6d9c4",
  kraftBottom: "#b8a480",
} as const;
