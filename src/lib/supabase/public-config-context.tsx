"use client";

import { createContext, useContext, type ReactNode } from "react";

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

const SupabasePublicConfigContext = createContext<SupabasePublicConfig | null>(null);

export function SupabasePublicConfigProvider({
  config,
  children,
}: {
  config: SupabasePublicConfig;
  children: ReactNode;
}) {
  return (
    <SupabasePublicConfigContext.Provider value={config}>
      {children}
    </SupabasePublicConfigContext.Provider>
  );
}

export function useSupabasePublicConfig(): SupabasePublicConfig {
  const ctx = useContext(SupabasePublicConfigContext);
  if (!ctx) {
    throw new Error("useSupabasePublicConfig outside SupabasePublicConfigProvider");
  }
  return ctx;
}

export function isSupabasePublicConfigured(config: SupabasePublicConfig): boolean {
  return Boolean(config.url.length && config.anonKey.length);
}
