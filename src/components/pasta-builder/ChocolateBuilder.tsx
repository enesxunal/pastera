"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { addBowlToCart, getBowlFromCart, updateBowlInCart } from "@/lib/cart";
import { pageIntro } from "@/lib/motion-variants";
import {
  CHOCOLATE_BOWL_MARKER,
  CHOCOLATE_PASTA,
  isChocolateBowl,
  saucesForChocolateBowl,
  toppingsForChocolateBowl,
  type MenuItem,
} from "@/lib/menu-data";
import { formatEur } from "@/lib/format";
import { menuItemLabel } from "@/lib/menu-i18n";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
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
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <MenuPickCard
          key={item.id}
          item={item}
          mode="multi"
          selected={ingredientIds.includes(item.id)}
          onSelect={() => setIngredientIds((ids) => toggleId(ids, item.id))}
        />
      ))}
    </div>
  );
}

export function ChocolateBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useI18n();
  const [sauceIds, setSauceIds] = useState<string[]>([]);
  const [ingredientIds, setIngredientIds] = useState<string[]>([]);
  const [cartErr, setCartErr] = useState("");

  const pastaItem = useMemo(
    () => ({
      ...CHOCOLATE_PASTA,
      name: menuItemLabel(CHOCOLATE_PASTA.id, locale, CHOCOLATE_PASTA.name),
    }),
    [locale],
  );

  const sauces = useMemo(() => saucesForChocolateBowl(), []);
  const toppings = useMemo(() => toppingsForChocolateBowl(), []);

  useEffect(() => {
    const isEdit = searchParams.get("edit") === "1";
    const bowlId = searchParams.get("bowl");

    if (isEdit && bowlId) {
      const bowl = getBowlFromCart(bowlId);
      if (bowl && isChocolateBowl(bowl)) {
        setSauceIds(bowl.sauceIds);
        setIngredientIds(bowl.ingredientIds);
        setCartErr("");
        return;
      }
    }

    setSauceIds([]);
    setIngredientIds([]);
    setCartErr("");
  }, [searchParams]);

  const sauceItems = sauces.filter((x) => sauceIds.includes(x.id));
  const ingredientItems = toppings.filter((x) => ingredientIds.includes(x.id));

  const total = useMemo(() => {
    const s = sauceItems.reduce((a, x) => a + x.price, 0);
    const ing = ingredientItems.reduce((a, x) => a + x.price, 0);
    return CHOCOLATE_PASTA.price + s + ing;
  }, [sauceItems, ingredientItems]);

  const boxLayers = useMemo(
    () => [
      ...sauceItems.map((x) => ({
        id: x.id,
        name: menuItemLabel(x.id, locale, x.name),
        image: x.image,
      })),
      ...ingredientItems.map((x) => ({
        id: x.id,
        name: menuItemLabel(x.id, locale, x.name),
        image: x.image,
      })),
    ],
    [sauceItems, ingredientItems, locale],
  );

  function goToWarenkorb() {
    setCartErr("");
    const bowlPayload = {
      pastaId: CHOCOLATE_PASTA.id,
      sauceIds,
      specialIds: [CHOCOLATE_BOWL_MARKER],
      ingredientIds,
    };
    const isEdit = searchParams.get("edit") === "1";
    const bowlId = searchParams.get("bowl");

    if (isEdit && bowlId && updateBowlInCart(bowlId, bowlPayload)) {
      router.push("/warenkorb");
      return;
    }

    const result = addBowlToCart(bowlPayload);
    if (!result.ok) {
      setCartErr(t("cart.maxBowlsReached"));
      return;
    }
    router.push("/warenkorb");
  }

  const editingBowl = searchParams.get("edit") === "1" && searchParams.get("bowl");
  const cartButtonLabel = editingBowl ? t("builder.updateCart") : t("builder.toCart");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-28 sm:px-6 lg:py-14 lg:pb-14">
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
        <div className="space-y-10 lg:order-1">
          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              {t("chocolateBuilder.pastaTitle")}
            </h2>
            <p className="mt-1 text-sm text-white/50">{t("chocolateBuilder.pastaHint")}</p>
            <div className="mt-4 max-w-xs">
              <MenuPickCard
                item={pastaItem}
                mode="single"
                selected
                onSelect={() => {}}
              />
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">
              {t("chocolateBuilder.saucesTitle")}
            </h2>
            <p className="mt-1 text-sm text-white/50">{t("chocolateBuilder.saucesHint")}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sauces.map((item) => (
                <MenuPickCard
                  key={item.id}
                  item={item}
                  mode="multi"
                  selected={sauceIds.includes(item.id)}
                  onSelect={() => setSauceIds((ids) => toggleId(ids, item.id))}
                />
              ))}
            </div>
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

          <div className="hidden rounded-2xl border-2 border-[#2e402a] bg-brand-forest/35 p-5 shadow-box lg:block">
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
                {cartButtonLabel}
              </button>
            </div>
            {cartErr ? <p className="mt-3 text-sm text-red-400">{cartErr}</p> : null}
          </div>
        </div>

        <div className="lg:order-2">
          <PastaBox
            pastaId={CHOCOLATE_PASTA.id}
            pastaName={pastaItem.name}
            layers={boxLayers}
          />
        </div>
      </div>

      <MobileActionBar
        totalLabel={t("builder.total")}
        total={formatEur(total)}
        buttonLabel={cartButtonLabel}
        onAction={goToWarenkorb}
      />
    </div>
  );
}
