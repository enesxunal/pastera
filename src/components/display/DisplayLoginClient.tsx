"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

type BranchOption = { id: string; slug: string; name: string };

export function DisplayLoginClient({ defaultBranchId }: { defaultBranchId?: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [key, setKey] = useState("");
  const [branchId, setBranchId] = useState(defaultBranchId ?? "");
  const [err, setErr] = useState("");

  useEffect(() => {
    void fetch("/api/branches")
      .then((r) => r.json())
      .then((j: { branches?: BranchOption[] }) => {
        const list = j.branches ?? [];
        setBranches(list);
        if (!defaultBranchId && list[0]?.id) setBranchId(list[0].id);
      })
      .catch(() => {});
  }, [defaultBranchId]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    if (!branchId) {
      setErr(locale === "de" ? "Bitte Filiale wählen." : "Lütfen şube seçin.");
      return;
    }
    const res = await fetch("/api/display/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, branchId }),
    });
    if (!res.ok) {
      setErr(locale === "de" ? "Zugang verweigert." : "Erişim reddedildi.");
      return;
    }
    router.push("/display");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-white">{t("display.loginTitle")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("display.loginHintBranch")}</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block text-sm text-white/60">
          {t("display.accessKey")}
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-4 py-3 text-white outline-none focus:border-[#c49746]/60"
            autoComplete="off"
          />
        </label>
        {branches.length > 0 ? (
          <label className="block text-sm text-white/60">
            {t("branch.pickBranch")}
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        <button
          type="submit"
          className="w-full rounded-full py-3 font-display text-sm font-bold text-[#0a0a0a]"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("display.submit")}
        </button>
      </form>
    </div>
  );
}
