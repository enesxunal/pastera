"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/menu-data";
import { formatEur } from "@/lib/format";
import { menuItemDescription, menuItemLabel } from "@/lib/menu-i18n";
import { publicMenuImageSrc } from "@/lib/normalize-menu-image";
import { VeganBadge } from "@/components/menu/VeganBadge";
import { useI18n } from "@/components/providers/I18nProvider";

type Props = {
  item: MenuItem;
  selected: boolean;
  onSelect: () => void;
  mode: "single" | "multi";
};

export function MenuPickCard({ item, selected, onSelect, mode }: Props) {
  const { t, locale } = useI18n();
  const imageSrc = publicMenuImageSrc(item.image);
  const label = menuItemLabel(item.id, locale, item.name);
  const desc = menuItemDescription(item.id, locale, item.description);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 text-left shadow-md transition hover:scale-[1.02] active:scale-[0.97] ${
        selected
          ? "border-[#c49746] shadow-[0_0_28px_-6px_rgba(196,151,70,0.45)]"
          : "border-[#2e402a] hover:border-[#c49746]/40"
      }`}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 280px"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#1a2218] via-[#0f140d] to-[#0a0a0a]"
          aria-hidden
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      {item.vegan ? (
        <VeganBadge
          size="sm"
          label={t("menu.veganBadge")}
          className="absolute left-2 top-2 shadow-md"
        />
      ) : null}
      {selected ? (
        <span
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-[#0a0a0a] shadow-lg"
          style={{ backgroundColor: "#c49746" }}
        >
          {mode === "single" ? "●" : "✓"}
        </span>
      ) : null}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="font-display text-sm font-bold leading-tight text-white">{label}</p>
        {desc ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-white/55 sm:text-sm">{desc}</p>
        ) : null}
        <p className="mt-0.5 text-xs font-semibold text-[#c49746]">
          {mode === "single" ? formatEur(item.price) : `+${formatEur(item.price)}`}
        </p>
      </div>
    </button>
  );
}
