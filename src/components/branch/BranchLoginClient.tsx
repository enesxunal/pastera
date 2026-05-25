"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

type BranchOption = { id: string; slug: string; name: string };

export function BranchLoginClient() {
  const { t } = useI18n();
  const router = useRouter();
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchSlug, setBranchSlug] = useState("merkez");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    void fetch("/api/branches")
      .then((r) => r.json())
      .then((j: { branches?: BranchOption[] }) => {
        const list = j.branches ?? [];
        setBranches(list);
        if (list[0]?.slug) setBranchSlug(list[0].slug);
      })
      .catch(() => {});
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/branch/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, branchSlug }),
    });
    if (!res.ok) {
      setErr(t("common.wrongPasswordBranch"));
      return;
    }
    router.push("/branch");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-20 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-white">{t("branch.loginTitle")}</h1>
      <p className="mt-2 text-sm text-white/50">{t("branch.loginHintPick")}</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        {branches.length > 0 ? (
          <label className="block text-sm text-white/60">
            {t("branch.pickBranch")}
            <select
              value={branchSlug}
              onChange={(e) => setBranchSlug(e.target.value)}
              className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-3 py-2.5 text-white"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block text-sm text-white/60">
          {t("branch.password")}
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
          {t("branch.submit")}
        </button>
      </form>
    </div>
  );
}
