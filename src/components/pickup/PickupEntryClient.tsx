"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { savePickupContext } from "@/lib/pickup-context";

type BranchOption = { id: string; slug: string; name: string };

export function PickupEntryClient() {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [branchId, setBranchId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hideContact, setHideContact] = useState(false);

  useEffect(() => {
    void fetch("/api/branches")
      .then((r) => r.json())
      .then((j: { branches?: BranchOption[] }) => {
        const list = j.branches ?? [];
        setBranches(list);
        if (list[0]?.id) setBranchId(list[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    void fetch("/api/account/profile", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { profile?: { full_name?: string; phone?: string } }) => {
        const p = j.profile;
        if (p?.full_name) setName(p.full_name);
        if (p?.phone) setPhone(p.phone);
        setHideContact(Boolean(p?.full_name?.trim() && p?.phone?.trim()));
      })
      .catch(() => {});
  }, [user]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const branch = branches.find((b) => b.id === branchId);
    if (!branch) return;
    const customerName = name.trim();
    const customerPhone = phone.trim();
    if (!hideContact && (!customerName || !customerPhone)) return;

    savePickupContext({
      branchId: branch.id,
      branchSlug: branch.slug,
      branchName: branch.name,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
    });
    router.push("/warenkorb");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-white">{t("pickup.title")}</h1>
      <p className="mt-2 text-white/50">
        {hideContact ? t("pickup.hintLoggedIn") : t("pickup.hint")}
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
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
        {!hideContact ? (
          <>
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
              {t("delivery.phone")}
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-lg border-2 border-[#2e402a] bg-[#111] px-4 py-3 text-white"
              />
            </label>
          </>
        ) : (
          <p className="rounded-lg border border-[#2e402a] bg-[#111] px-4 py-3 text-sm text-white/60">
            {name} · {phone}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-full py-3 font-display text-sm font-bold text-[#0a0a0a]"
          style={{ backgroundColor: "#c49746" }}
        >
          {t("pickup.continue")}
        </button>
      </form>
      <Link href="/lieferung" className="mt-6 block text-center text-sm text-white/40 hover:text-[#c49746]">
        {t("pickup.orDelivery")}
      </Link>
    </div>
  );
}
