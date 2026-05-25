"use client";

import { AuthProvider } from "@/components/providers/AuthProvider";
import { CatalogProvider } from "@/components/providers/CatalogProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import type { SupportedLocale } from "@/lib/cart";
import {
  SupabasePublicConfigProvider,
  type SupabasePublicConfig,
} from "@/lib/supabase/public-config-context";
import type { ReactNode } from "react";

export function AppProviders({
  children,
  initialLocale,
  supabasePublic,
}: {
  children: ReactNode;
  initialLocale: SupportedLocale;
  supabasePublic: SupabasePublicConfig;
}) {
  return (
    <SupabasePublicConfigProvider config={supabasePublic}>
      <I18nProvider initialLocale={initialLocale}>
        <AuthProvider>
          <CatalogProvider>{children}</CatalogProvider>
        </AuthProvider>
      </I18nProvider>
    </SupabasePublicConfigProvider>
  );
}
