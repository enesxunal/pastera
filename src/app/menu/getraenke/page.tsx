import { cookies } from "next/headers";
import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import type { SupportedLocale } from "@/lib/cart";
import { catalogByCategory } from "@/lib/catalog-static";
import { getCatalogFromDb } from "@/lib/catalog-server";
import { message } from "@/lib/i18n";

export default async function MenuGetraenkePage() {
  const catalog = await getCatalogFromDb();
  const locale = (cookies().get("pastera-locale")?.value === "tr" ? "tr" : "de") as SupportedLocale;
  const drinks = catalogByCategory(catalog, "drink");
  const m = (key: string) => message(locale, key);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/menu"
        className="text-sm font-semibold text-[#c49746] underline-offset-4 hover:underline"
      >
        {m("common.backToMenu")}
      </Link>

      <h1 className="mt-6 font-display text-4xl font-bold text-white">{m("menuPages.drinksTitle")}</h1>
      <p className="mt-3 max-w-2xl text-white/60">{m("menuPages.drinksIntro")}</p>

      <MenuGrid
        title={m("menuPages.drinksTitle")}
        subtitle={m("menuPages.drinksGridSub")}
        items={drinks}
        category="drink"
        locale={locale}
      />

      <div className="mt-14">
        <Link
          href="/menu"
          className="inline-flex items-center rounded-full border-2 border-[#2e402a] px-6 py-4 text-sm font-medium text-white/80 hover:border-[#c49746]/50"
        >
          {m("menuPages.menuOverview")}
        </Link>
      </div>
    </div>
  );
}
