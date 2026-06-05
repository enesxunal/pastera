"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { loadCartSnapshot, saveCartSnapshot } from "@/lib/cart";
import { pageIntro, staggerGrid } from "@/lib/motion-variants";
import {
  BUILDER_PASTAS,
  CHOCOLATE_BOWL_MARKER,
  CHOCOLATE_PASTA,
  isChocolateBowl,
  normalizeBuilderPastaId,
  saucesForChocolateBowl,
  toppingsForChocolateBowl,
  type MenuItem,
} from "@/lib/menu-data";
import { formatEur } from "@/lib/format";
import { MenuPickCard } from "@/components/menu/MenuPickCard";
import { PastaBox } from "./PastaBox";

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

function ToppingGrid({
  items,
  ingredientIds,
  setIngredientIds,
}: {
  items: MenuItem[];
  ingredientIds: string[];
  setIngredientIds: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <motion.div
      className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
      variants={staggerGrid}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
    >
      {items.map((item) => (
        <MenuPickCard
          key={item.id}
          item={item}
          mode="multi"
          selected={ingredientIds.includes(item.id)}
          onSelect={() => setIngredientIds((ids) => toggleId(ids, item.id))}
        />
      ))}
    </motion.div>
  );
}

export function ChocolateBuilder() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const [pastaId, setPastaId] = useState(BUILDER_PASTAS[0].id);
  const [sauceIds, setSauceIds] = useState<string[]>([]);
  const [ingredientIds, setIngredientIds] = useState<string[]>([]);

  const pasta = BUILDER_PASTAS.find((p) => p.id === pastaId) ?? BUILDER_PASTAS[0];
  const sauces = useMemo(() => saucesForChocolateBowl(), []);
  const toppings = useMemo(() => toppingsForChocolateBowl(), []);

  useEffect(() => {
    const saved = loadCartSnapshot();
    if (!saved) return;

    if (isChocolateBowl(saved)) {
      setPastaId(normalizeBuilderPastaId(saved.pastaId));
      setSauceIds(saved.sauceIds);
      setIngredientIds(saved.ingredientIds);
      return;
    }

    if (saved.pastaId === CHOCOLATE_PASTA.id) {
      setPastaId(BUILDER_PASTAS[0].id);
      setSauceIds(saved.sauceIds);
      setIngredientIds(saved.ingredientIds);
    }
  }, []);

  const sauceItems = sauces.filter((x) => sauceIds.includes(x.id));
  const ingredientItems = toppings.filter((x) => ingredientIds.includes(x.id));

  const total = useMemo(() => {
    const s = sauceItems.reduce((a, x) => a + x.price, 0);
    const ing = ingredientItems.reduce((a, x) => a + x.price, 0);
    return CHOCOLATE_PASTA.price + s + ing;
  }, [sauceItems, ingredientItems]);

  const boxLayers = useMemo(
    () => [
      ...sauceItems.map((x) => ({ id: x.id, name: x.name, image: x.image })),
      ...ingredientItems.map((x) => ({ id: x.id, name: x.name, image: x.image })),
    ],
    [sauceItems, ingredientItems],
  );

  function goToWarenkorb() {
    const prev = loadCartSnapshot();
    saveCartSnapshot({
      veganOnly: pasta.vegan,
      pastaId,
      sauceIds,
      specialIds: [CHOCOLATE_BOWL_MARKER],
      ingredientIds,
      extras: prev?.extras ?? [],
    });
    router.push("/warenkorb");
  }

  const displayName = locale === "tr" ? "Çikolatalı makarna" : CHOCOLATE_PASTA.name;

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
          {t("chocolateBuilder.base")}: {formatEur(CHOCOLATE_PASTA.price)}
        </p>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,300px)] lg:items-start">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              {t("builder.step1Title")}
            </h2>
            <p className="mt-1 text-sm text-white/50">{t("builder.step1Hint")}</p>
            <motion.div
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.12 }}
            >
              {BUILDER_PASTAS.map((item) => (
                <MenuPickCard
                  key={item.id}
                  item={item}
                  mode="single"
                  selected={pastaId === item.id}
                  onSelect={() => setPastaId(item.id)}
                />
              ))}
            </motion.div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              {t("chocolateBuilder.saucesTitle")}
            </h2>
            <p className="mt-1 text-sm text-white/50">{t("chocolateBuilder.saucesHint")}</p>
            <motion.div
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.12 }}
            >
              {sauces.map((item) => (
                <MenuPickCard
                  key={item.id}
                  item={item}
                  mode="multi"
                  selected={sauceIds.includes(item.id)}
                  onSelect={() => setSauceIds((ids) => toggleId(ids, item.id))}
                />
              ))}
            </motion.div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              {t("chocolateBuilder.toppingsTitle")}
            </h2>
            <p className="mt-1 text-sm text-white/50">{t("chocolateBuilder.toppingsHint")}</p>
            <ToppingGrid
              items={toppings}
              ingredientIds={ingredientIds}
              setIngredientIds={setIngredientIds}
            />
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
          <PastaBox pastaName={`${displayName} · ${pasta.name}`} layers={boxLayers} />
        </motion.aside>
      </div>
    </div>
  );
}
