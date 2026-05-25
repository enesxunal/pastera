import type { SupportedLocale } from "@/lib/cart";
import de from "@/messages/de.json";
import tr from "@/messages/tr.json";

const dict = { de, tr } as const;

function getPath(obj: unknown, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined) return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : path;
}

export function message(locale: SupportedLocale, key: string): string {
  return getPath(dict[locale], key);
}
