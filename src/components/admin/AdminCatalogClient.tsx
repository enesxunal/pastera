"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { useI18n } from "@/components/providers/I18nProvider";
import type { CatalogCategory, CatalogItem } from "@/lib/catalog-types";
import { formatEur } from "@/lib/format";

const CATEGORIES: CatalogCategory[] = [
  "pasta_base",
  "sauce",
  "special",
  "topping",
  "soup",
  "starter",
  "drink",
];

const CATEGORY_KEYS: Record<CatalogCategory, string> = {
  pasta_base: "admin.catPasta",
  sauce: "admin.catSauce",
  special: "admin.catSpecial",
  topping: "admin.catTopping",
  soup: "admin.catSoup",
  starter: "admin.catStarter",
  drink: "admin.catDrink",
};

function emptyItem(category: CatalogCategory): CatalogItem {
  const ts = Date.now();
  return {
    id: `${category}-${ts}`,
    category,
    name_de: "",
    name_tr: "",
    price: 0,
    vegan: false,
    image: "",
    sort_order: 0,
    is_active: true,
  };
}

export function AdminCatalogClient() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [mode, setMode] = useState("");
  const [hint, setHint] = useState("");
  const [msg, setMsg] = useState("");
  const [filterCat, setFilterCat] = useState<CatalogCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CatalogItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/catalog");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = (await res.json()) as {
      ok?: boolean;
      items?: CatalogItem[];
      mode?: string;
      hint?: string;
    };
    if (data.items) setItems(data.items);
    setMode(data.mode ?? "");
    setHint(data.hint ?? "");
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter((i) => filterCat === "all" || i.category === filterCat)
      .filter((i) => {
        if (!q) return true;
        return (
          i.id.toLowerCase().includes(q) ||
          i.name_de.toLowerCase().includes(q) ||
          i.name_tr.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.sort_order - b.sort_order || a.name_de.localeCompare(b.name_de));
  }, [items, filterCat, search]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) setDraft({ ...selected });
    else setDraft(null);
  }, [selected]);

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  async function seed() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const j = (await res.json()) as { ok?: boolean; error?: string; count?: number };
      if (!res.ok) setMsg(j.error ?? "seed failed");
      else setMsg(`${t("admin.seedDone")}: ${j.count ?? 0}`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (!draft) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const j = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) setMsg(j.error ?? t("admin.saveFailed"));
      else {
        setMsg(t("admin.saved"));
        await load();
        setSelectedId(draft.id);
      }
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(file: File) {
    if (!draft) return;
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("productId", draft.id);
      const res = await fetch("/api/admin/catalog/upload", { method: "POST", body: fd });
      const j = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok) {
        if (j.error === "too_large") setMsg(t("admin.uploadTooLarge"));
        else if (j.error === "bad_type") setMsg(t("admin.uploadBadType"));
        else setMsg(t("admin.uploadFailed"));
        return;
      }
      if (j.url) {
        setDraft({ ...draft, image: j.url });
        setMsg(t("admin.uploadDone"));
      }
    } catch {
      setMsg(t("admin.uploadFailed"));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deactivate(id: string) {
    setBusy(true);
    await fetch(`/api/admin/catalog?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (selectedId === id) setSelectedId(null);
    await load();
    setBusy(false);
    setMsg(t("admin.hidden"));
  }

  function startNew(cat: CatalogCategory) {
    const item = emptyItem(cat);
    setFilterCat(cat);
    setSelectedId(item.id);
    setDraft(item);
    setItems((prev) => [...prev, item]);
  }

  const counts = useMemo(() => {
    const m: Record<string, number> = { all: items.length };
    for (const c of CATEGORIES) {
      m[c] = items.filter((i) => i.category === c && i.is_active).length;
    }
    return m;
  }, [items]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <AdminNav />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">{t("admin.catalogTitle")}</h1>
          <p className="mt-1 text-sm text-white/45">{t("admin.catalogHint")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => void seed()}
            className="rounded-full border border-[#c49746]/50 px-4 py-2 text-sm text-[#c49746] disabled:opacity-50"
          >
            {t("admin.seed")}
          </button>
          <Link
            href="/menu"
            className="rounded-full border border-[#2e402a] px-4 py-2 text-sm text-white/70 hover:border-[#c49746]/40"
          >
            {t("admin.previewMenu")}
          </Link>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded-full border border-[#2e402a] px-4 py-2 text-sm text-white/70"
          >
            {t("admin.logout")}
          </button>
        </div>
      </div>

      {mode === "static" ? (
        <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          {hint || t("admin.catalogStaticHint")}
        </p>
      ) : null}
      {msg ? (
        <p className="mt-3 rounded-lg bg-[#c49746]/15 px-4 py-2 text-sm text-[#c49746]">{msg}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        {/* Sol: filtre + liste */}
        <div className="w-full shrink-0 lg:w-[340px]">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.searchProducts")}
            className="w-full rounded-xl border-2 border-[#2e402a] bg-[#111] px-4 py-3 text-white placeholder:text-white/35"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterCat("all")}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filterCat === "all"
                  ? "bg-[#c49746] text-[#0a0a0a]"
                  : "border border-[#2e402a] text-white/60"
              }`}
            >
              {t("admin.allProducts")} ({counts.all})
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterCat(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  filterCat === c
                    ? "bg-[#c49746] text-[#0a0a0a]"
                    : "border border-[#2e402a] text-white/60"
                }`}
              >
                {t(CATEGORY_KEYS[c])} ({counts[c] ?? 0})
              </button>
            ))}
          </div>
          {filterCat !== "all" ? (
            <button
              type="button"
              onClick={() => startNew(filterCat)}
              className="mt-4 w-full rounded-full py-2.5 text-sm font-bold text-[#0a0a0a]"
              style={{ backgroundColor: "#c49746" }}
            >
              + {t("admin.newProduct")}
            </button>
          ) : null}

          <ul className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <li className="py-8 text-center text-sm text-white/40">{t("admin.noProducts")}</li>
            ) : (
              filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border-2 p-2 text-left transition ${
                      selectedId === item.id
                        ? "border-[#c49746] bg-[#c49746]/10"
                        : "border-[#2e402a] bg-[#111] hover:border-[#c49746]/30"
                    } ${item.is_active ? "" : "opacity-45"}`}
                  >
                    <ProductThumb image={item.image} name={item.name_de} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">
                        {locale === "tr" ? item.name_tr || item.name_de : item.name_de}
                      </p>
                      <p className="truncate text-xs text-white/40">{item.id}</p>
                      <p className="text-sm font-semibold text-[#c49746]">{formatEur(item.price)}</p>
                    </div>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Sağ: düzenleme paneli */}
        <div className="min-w-0 flex-1">
          {draft ? (
            <div className="rounded-2xl border-2 border-[#2e402a] bg-gradient-to-b from-[#141414] to-[#0c0c0c] p-6 shadow-box">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="relative mx-auto aspect-square w-full max-w-[220px] shrink-0 overflow-hidden rounded-2xl border border-[#2e402a] bg-black sm:mx-0">
                  <ProductThumb image={draft.image} name={draft.name_de} large />
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <h2 className="font-display text-xl font-bold text-white">{t("admin.editProduct")}</h2>

                  <label className="block text-sm text-white/55">
                    ID
                    <input
                      value={draft.id}
                      onChange={(e) => setDraft({ ...draft, id: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 font-mono text-xs text-white"
                    />
                  </label>

                  <label className="block text-sm text-white/55">
                    {t("admin.category")}
                    <select
                      value={draft.category}
                      onChange={(e) =>
                        setDraft({ ...draft, category: e.target.value as CatalogCategory })
                      }
                      className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 text-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {t(CATEGORY_KEYS[c])}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-white/55">
                      {t("admin.nameDe")}
                      <input
                        value={draft.name_de}
                        onChange={(e) => setDraft({ ...draft, name_de: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 text-white"
                      />
                    </label>
                    <label className="block text-sm text-white/55">
                      {t("admin.nameTr")}
                      <input
                        value={draft.name_tr}
                        onChange={(e) => setDraft({ ...draft, name_tr: e.target.value })}
                        className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 text-white"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="block text-sm text-white/55">
                      {t("admin.price")}
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={draft.price}
                        onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                        className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 text-white"
                      />
                    </label>
                    <label className="block text-sm text-white/55">
                      {t("admin.sortOrder")}
                      <input
                        type="number"
                        value={draft.sort_order}
                        onChange={(e) =>
                          setDraft({ ...draft, sort_order: Number(e.target.value) })
                        }
                        className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 text-white"
                      />
                    </label>
                    <div className="flex flex-col justify-end gap-3 pb-1">
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={draft.vegan}
                          onChange={(e) => setDraft({ ...draft, vegan: e.target.checked })}
                          className="h-4 w-4"
                        />
                        Vegan
                      </label>
                      <label className="flex items-center gap-2 text-sm text-white/70">
                        <input
                          type="checkbox"
                          checked={draft.is_active}
                          onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
                          className="h-4 w-4"
                        />
                        {t("admin.active")}
                      </label>
                    </div>
                  </div>

                  <div className="block text-sm text-white/55">
                    <span className="font-medium text-white/70">{t("admin.uploadImage")}</span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadImage(f);
                      }}
                    />
                    <div
                      className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#2e402a] bg-[#0a0a0a]/80 px-4 py-6 transition hover:border-[#c49746]/40"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add("border-[#c49746]/60");
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("border-[#c49746]/60");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("border-[#c49746]/60");
                        const f = e.dataTransfer.files?.[0];
                        if (f) void uploadImage(f);
                      }}
                    >
                      <p className="text-center text-xs text-white/40">{t("admin.uploadHint")}</p>
                      <button
                        type="button"
                        disabled={uploading || busy}
                        onClick={() => fileRef.current?.click()}
                        className="mt-3 rounded-full border border-[#c49746]/50 px-5 py-2 text-sm font-semibold text-[#c49746] disabled:opacity-50"
                      >
                        {uploading ? t("admin.uploading") : t("admin.uploadImage")}
                      </button>
                    </div>
                    <label className="mt-4 block">
                      {t("admin.imagePath")}
                      <input
                        value={draft.image}
                        onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                        placeholder="/catalog/..."
                        className="mt-1 w-full rounded-lg border border-[#2e402a] bg-[#0a0a0a] px-3 py-2 text-sm text-white"
                      />
                      <p className="mt-1 text-xs text-white/35">{t("admin.imageHint")}</p>
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void saveDraft()}
                      className="rounded-full px-8 py-3 font-display text-sm font-bold text-[#0a0a0a] disabled:opacity-50"
                      style={{ backgroundColor: "#c49746" }}
                    >
                      {t("admin.save")}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void deactivate(draft.id)}
                      className="rounded-full border border-red-500/40 px-6 py-3 text-sm text-red-300"
                    >
                      {t("admin.inactive")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#2e402a] bg-[#111]/50 p-12 text-center">
              <p className="text-lg text-white/50">{t("admin.selectProduct")}</p>
              <p className="mt-2 max-w-sm text-sm text-white/35">{t("admin.selectProductHint")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductThumb({
  image,
  name,
  large,
}: {
  image: string;
  name: string;
  large?: boolean;
}) {
  const size = large ? "relative min-h-[200px] w-full" : "relative h-14 w-14 shrink-0";
  const src =
    image?.startsWith("/") || image?.startsWith("http://") || image?.startsWith("https://")
      ? image
      : null;

  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-lg bg-black ${size}`}>
        <Image src={src} alt={name} fill className="object-cover" sizes="220px" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-[#1a2218] to-[#0a0a0a] ${size}`}
    >
      <span className="px-1 text-center text-[10px] text-white/30">{name?.slice(0, 2) || "?"}</span>
    </div>
  );
}
