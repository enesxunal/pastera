import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import type { SupportedLocale } from "@/lib/cart";
import { catalogByCategory } from "@/lib/catalog-static";
import { getCatalogFromDb } from "@/lib/catalog-server";
import { message } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Vorspeisen & Suppen – Pastera Köln",
  description: "Suppen und Vorspeisen auf der Pastera Speisekarte in Köln-Ehrenfeld entdecken.",
  alternates: { canonical: "/menu/vorspeisen" },
};

export default async function MenuVorspeisenPage() {
  const catalog = await getCatalogFromDb();
  const locale = (cookies().get("pastera-locale")?.value === "tr" ? "tr" : "de") as SupportedLocale;
  const m = (key: string) => message(locale, key);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href="/menu" className="text-sm font-semibold text-[#c49746] underline-offset-4 hover:underline">
        {m("common.backToMenu")}
      </Link>
      <h1 className="mt-6 font-display text-4xl font-bold text-white">{m("menuPages.warmTitle")}</h1>
      <p className="mt-3 max-w-2xl text-white/60">{m("menuPages.warmIntro")}</p>
      <MenuGrid title={m("menuPages.soupsTitle")} subtitle={m("menuPages.soupsSub")} items={catalogByCategory(catalog, "soup")} category="soup" locale={locale} />
      <MenuGrid title={m("menuPages.startersTitle")} subtitle={m("menuPages.startersSub")} items={catalogByCategory(catalog, "starter")} category="starter" locale={locale} />
    </div>
  );
}
