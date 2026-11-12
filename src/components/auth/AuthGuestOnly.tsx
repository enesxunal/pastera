"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

/** Giriş yapmış kullanıcıyı hesaba yönlendir */
export function AuthGuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\");
      router.replace(safeNext ? next : "/auth/account");
    }
  }, [loading, user, router]);

  if (loading || user) {
    return <div className="py-20 text-center text-white/50">…</div>;
  }

  return <>{children}</>;
}
