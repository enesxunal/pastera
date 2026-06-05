"use client";

import Link from "next/link";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { catalogByCategory } from "@/lib/catalog-static";
import { formatEur } from "@/lib/format";

function MenuActionCard({
  href,
  title,
  description,
  priceLabel,
  badge,
}: {
  href: string;
  title: string;
  description: string;
  priceLabel?: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border-2 border-[#2e402a] bg-gradient-to-br from-[#141a12] to-[#0a0a0a] p-6 shadow-md transition hover:border-[#c49746]/55"
    >
      {badge ? (
        <span className="inline-block rounded-full bg-[#c49746]/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#c49746]">
          {badge}
        </span>
      ) : null}
      <h3 className="mt-3 font-display text-xl font-bold text-white group-hover:text-[#c49746]">
        {title}
      </h3>
      <p className="mt-2 text-sm text-white/55">{description}</p>
      {priceLabel ? (
        <p className="mt-4 font-display text-lg font-bold text-[#c49746]">{priceLabel}</p>
      ) : null}
      <span className="mt-4 inline-flex text-sm font-semibold text-white/70 group-hover:text-[#c49746]">
        →
      </span>
    </Link>
  );
}

// PASTA_BASE is not exported - use constant from menu
const BASE_PRICE = 6.9;

export function MenuHub() {
  const { catalog } = useCatalog();
  const { locale, t } = useI18n();

  const standardPastas = catalogByCategory(catalog, "chef_special");
  const desserts = catalogByCategory(catalog, "dessert");

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

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <MenuActionCard
            href="/builder"
            badge={t("menu.buildYourOwnBadge")}
            title={t("menu.buildYourOwn")}
            description={t("menu.buildYourOwnHint")}
            priceLabel={`${t("home.priceFrom")} ${formatEur(BASE_PRICE)}`}
          />
          <MenuActionCard
            href="#hazir-makarna"
            badge={t("menu.readyPastasBadge")}
            title={t("menu.readyPastas")}
            description={t("menu.readyPastasHint")}
          />
        </div>

        <div id="hazir-makarna" className="mt-12 scroll-mt-24">
          <h3 className="font-display text-lg font-bold text-[#c49746]">{t("menu.readyPastas")}</h3>
          <p className="mt-1 text-sm text-white/50">{t("menu.sectionStandardHint")}</p>
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
        </div>
      </section>

      <section id="tatli" className="mt-16 scroll-mt-24" aria-labelledby="menu-dessert-heading">
        <h2 id="menu-dessert-heading" className="font-display text-2xl font-bold text-[#c49746]">
          {t("menu.sectionDessert")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-white/50">{t("menu.sectionDessertHint")}</p>
        <div className="mt-8 space-y-10">
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

          <div>
            <h3 className="font-display text-lg font-bold text-[#c49746]">
              {t("menu.subChocolatePasta")}
            </h3>
            <p className="mt-1 text-sm text-white/50">{t("menu.chocolateSectionHint")}</p>
            <div className="mt-4">
              <MenuActionCard
                href="/builder/chocolate"
                badge={t("menu.buildYourOwnBadge")}
                title={t("menu.buildYourOwn")}
                description={t("menu.chocolateBuildYourOwnHint")}
                priceLabel={`${t("home.priceFrom")} ${formatEur(BASE_PRICE)}`}
              />
            </div>
          </div>

        </div>
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
