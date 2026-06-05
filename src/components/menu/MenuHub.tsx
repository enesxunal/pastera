"use client";

import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { makarnaMenuItems, tatliMenuItems } from "@/lib/menu-hub-items";

export function MenuHub() {
  const { catalog } = useCatalog();
  const { locale, t } = useI18n();

  const makarnalar = makarnaMenuItems(catalog);
  const tatlilar = tatliMenuItems(catalog);

  return (
    <>
      <h1 className="font-display text-4xl font-bold text-white">{t("menuHub.title")}</h1>
      <p className="mt-3 max-w-2xl text-white/60">{t("menuHub.intro")}</p>

      <section
        id="makarnalar"
        className="mt-14 scroll-mt-24"
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

      <section id="tatli" className="mt-16 scroll-mt-24" aria-labelledby="menu-dessert-heading">
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

      <div className="mt-14 flex flex-wrap gap-4">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border-2 border-[#2e402a] px-6 py-4 text-sm font-medium text-white/80 hover:border-[#c49746]/50"
        >
          ← {t("nav.start")}
        </Link>
      </div>
    </>
  );
}
