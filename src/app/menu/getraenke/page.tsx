import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import type { SupportedLocale } from "@/lib/cart";
import { catalogByCategory } from "@/lib/catalog-static";
import { getCatalogFromDb } from "@/lib/catalog-server";
import { message } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Getränke – Pastera Köln-Ehrenfeld",
  description: "Getränke auf der Pastera Speisekarte in Köln-Ehrenfeld entdecken.",
  alternates: { canonical: "/menu/getraenke" },
};

export default async function MenuGetraenkePage() {
  const catalog = await getCatalogFromDb();
  const locale = (cookies().get("pastera-locale")?.value === "tr" ? "tr" : "de") as SupportedLocale;
  const m = (key: string) => message(locale, key);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link href="/menu" className="text-sm font-semibold text-[#c49746] underline-offset-4 hover:underline">
        {m("common.backToMenu")}
      </Link>
      <h1 className="mt-6 font-display text-4xl font-bold text-white">{m("menuPages.drinksTitle")}</h1>
      <p className="mt-3 max-w-2xl text-white/60">{m("menuPages.drinksIntro")}</p>
      <MenuGrid title={m("menuPages.drinksTitle")} subtitle={m("menuPages.drinksGridSub")} items={catalogByCategory(catalog, "drink")} category="drink" locale={locale} hideHeading />
    </div>
  );
}
