"use client";

import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { loadCartSnapshot, saveCartSnapshot } from "@/lib/cart";
import { pageIntro, staggerGrid } from "@/lib/motion-variants";
import { INGREDIENTS, PASTAS, SAUCES, SPECIALS } from "@/lib/menu-data";
import { formatEur } from "@/lib/format";
import { MenuPickCard } from "@/components/menu/MenuPickCard";
import { PastaBox } from "./PastaBox";

function toggleId(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

export function PastaBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pastaId, setPastaId] = useState(PASTAS[0].id);
  const [sauceIds, setSauceIds] = useState<string[]>([]);
  const [specialIds, setSpecialIds] = useState<string[]>([]);
  const [ingredientIds, setIngredientIds] = useState<string[]>([]);

  const pasta = PASTAS.find((p) => p.id === pastaId) ?? PASTAS[0];

  useEffect(() => {
    const saved = loadCartSnapshot();
    const urlPasta = searchParams.get("pasta");
    const urlOk = urlPasta && PASTAS.some((p) => p.id === urlPasta) ? urlPasta : null;

    if (!saved && !urlOk) return;

    const pid = urlOk ?? saved!.pastaId;
    setPastaId(pid);
    if (saved) {
      setSauceIds(saved.sauceIds);
      setSpecialIds(saved.specialIds);
      setIngredientIds(saved.ingredientIds);
    } else {
      setSauceIds([]);
      setSpecialIds([]);
      setIngredientIds([]);
    }
  }, [searchParams]);

  const sauces = SAUCES;
  const specials = SPECIALS;
  const ingredients = INGREDIENTS;

  const sauceItems = sauces.filter((x) => sauceIds.includes(x.id));
  const specialItems = specials.filter((x) => specialIds.includes(x.id));
  const ingredientItems = ingredients.filter((x) => ingredientIds.includes(x.id));

  const total = useMemo(() => {
    const s = sauceItems.reduce((a, x) => a + x.price, 0);
    const sp = specialItems.reduce((a, x) => a + x.price, 0);
    const ing = ingredientItems.reduce((a, x) => a + x.price, 0);
    return pasta.price + s + sp + ing;
  }, [pasta, sauceItems, specialItems, ingredientItems]);

  const boxLayers = useMemo(
    () => [
      ...sauceItems.map((x) => ({ id: x.id, name: x.name, image: x.image })),
      ...specialItems.map((x) => ({ id: x.id, name: x.name, image: x.image })),
      ...ingredientItems.map((x) => ({ id: x.id, name: x.name, image: x.image })),
    ],
    [sauceItems, specialItems, ingredientItems],
  );

  function goToWarenkorb() {
    const prev = loadCartSnapshot();
    saveCartSnapshot({
      veganOnly: pasta.vegan,
      pastaId,
      sauceIds,
      specialIds,
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
          Menü
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          Pasta zusammenstellen
        </h1>
        <p className="mt-3 text-base text-white/60">
          Wähle eine <span className="font-semibold text-white/85">Pasta-Basis</span> (klassisch oder
          vegan) – Saucen, Specials und Toppings sind frei kombinierbar. Der Preis aktualisiert sich
          live.
        </p>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,300px)] lg:items-start">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-lg font-semibold text-white">Pasta-Basis</h2>
            <p className="mt-1 text-sm text-white/50">Eine Option: klassisch oder vegan.</p>
            <motion.div
              className="mt-4 grid max-w-xl grid-cols-2 gap-3"
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.12 }}
            >
              {PASTAS.map((item) => (
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
            <h2 className="font-display text-lg font-semibold text-white">Saucen</h2>
            <p className="mt-1 text-sm text-white/50">Mehrere Saucen möglich.</p>
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
            <h2 className="font-display text-lg font-semibold text-white">Specials</h2>
            <p className="mt-1 text-sm text-white/50">Proteine &amp; Extras – mehrere möglich.</p>
            <motion.div
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.12 }}
            >
              {specials.map((item) => (
                <MenuPickCard
                  key={item.id}
                  item={item}
                  mode="multi"
                  selected={specialIds.includes(item.id)}
                  onSelect={() => setSpecialIds((ids) => toggleId(ids, item.id))}
                />
              ))}
            </motion.div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-white">Toppings</h2>
            <p className="mt-1 text-sm text-white/50">Was zusätzlich in die Schüssel soll.</p>
            <motion.div
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
              variants={staggerGrid}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.12 }}
            >
              {ingredients.map((item) => (
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
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50">Summe</p>
                <p className="font-display text-3xl font-bold text-white">{formatEur(total)}</p>
              </div>
              <button
                type="button"
                onClick={goToWarenkorb}
                className="rounded-full px-6 py-3 font-display text-sm font-bold text-matte transition hover:brightness-110"
                style={{ backgroundColor: "#c49746" }}
              >
                Weiter zum Warenkorb
              </button>
            </div>
            <p className="mt-3 text-xs text-white/45">
              Vorschau-Schüssel: Saucen, Specials und Toppings übereinander.
            </p>
          </motion.div>
        </div>

        <motion.aside
          className="lg:sticky lg:top-24"
          initial={{ opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        >
          <PastaBox pastaName={pasta.name} layers={boxLayers} />
        </motion.aside>
      </div>
    </div>
  );
}