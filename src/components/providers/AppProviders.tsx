"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { CatalogProvider } from "@/components/providers/CatalogProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import type { SupportedLocale } from "@/lib/cart";
import type { ReactNode } from "react";

export function AppProviders({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: SupportedLocale;
}) {
  return (
    <I18nProvider initialLocale={initialLocale}>
      <AuthProvider>
        <CatalogProvider>{children}</CatalogProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
