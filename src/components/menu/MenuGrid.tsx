"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SupportedLocale } from "@/lib/cart";
import { addExtraToCart } from "@/lib/cart";
import type { CatalogItem } from "@/lib/catalog-types";
import { formatEur } from "@/lib/format";
import { publicMenuImageSrc } from "@/lib/normalize-menu-image";
import { useI18n } from "@/components/providers/I18nProvider";

export type MenuGridCategory =
  | "pasta"
  | "sauce"
  | "soup"
  | "starter"
  | "special"
  | "topping"
  | "chef_special"
  | "drink";

type MenuGridProps = {
  title: string;
  subtitle?: string;
  items: CatalogItem[];
  category?: MenuGridCategory;
  variant?: "section" | "embedded";
  locale: SupportedLocale;
  /** Üst başlığı gösterme (sayfa dışında h2 kullanılıyorsa). */
  hideHeading?: boolean;
};

function nameOf(item: CatalogItem, locale: SupportedLocale) {
  return locale === "tr" ? item.name_tr : item.name_de;
}

export function MenuGrid({
  title,
  subtitle,
  items,
  category,
  variant = "section",
  locale,
  hideHeading = false,
}: MenuGridProps) {
  const { t } = useI18n();
  const [flash, setFlash] = useState<string | null>(null);
  const [picker, setPicker] = useState<CatalogItem | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!picker) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [picker]);

  const canAddCart =
    category === "chef_special" ||
    category === "soup" ||
    category === "starter" ||
    category === "drink";

  function openPicker(item: CatalogItem) {
    setQty(1);
    setPicker(item);
  }

  function confirmAdd() {
    if (!picker) return;
    addExtraToCart(picker.id, qty);
    setFlash(picker.id);
    setPicker(null);
    setTimeout(() => setFlash(null), 1200);
  }

  const innerGrid = (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {items.map((item) => {
        const label = nameOf(item, locale);
        const imageSrc = publicMenuImageSrc(item.image);
        const cardInner = (
          <>
            <div className="relative aspect-[4/3] w-full">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 45vw, 220px"
                  unoptimized
                />
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#1a2218] via-[#0f140d] to-[#0a0a0a]"
                  aria-hidden
                />
              )}
            </div>
            <div className="p-3">
              <p className="font-medium text-white">{label}</p>
              <p className="mt-1 text-sm font-semibold text-[#c49746]">{formatEur(item.price)}</p>
              {item.vegan && <p className="mt-1 text-xs text-white/40">vegan</p>}
              {canAddCart && (
                <button
                  type="button"
                  onClick={() => openPicker(item)}
                  className="mt-3 w-full rounded-lg border border-[#c49746]/50 bg-[#2e402a]/40 py-2 text-xs font-semibold text-[#c49746] hover:bg-[#2e402a]/70"
                >
                  {flash === item.id ? t("cart.added") : t("cart.add")}
                </button>
              )}
            </div>
          </>
        );

        if (canAddCart) {
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border-2 border-[#2e402a] bg-[#0f0f0f] shadow-md"
            >
              {cardInner}
            </div>
          );
        }

        if (category === "pasta") {
          const builderHref = `/builder?pasta=${encodeURIComponent(item.id)}`;
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border-2 border-[#2e402a] bg-[#0f0f0f] shadow-md transition hover:border-[#c49746]/50"
            >
              <Link href={builderHref} className="block">
                <div className="relative aspect-[4/3] w-full">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 45vw, 220px"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-[#1a2218] via-[#0f140d] to-[#0a0a0a]"
                      aria-hidden
                    />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-white">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-[#c49746]">{formatEur(item.price)}</p>
                  {item.vegan && <p className="mt-1 text-xs text-white/40">vegan</p>}
                </div>
              </Link>
              <div className="px-3 pb-3">
                <Link
                  href={builderHref}
                  className="flex w-full items-center justify-center rounded-lg border border-[#c49746]/50 bg-[#2e402a]/40 py-2 text-xs font-semibold text-[#c49746] hover:bg-[#2e402a]/70"
                >
                  {t("cart.add")}
                </Link>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.id}
            href="/builder"
            className="overflow-hidden rounded-xl border-2 border-[#2e402a] bg-[#0f0f0f] shadow-md transition hover:border-[#c49746]/60"
          >
            {cardInner}
          </Link>
        );
      })}
    </div>
  );

  const pickerLabel = picker ? nameOf(picker, locale) : "";
  const pickerImageSrc = picker ? publicMenuImageSrc(picker.image) : "";

  return (
    <>
      {picker ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-3 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="menu-add-qty-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label={t("cart.cancel")}
            onClick={() => setPicker(null)}
          />
          <div className="relative z-[1] w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#2e402a] bg-[#111] shadow-2xl">
            <div className="relative aspect-[16/9] w-full">
              {pickerImageSrc ? (
                <Image
                  src={pickerImageSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 448px"
                  unoptimized
                />
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-[#1a2218] to-[#0a0a0a]"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
            </div>
            <div className="p-5 pt-2">
              <h3 id="menu-add-qty-title" className="font-display text-xl font-bold text-white">
                {pickerLabel}
              </h3>
              <p className="mt-1 text-sm text-[#c49746]">{formatEur(picker.price)}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/45">
                {t("cart.quantity")}
              </p>
              <div className="mt-3 flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={qty <= 1}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2e402a] text-xl font-bold text-white transition hover:border-[#c49746]/50 disabled:opacity-35"
                  aria-label={t("cart.ariaDecrease")}
                >
                  −
                </button>
                <span className="min-w-[3rem] text-center font-display text-2xl font-bold text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  disabled={qty >= 99}
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2e402a] text-xl font-bold text-white transition hover:border-[#c49746]/50 disabled:opacity-35"
                  aria-label={t("cart.ariaIncrease")}
                >
                  +
                </button>
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse sm:gap-3">
                <button
                  type="button"
                  onClick={confirmAdd}
                  className="flex-1 rounded-xl py-3 font-display text-sm font-bold text-[#0a0a0a] transition hover:brightness-110"
                  style={{ backgroundColor: "#c49746" }}
                >
                  {t("cart.addConfirm")}
                </button>
                <button
                  type="button"
                  onClick={() => setPicker(null)}
                  className="flex-1 rounded-xl border border-[#2e402a] py-3 text-sm font-semibold text-white/80 hover:border-[#c49746]/40"
                >
                  {t("cart.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {variant === "embedded" ? (
        <div>
          {!hideHeading && (title || subtitle) ? (
            <>
              {title ? (
                <h3 className="font-display text-lg font-bold text-[#c49746]">{title}</h3>
              ) : null}
              {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
            </>
          ) : null}
          {innerGrid}
        </div>
      ) : (
        <section className="mt-14">
          {!hideHeading ? (
            <>
              <h2 className="font-display text-2xl font-bold text-[#c49746]">{title}</h2>
              {subtitle ? <p className="mt-1 text-sm text-white/55">{subtitle}</p> : null}
            </>
          ) : null}
          {innerGrid}
        </section>
      )}
    </>
  );
}
