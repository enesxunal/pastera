import { cookies } from "next/headers";
import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import type { SupportedLocale } from "@/lib/cart";
import { catalogByCategory } from "@/lib/catalog-static";
import { getCatalogFromDb } from "@/lib/catalog-server";

export default async function MenuGetraenkePage() {
  const catalog = await getCatalogFromDb();
  const locale = (cookies().get("pastera-locale")?.value === "tr" ? "tr" : "de") as SupportedLocale;
  const drinks = catalogByCategory(catalog, "drink");
  const de = locale === "de";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/menu"
        className="text-sm font-semibold text-[#c49746] underline-offset-4 hover:underline"
      >
        {de ? "← Zur Speisekarte" : "← Menüye dön"}
      </Link>

      <h1 className="mt-6 font-display text-4xl font-bold text-white">{de ? "Getränke" : "İçecekler"}</h1>
      <p className="mt-3 max-w-2xl text-white/60">
        {de
          ? "Mit Button in den Warenkorb legbar."
          : "Sepete ekle ile sepete eklenebilir."}
      </p>

      <MenuGrid
        title={de ? "Getränke" : "İçecekler"}
        subtitle={de ? "Wasser, Limonade, Kaffee, Wein." : "Su, limonata, kahve, şarap."}
        items={drinks}
        category="drink"
        locale={locale}
      />

      <div className="mt-14">
        <Link
          href="/menu"
          className="inline-flex items-center rounded-full border-2 border-[#2e402a] px-6 py-4 text-sm font-medium text-white/80 hover:border-[#c49746]/50"
        >
          {de ? "← Menü-Übersicht" : "← Menü çeşitleri"}
        </Link>
      </div>
    </div>
  );
}
