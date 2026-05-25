"use client";

import type { SupportedLocale } from "@/lib/cart";
import de from "@/messages/de.json";
import tr from "@/messages/tr.json";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Messages = typeof de;

const dict: Record<SupportedLocale, Messages> = { de, tr };

function getPath(obj: unknown, path: string): string {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur === null || cur === undefined) return path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : path;
}

type I18nCtx = {
  locale: SupportedLocale;
  setLocale: (l: SupportedLocale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: SupportedLocale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale);

  const setLocale = useCallback(
    (l: SupportedLocale) => {
      void fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: l }),
      }).then(() => {
        setLocaleState(l);
        router.refresh();
      });
    },
    [router],
  );

  const t = useCallback(
    (key: string) => {
      return getPath(dict[locale], key);
    },
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside I18nProvider");
  return ctx;
}
