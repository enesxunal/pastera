"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useSupabasePublicConfig } from "@/lib/supabase/public-config-context";
import { authCallbackUrl } from "@/lib/site-url";

export function AuthRegisterClient() {
  const { t } = useI18n();
  const { configured } = useAuth();
  const supabasePublic = useSupabasePublicConfig();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!configured) {
      setErr(t("auth.configError"));
      return;
    }
    setBusy(true);
    try {
      const supabase = createSupabaseBrowserClient(supabasePublic);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: authCallbackUrl(),
        },
      });
      if (error) {
        setErr(error.message);
        return;
      }
      if (data.session) {
        router.push("/auth/account");
        router.refresh();
      } else {
        setMsg(t("auth.confirmEmail"));
      }
    } catch {
      setErr(t("auth.configError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">{t("auth.registerTitle")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("auth.registerHint")}</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm text-white/60">
          {t("auth.name")}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-4 py-3 text-white"
          />
        </label>
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
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-4 py-3 text-white"
          />
        </label>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        {msg ? <p className="text-sm text-[#c49746]">{msg}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full py-3 font-display text-sm font-bold text-[#0a0a0a] disabled:opacity-50"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("auth.submitRegister")}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/50">
        {t("auth.hasAccount")}{" "}
        <Link href="/auth/login" className="text-[#c49746] underline">
          {t("auth.loginLink")}
        </Link>
      </p>
    </div>
  );
}
