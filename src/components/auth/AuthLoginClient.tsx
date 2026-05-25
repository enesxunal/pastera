"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function LoginForm() {
  const { t, locale } = useI18n();
  const { configured } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!configured) {
      setErr(t("auth.configError"));
      return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErr(locale === "de" ? "E-Mail oder Passwort falsch." : "E-posta veya şifre hatalı.");
        return;
      }
      router.push("/auth/account");
      router.refresh();
    } catch {
      setErr(t("auth.configError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">{t("auth.loginTitle")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("auth.loginHint")}</p>
      {searchParams.get("error") ? (
        <p className="mt-3 text-sm text-red-400">{t("auth.loginError")}</p>
      ) : null}
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm text-white/60">
          {t("auth.email")}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-4 py-3 text-white"
          />
        </label>
        <label className="block text-sm text-white/60">
          {t("auth.password")}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-4 py-3 text-white"
          />
        </label>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full py-3 font-display text-sm font-bold text-[#0a0a0a] disabled:opacity-50"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("auth.submitLogin")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        {t("auth.noAccount")}{" "}
        <Link href="/auth/register" className="text-[#c49746] underline">
          {t("auth.registerLink")}
        </Link>
      </p>
    </div>
  );
}

export function AuthLoginClient() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-white/50">…</div>}>
      <LoginForm />
    </Suspense>
  );
}
