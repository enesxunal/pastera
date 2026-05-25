import { cookies } from "next/headers";
import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import type { SupportedLocale } from "@/lib/cart";
import { catalogByCategory } from "@/lib/catalog-static";
import { getCatalogFromDb } from "@/lib/catalog-server";

export default async function MenuVorspeisenPage() {
  const catalog = await getCatalogFromDb();
  const locale = (cookies().get("pastera-locale")?.value === "tr" ? "tr" : "de") as SupportedLocale;
  const suppen = catalogByCategory(catalog, "soup");
  const mezeler = catalogByCategory(catalog, "starter");
  const de = locale === "de";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/menu"
        className="text-sm font-semibold text-[#c49746] underline-offset-4 hover:underline"
      >
        {de ? "← Zur Speisekarte" : "← Menüye dön"}
      </Link>

      <h1 className="mt-6 font-display text-4xl font-bold text-white">
        {de ? "Warm & klein" : "Ara sıcaklar"}
      </h1>
      <p className="mt-2 text-sm font-medium text-[#c49746]">
        {suppen.length} {de ? "Suppe" : "çorba"} · {mezeler.length}{" "}
        {de ? "Vorspeisen" : "meze"}
      </p>
      <p className="mt-3 max-w-2xl text-white/60">
        {de
          ? "Zur Übersicht – mit Button in den Warenkorb legbar."
          : "Listeleme — sepete ekle düğmesiyle."}
      </p>

      <MenuGrid
        title={de ? "Suppen" : "Çorbalar"}
        subtitle={de ? "Warm und einladend." : "Sıcak çorbalar."}
        items={suppen}
        category="soup"
        locale={locale}
      />
      <MenuGrid
        title={de ? "Vorspeisen" : "Mezeler"}
        subtitle={de ? "Zum Teilen oder als Start." : "Paylaşım veya başlangıç."}
        items={mezeler}
        category="starter"
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
