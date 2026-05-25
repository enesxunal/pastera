/**
 * Menü PNG yolları Git/Vercel (Linux) üzerinde NFC olmalı.
 * Supabase / macOS kayıtları bazen NFD (Men + birleşik ü) içerir → 404.
 */
export function normalizeMenuImagePath(image: string | null | undefined): string {
  const raw = image?.trim() ?? "";
  if (!raw) return "";
  return raw.normalize("NFC");
}

/** next/image ve tarayıcı için güvenli public URL */
export function publicMenuImageSrc(image: string | null | undefined): string {
  const path = normalizeMenuImagePath(image);
  if (!path) return "";
  if (!path.startsWith("/")) return path;
  return encodeURI(path);
}
