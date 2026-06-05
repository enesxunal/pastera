"use client";

import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { catalogByCategory } from "@/lib/catalog-static";

export function MenuHub() {
  const { catalog } = useCatalog();
  const { locale, t } = useI18n();

  const allPastaBase = catalogByCategory(catalog, "pasta_base");
  const noodles = allPastaBase.filter((x) => x.id !== "noodle-chocolate");
  const chocolatePasta = allPastaBase.filter((x) => x.id === "noodle-chocolate");
  const standardPastas = catalogByCategory(catalog, "chef_special");
  const desserts = catalogByCategory(catalog, "dessert");

  return (
    <>
      <h1 className="font-display text-4xl font-bold text-white">{t("menuHub.title")}</h1>
      <p className="mt-3 max-w-2xl text-white/60">{t("menuHub.intro")}</p>

      <section className="mt-14" aria-labelledby="menu-noodles-heading">
        <h2 id="menu-noodles-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionNoodles")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionNoodlesHint")}</p>
        {noodles.length === 0 ? (
          <p className="mt-6 text-sm text-white/45">{t("menu.emptySection")}</p>
        ) : (
          <div className="mt-6">
            <MenuGrid
              hideHeading
              title=""
              variant="embedded"
              items={noodles}
              category="pasta"
              locale={locale}
            />
          </div>
        )}
      </section>

      <section
        id="standart-makarna"
        className="mt-16 scroll-mt-24"
        aria-labelledby="menu-standard-heading"
      >
        <h2 id="menu-standard-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionStandard")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionStandardHint")}</p>
        {standardPastas.length === 0 ? (
          <p className="mt-6 text-sm text-white/45">{t("menu.emptySection")}</p>
        ) : (
          <div className="mt-6">
            <MenuGrid
              hideHeading
              title=""
              variant="embedded"
              items={standardPastas}
              category="chef_special"
              locale={locale}
            />
          </div>
        )}
      </section>

      <section id="tatli" className="mt-16 scroll-mt-24" aria-labelledby="menu-dessert-heading">
        <h2 id="menu-dessert-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionDessert")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionDessertHint")}</p>
        <div className="mt-6 space-y-10">
          {desserts.length > 0 ? (
            <MenuGrid
              hideHeading
              title=""
              variant="embedded"
              items={desserts}
              category="dessert"
              locale={locale}
            />
          ) : null}
          {chocolatePasta.length > 0 ? (
            <div>
              <h3 className="font-display text-lg font-bold text-[#c49746]">
                {t("menu.subChocolatePasta")}
              </h3>
              <p className="mt-1 text-sm text-white/50">{t("menu.subChocolatePastaHint")}</p>
              <MenuGrid
                hideHeading
                title=""
                variant="embedded"
                items={chocolatePasta}
                category="pasta"
                locale={locale}
              />
            </div>
          ) : null}
          {desserts.length === 0 && chocolatePasta.length === 0 ? (
            <p className="text-sm text-white/45">{t("menu.emptySection")}</p>
          ) : null}
        </div>
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
