"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  isSupabasePublicConfigured,
  useSupabasePublicConfig,
} from "@/lib/supabase/public-config-context";
import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabasePublic = useSupabasePublicConfig();
  const configured = isSupabasePublicConfigured(supabasePublic);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  const refresh = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    try {
      const supabase = createSupabaseBrowserClient(supabasePublic);
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [configured, supabasePublic]);

  useEffect(() => {
    void refresh();
    if (!configured) return;
    const supabase = createSupabaseBrowserClient(supabasePublic);
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => sub.subscription.unsubscribe();
  }, [configured, refresh, supabasePublic]);

  const signOut = useCallback(async () => {
    if (!configured) return;
    const supabase = createSupabaseBrowserClient(supabasePublic);
    await supabase.auth.signOut();
    setUser(null);
  }, [configured, supabasePublic]);

  const value = useMemo(
    () => ({ user, loading, configured, signOut, refresh }),
    [user, loading, configured, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
