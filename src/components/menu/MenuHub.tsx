"use client";

import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { catalogByCategory } from "@/lib/catalog-static";

export function MenuHub() {
  const { catalog } = useCatalog();
  const { locale, t } = useI18n();

  const pasta = catalogByCategory(catalog, "pasta_base");
  const soups = catalogByCategory(catalog, "soup");
  const starters = catalogByCategory(catalog, "starter");
  const drinks = catalogByCategory(catalog, "drink");

  return (
    <>
      <h1 className="font-display text-4xl font-bold text-white">{t("menuHub.title")}</h1>
      <p className="mt-3 max-w-2xl text-white/60">{t("menuHub.intro")}</p>

      <section className="mt-14" aria-labelledby="menu-pasta-heading">
        <h2 id="menu-pasta-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionPasta")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionPastaHint")}</p>
        {pasta.length === 0 ? (
          <p className="mt-6 text-sm text-white/45">{t("menu.emptySection")}</p>
        ) : (
          <div className="mt-6">
            <MenuGrid
              hideHeading
              title=""
              variant="embedded"
              items={pasta}
              category="pasta"
              locale={locale}
            />
          </div>
        )}
      </section>

      <section className="mt-16" aria-labelledby="menu-warm-heading">
        <h2 id="menu-warm-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionWarm")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionWarmHint")}</p>
        {soups.length === 0 && starters.length === 0 ? (
          <p className="mt-6 text-sm text-white/45">{t("menu.emptySection")}</p>
        ) : (
          <div className="mt-6 space-y-10">
            {soups.length > 0 ? (
              <MenuGrid
                variant="embedded"
                title={t("menu.subSoups")}
                items={soups}
                category="soup"
                locale={locale}
              />
            ) : null}
            {starters.length > 0 ? (
              <MenuGrid
                variant="embedded"
                title={t("menu.subStarters")}
                items={starters}
                category="starter"
                locale={locale}
              />
            ) : null}
          </div>
        )}
      </section>

      <section className="mt-16" aria-labelledby="menu-drinks-heading">
        <h2 id="menu-drinks-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionDrinks")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionDrinksHint")}</p>
        {drinks.length === 0 ? (
          <p className="mt-6 text-sm text-white/45">{t("menu.emptySection")}</p>
        ) : (
          <div className="mt-6">
            <MenuGrid
              hideHeading
              title=""
              variant="embedded"
              items={drinks}
              category="drink"
              locale={locale}
            />
          </div>
        )}
      </section>

      <div className="mt-14 flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border-2 border-[#2e402a] px-6 py-4 text-sm font-medium text-white/80 hover:border-[#c49746]/50"
        >
          ← {t("nav.start")}
        </Link>
        <Link
          href="/builder"
          className="inline-flex items-center rounded-full px-6 py-4 text-sm font-bold text-[#0a0a0a] hover:brightness-110"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("cart.toConfigurator")}
        </Link>
      </div>
    </>
  );
}
