"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { loadCartSnapshot, saveCartSnapshot } from "@/lib/cart";
import { pageIntro, staggerGrid } from "@/lib/motion-variants";
import { CHOCOLATE_PASTA, TOPPINGS_CHOCOLATE } from "@/lib/menu-data";
import { formatEur } from "@/lib/format";
import { MenuPickCard } from "@/components/menu/MenuPickCard";
import { PastaBox } from "./PastaBox";

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

export function ChocolateBuilder() {
  const router = useRouter();
  const { t } = useI18n();
  const pasta = CHOCOLATE_PASTA;
  const pastaId = pasta.id;
  const [ingredientIds, setIngredientIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = loadCartSnapshot();
    if (!saved || saved.pastaId !== pastaId) return;
    setIngredientIds(saved.ingredientIds);
  }, [pastaId]);

  const ingredientItems = TOPPINGS_CHOCOLATE.filter((x) => ingredientIds.includes(x.id));

  const total = useMemo(() => {
    const ing = ingredientItems.reduce((a, x) => a + x.price, 0);
    return pasta.price + ing;
  }, [pasta, ingredientItems]);

  const boxLayers = useMemo(
    () => ingredientItems.map((x) => ({ id: x.id, name: x.name, image: x.image })),
    [ingredientItems],
  );

  function goToWarenkorb() {
    const prev = loadCartSnapshot();
    saveCartSnapshot({
      veganOnly: false,
      pastaId,
      sauceIds: [],
      specialIds: [],
      ingredientIds,
      extras: prev?.extras ?? [],
    });
    router.push("/warenkorb");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <motion.div
        className="mb-10 max-w-2xl"
        variants={pageIntro}
        initial="hidden"
        animate="show"
      >
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-gold">
          {t("chocolateBuilder.kicker")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          {t("chocolateBuilder.title")}
        </h1>
        <p className="mt-3 text-base text-white/60">{t("chocolateBuilder.intro")}</p>
        <p className="mt-2 text-sm font-semibold text-[#c49746]">
          {t("chocolateBuilder.base")}: {formatEur(pasta.price)}
        </p>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,300px)] lg:items-start">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              {t("chocolateBuilder.toppingsTitle")}
            </h2>
            <p className="mt-1 text-sm text-white/50">{t("chocolateBuilder.toppingsHint")}</p>
            <motion.div
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.12 }}
            >
              {TOPPINGS_CHOCOLATE.map((item) => (
                <MenuPickCard
                  key={item.id}
                  item={item}
                  mode="multi"
                  selected={ingredientIds.includes(item.id)}
                  onSelect={() => setIngredientIds((ids) => toggleId(ids, item.id))}
                />
              ))}
            </motion.div>
          </section>

          <motion.div
            className="rounded-2xl border-2 border-[#2e402a] bg-brand-forest/35 p-5 shadow-box"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50">{t("builder.total")}</p>
                <p className="font-display text-3xl font-bold text-white">{formatEur(total)}</p>
              </div>
              <button
                type="button"
                onClick={goToWarenkorb}
                className="rounded-full px-6 py-3 font-display text-sm font-bold text-matte transition hover:brightness-110"
                style={{ backgroundColor: "#c49746" }}
              >
                {t("builder.toCart")}
              </button>
            </div>
          </motion.div>
        </div>

        <motion.aside
          className="lg:sticky lg:top-24"
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <PastaBox pastaName={pasta.name} layers={boxLayers} />
        </motion.aside>
      </div>
    </div>
  );
}
