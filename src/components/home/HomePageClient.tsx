"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MenuGrid } from "@/components/menu/MenuGrid";
import { MenuHighlights } from "@/components/home/MenuHighlights";
import { useCatalog } from "@/components/providers/CatalogProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { catalogByCategory } from "@/lib/catalog-static";
import { pageIntro } from "@/lib/motion-variants";

const BANNER_IMAGES = ["/pastera.jpg", "/pastera-vegan.jpg"] as const;
const BANNER_ROTATE_MS = 10_000;

export function HomePageClient() {
  const { t, locale } = useI18n();
  const { catalog } = useCatalog();
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBannerIdx((i) => (i + 1) % BANNER_IMAGES.length);
    }, BANNER_ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  const noodles = catalogByCategory(catalog, "pasta_base");
  const chefSpecials = catalogByCategory(catalog, "chef_special");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8">
      <section className="relative overflow-hidden rounded-2xl border border-[#2e402a]/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.75)]">
        <div className="absolute inset-0">
          {BANNER_IMAGES.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                i === bannerIdx ? "z-[1] opacity-100" : "z-0 opacity-0"
              }`}
              aria-hidden={i !== bannerIdx}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 1152px) 100vw, 1152px"
                priority={i === 0}
                unoptimized
              />
            </div>
          ))}
          <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/92 via-black/75 to-black/55 sm:from-black/88 sm:via-black/65" />
        </div>
        <div className="relative z-10 px-6 py-12 sm:px-10 sm:py-14 lg:py-16">
          <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex gap-1.5 sm:bottom-5 sm:right-5" aria-hidden>
            {BANNER_IMAGES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  i === bannerIdx ? "w-5 bg-[#c49746]" : "bg-white/35"
                }`}
              />
            ))}
          </div>
          <motion.div variants={pageIntro} initial="hidden" animate="show">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#c49746]">
              {t("home.kicker")}
            </p>
            <h1 className="mt-3 max-w-xl text-balance font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {t("home.title1")}
              <span className="text-[#c49746]"> {t("home.titleAccent")}</span>
            </h1>
            <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/70 sm:text-base">
              {t("home.leadShort")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full px-7 font-display text-sm font-bold text-[#0a0a0a] transition hover:brightness-110"
                style={{ backgroundColor: "#c49746" }}
              >
                {t("home.ctaMenu")}
              </Link>
              <Link
                href="/lieferung"
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-[#c49746]/50 bg-black/30 px-6 text-sm font-semibold text-[#c49746] backdrop-blur-sm transition hover:bg-black/45"
              >
                {t("home.ctaDelivery")}
              </Link>
              <Link
                href="/builder"
                className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full border border-white/25 bg-black/30 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-[#c49746]/50 hover:bg-black/45"
              >
                {t("home.ctaBuilder")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <MenuHighlights />

      <section className="mt-16 border-t border-[#2e402a]/70 pt-14" aria-labelledby="home-speisekarte">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="home-speisekarte" className="font-display text-2xl font-bold text-white sm:text-3xl">
            {t("home.productsHeading")}
          </h2>
          <Link
            href="/menu"
            className="text-sm font-semibold text-[#c49746] underline-offset-4 hover:underline"
          >
            {t("home.productsAllLink")}
          </Link>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-white/55">{t("home.productsSub")}</p>

        <div className="mt-10 space-y-14">
          {noodles.length > 0 ? (
            <div>
              <h3 className="font-display text-lg font-bold text-[#c49746]">{t("menu.sectionNoodles")}</h3>
              <p className="mt-1 text-sm text-white/45">{t("menu.sectionNoodlesHint")}</p>
              <MenuGrid
                variant="embedded"
                hideHeading
                title=""
                items={noodles}
                category="pasta"
                locale={locale}
              />
            </div>
          ) : null}

          {chefSpecials.length > 0 ? (
            <div>
              <h3 className="font-display text-lg font-bold text-[#c49746]">{t("menu.sectionChefSpecials")}</h3>
              <p className="mt-1 text-sm text-white/45">{t("menu.sectionChefSpecialsHint")}</p>
              <MenuGrid
                variant="embedded"
                hideHeading
                title=""
                items={chefSpecials}
                category="chef_special"
                locale={locale}
              />
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
