import { cookies } from "next/headers";
import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import type { SupportedLocale } from "@/lib/cart";
import { catalogByCategory } from "@/lib/catalog-static";
import { getCatalogFromDb } from "@/lib/catalog-server";
import { SAUCEN_KLASSISCH } from "@/lib/menu-data";

export default async function MenuPastaPage() {
  const catalog = await getCatalogFromDb();
  const locale = (cookies().get("pastera-locale")?.value === "tr" ? "tr" : "de") as SupportedLocale;
  const klassischIds = new Set(SAUCEN_KLASSISCH.map((x) => x.id));
  const sauces = catalogByCategory(catalog, "sauce");
  const saucenKlass = sauces.filter((s) => klassischIds.has(s.id));
  const saucenVeg = sauces.filter((s) => !klassischIds.has(s.id));

  const de = locale === "de";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/menu"
        className="text-sm font-semibold text-[#c49746] underline-offset-4 hover:underline"
      >
        {de ? "← Zur Speisekarte" : "← Menüye dön"}
      </Link>

      <h1 className="mt-6 font-display text-4xl font-bold text-white">{de ? "Pasta" : "Makarna"}</h1>
      <p className="mt-3 max-w-2xl text-white/60">
        {de
          ? "Basis, dann Saucen, Specials und Toppings – alles für eine Schüssel. Zusammenstellung im Konfigurator."
          : "Taban, sonra soslar, specialler ve toppingler. Oluşturma konfigüratörde."}
      </p>

      <MenuGrid
        title={de ? "Pasta-Basis" : "Makarna tabanı"}
        subtitle={de ? "Klassisch oder vegan." : "Klasik veya vegan."}
        items={catalogByCategory(catalog, "pasta_base")}
        category="pasta"
        locale={locale}
      />

      <section
        className="mt-14 rounded-2xl border-2 border-[#2e402a] bg-[#0c0c0c]/90 p-6 shadow-inner sm:p-8"
        aria-labelledby="pasta-extras-heading"
      >
        <h2
          id="pasta-extras-heading"
          className="font-display text-2xl font-bold text-[#c49746]"
        >
          {de ? "Schüssel · Saucen & Extras" : "Kase · sos ve ekstralar"}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          {de
            ? "Diese Optionen gehören zur Pasta-Schüssel und wählst du im Konfigurator."
            : "Bu seçenekler makarna kasesine aittir; konfigüratörde seçilir."}
        </p>

        <div className="mt-8 space-y-10">
          <MenuGrid
            variant="embedded"
            title={de ? "Saucen (klassisch)" : "Soslar (klasik)"}
            subtitle={de ? "Tomaten, Bolognese, Sahne …" : "Domates, Bolognese, krema …"}
            items={saucenKlass}
            category="sauce"
            locale={locale}
          />
          <MenuGrid
            variant="embedded"
            title={de ? "Saucen (vegan)" : "Soslar (vegan)"}
            items={saucenVeg}
            category="sauce"
            locale={locale}
          />
          <MenuGrid
            variant="embedded"
            title="Specials"
            items={catalogByCategory(catalog, "special")}
            category="special"
            locale={locale}
          />
          <MenuGrid
            variant="embedded"
            title={de ? "Toppings" : "Toppingler"}
            items={catalogByCategory(catalog, "topping")}
            category="topping"
            locale={locale}
          />
        </div>
      </section>

      <div className="mt-14 flex flex-wrap gap-4">
        <Link
          href="/builder"
          className="inline-flex rounded-full px-8 py-4 font-display text-sm font-bold text-[#0a0a0a] transition hover:brightness-110"
          style={{ backgroundColor: "#c49746" }}
        >
          {de ? "Pasta konfigurieren" : "Makarnayı oluştur"}
        </Link>
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
