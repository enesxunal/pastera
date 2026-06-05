"use client";

import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { catalogByCategory } from "@/lib/catalog-static";
import { makarnaMenuItems, tatliMenuItems } from "@/lib/menu-hub-items";

const sections = [
  { id: "makarnalar", key: "sectionPasta" as const },
  { id: "tatli", key: "sectionDessert" as const },
  { id: "icecekler", key: "sectionDrinks" as const },
];

export function MenuHub() {
  const { catalog } = useCatalog();
  const { locale, t } = useI18n();

  const makarnalar = makarnaMenuItems(catalog);
  const tatlilar = tatliMenuItems(catalog);
  const icecekler = catalogByCategory(catalog, "drink");

  return (
    <>
      <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{t("menuHub.title")}</h1>
      <p className="mt-3 max-w-2xl text-white/60">{t("menuHub.intro")}</p>

      <nav
        className="sticky top-16 z-10 -mx-4 mt-8 border-b border-[#2e402a]/80 bg-matte/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6"
        aria-label={t("menuHub.title")}
      >
        <ul className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((sec) => (
            <li key={sec.id} className="shrink-0">
              <a
                href={`#${sec.id}`}
                className="inline-flex min-h-11 items-center rounded-full border border-[#2e402a] px-4 text-sm font-semibold text-white/75 transition hover:border-[#c49746]/50 hover:text-white"
              >
                {t(`menu.${sec.key}`)}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section
        id="makarnalar"
        className="mt-10 scroll-mt-32"
        aria-labelledby="menu-pasta-heading"
      >
        <h2 id="menu-pasta-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionPasta")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionPastaChoiceHint")}</p>

        {makarnalar.length === 0 ? (
          <p className="mt-6 text-sm text-white/45">{t("menu.emptySection")}</p>
        ) : (
          <div className="mt-8">
            <MenuGrid
              hideHeading
              title=""
              variant="embedded"
              items={makarnalar}
              category="menu_mixed"
              locale={locale}
            />
          </div>
        )}
      </section>

      <section id="tatli" className="mt-16 scroll-mt-32" aria-labelledby="menu-dessert-heading">
        <h2 id="menu-dessert-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionDessert")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionDessertHint")}</p>

        {tatlilar.length === 0 ? (
          <p className="mt-6 text-sm text-white/45">{t("menu.emptySection")}</p>
        ) : (
          <div className="mt-8">
            <MenuGrid
              hideHeading
              title=""
              variant="embedded"
              items={tatlilar}
              category="menu_mixed"
              locale={locale}
            />
          </div>
        )}
      </section>

      <section id="icecekler" className="mt-16 scroll-mt-32" aria-labelledby="menu-drinks-heading">
        <h2 id="menu-drinks-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionDrinks")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionDrinksHint")}</p>

        {icecekler.length === 0 ? (
          <p className="mt-6 text-sm text-white/45">{t("menu.emptySection")}</p>
        ) : (
          <div className="mt-8">
            <MenuGrid
              hideHeading
              title=""
              variant="embedded"
              items={icecekler}
              category="drink"
              locale={locale}
            />
          </div>
        )}
      </section>

      <div className="mt-14 flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full border-2 border-[#2e402a] px-6 py-3 text-sm font-medium text-white/80 hover:border-[#c49746]/50"
        >
          ← {t("nav.start")}
        </Link>
      </div>
    </>
  );
}
