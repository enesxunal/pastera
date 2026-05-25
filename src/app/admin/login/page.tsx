"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export default function AdminLoginPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setErr(locale === "de" ? "Falsches Passwort oder Server." : "Hatalı şifre veya sunucu.");
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">{t("admin.loginTitle")}</h1>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm text-white/60">
          {t("admin.password")}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-4 py-3 text-white outline-none focus:border-[#c49746]/60"
            autoComplete="current-password"
          />
        </label>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        <button
          type="submit"
          className="w-full rounded-full py-3 font-display text-sm font-bold text-[#0a0a0a]"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("admin.submit")}
        </button>
      </form>
      <p className="mt-6 text-xs text-white/40">
        {locale === "de"
          ? "ADMIN_PASSWORD in .env.local setzen."
          : ".env.local içinde ADMIN_PASSWORD ayarlayın."}
      </p>
    </div>
  );
}
