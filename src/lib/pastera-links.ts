/** QR / Biolink ve iletişim — tek kaynak */

export const PASTERA_PHONE_DISPLAY = "+49 15566 487369";
export const PASTERA_PHONE_TEL = "+4915566487369";

export const PASTERA_WEBSITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || "https://www.pastera.de";

export const PASTERA_GOOGLE_REVIEW_URL =
  process.env.PASTERA_GOOGLE_REVIEW_URL?.trim() || "https://share.google/4ZurzcetCjhVrgo9K";

export const PASTERA_INSTAGRAM_URL = "https://www.instagram.com/pastera.official/";
export const PASTERA_FACEBOOK_URL = "https://www.facebook.com/pastera.official";
export const PASTERA_TIKTOK_URL = "https://www.tiktok.com/@pastera.official";

export type PasteraLinkItem = {
  id: string;
  href: string;
  external?: boolean;
  tel?: boolean;
};

/** Sosyal medya + Google — QR sayfasında üstte, belirgin */
export const PASTERA_SOCIAL_ITEMS: PasteraLinkItem[] = [
  { id: "instagram", href: PASTERA_INSTAGRAM_URL, external: true },
  { id: "facebook", href: PASTERA_FACEBOOK_URL, external: true },
  { id: "tiktok", href: PASTERA_TIKTOK_URL, external: true },
  { id: "google", href: PASTERA_GOOGLE_REVIEW_URL, external: true },
];

/** Menü, sipariş, iletişim */
export const PASTERA_ACTION_ITEMS: PasteraLinkItem[] = [
  { id: "website", href: PASTERA_WEBSITE_URL, external: true },
  { id: "menu", href: `${PASTERA_WEBSITE_URL}/menu`, external: true },
  { id: "builder", href: `${PASTERA_WEBSITE_URL}/builder`, external: true },
  { id: "builderVegan", href: `${PASTERA_WEBSITE_URL}/builder/vegan`, external: true },
  { id: "phone", href: `tel:${PASTERA_PHONE_TEL}`, tel: true },
];

/** @deprecated PASTERA_ACTION_ITEMS + PASTERA_SOCIAL_ITEMS kullanın */
export const PASTERA_BIOLINK_ITEMS: PasteraLinkItem[] = [
  ...PASTERA_SOCIAL_ITEMS,
  ...PASTERA_ACTION_ITEMS,
];
