"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabasePublicConfig } from "@/lib/supabase/public-config-context";

export function createSupabaseBrowserClient(config: SupabasePublicConfig) {
  const { url, anonKey } = config;
  if (!url || !anonKey) {
    throw new Error("Supabase env eksik: NEXT_PUBLIC_SUPABASE_URL ve ANON_KEY tanımlı olmalı.");
  }
  return createBrowserClient(url, anonKey);
}
