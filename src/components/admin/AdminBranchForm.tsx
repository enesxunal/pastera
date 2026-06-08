"use client";

import { useI18n } from "@/components/providers/I18nProvider";

export type BranchFormValues = {
  slug: string;
  name: string;
  street: string;
  city: string;
  postal: string;
  phone: string;
  radius_km: string;
  lat: string;
  lng: string;
  can_edit_prices: boolean;
  is_active: boolean;
};

export const emptyBranchForm = (): BranchFormValues => ({
  slug: "",
  name: "",
  street: "",
  city: "",
  postal: "",
  phone: "",
  radius_km: "5",
  lat: "",
  lng: "",
  can_edit_prices: false,
  is_active: true,
});

export function branchToFormValues(b: {
  slug: string;
  name: string;
  street?: string | null;
  city?: string | null;
  postal?: string | null;
  phone?: string | null;
  radius_km: number;
  lat?: number | null;
  lng?: number | null;
  can_edit_prices: boolean;
  is_active: boolean;
}): BranchFormValues {
  return {
    slug: b.slug,
    name: b.name,
    street: b.street ?? "",
    city: b.city ?? "",
    postal: b.postal ?? "",
    phone: b.phone ?? "",
    radius_km: String(b.radius_km),
    lat: b.lat != null ? String(b.lat) : "",
    lng: b.lng != null ? String(b.lng) : "",
    can_edit_prices: b.can_edit_prices,
    is_active: b.is_active,
  };
}

const inputClass =
  "w-full rounded-lg border border-[#2e402a] bg-black/40 px-3 py-2 text-sm text-white";

type AdminBranchFormProps = {
  values: BranchFormValues;
  onChange: (values: BranchFormValues) => void;
  mode: "create" | "edit";
};

export function AdminBranchForm({ values, onChange, mode }: AdminBranchFormProps) {
  const { t } = useI18n();

  function set<K extends keyof BranchFormValues>(key: K, value: BranchFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {mode === "create" ? (
        <label className="block sm:col-span-1">
          <span className="mb-1 block text-xs text-white/50">{t("admin.branchSlug")}</span>
          <input
            required
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            className={inputClass}
            placeholder="wesseling"
          />
        </label>
      ) : (
        <div className="rounded-lg border border-[#2e402a] bg-black/30 px-3 py-2 sm:col-span-1">
          <p className="text-xs text-white/45">{t("admin.branchSlug")}</p>
          <p className="font-mono text-sm text-white/80">{values.slug}</p>
        </div>
      )}

      <label className="block sm:col-span-1">
        <span className="mb-1 block text-xs text-white/50">{t("admin.branchName")}</span>
        <input
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs text-white/50">{t("admin.branchStreet")}</span>
        <input
          value={values.street}
          onChange={(e) => set("street", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-white/50">{t("admin.branchPostal")}</span>
        <input
          value={values.postal}
          onChange={(e) => set("postal", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-white/50">{t("admin.branchCity")}</span>
        <input
          value={values.city}
          onChange={(e) => set("city", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className="mb-1 block text-xs text-white/50">{t("admin.branchPhone")}</span>
        <input
          type="tel"
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-white/50">{t("admin.branchRadius")}</span>
        <input
          type="number"
          min={1}
          max={50}
          step={0.5}
          value={values.radius_km}
          onChange={(e) => set("radius_km", e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="sm:col-span-1" />

      <label className="block">
        <span className="mb-1 block text-xs text-white/50">{t("admin.branchLat")}</span>
        <input
          value={values.lat}
          onChange={(e) => set("lat", e.target.value)}
          className={inputClass}
          placeholder="50.8270"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs text-white/50">{t("admin.branchLng")}</span>
        <input
          value={values.lng}
          onChange={(e) => set("lng", e.target.value)}
          className={inputClass}
          placeholder="6.9740"
        />
      </label>

      <p className="text-xs text-white/40 sm:col-span-2">{t("admin.branchGeoHint")}</p>

      <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
        <input
          type="checkbox"
          checked={values.can_edit_prices}
          onChange={(e) => set("can_edit_prices", e.target.checked)}
        />
        {t("admin.canEditPrices")}
      </label>

      <label className="flex items-center gap-2 text-sm text-white/70 sm:col-span-2">
        <input
          type="checkbox"
          checked={values.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
        />
        {t("admin.branchActive")}
      </label>
    </div>
  );
}

export function branchFormToPayload(values: BranchFormValues, mode: "create" | "edit") {
  const lat = values.lat.trim() ? Number(values.lat) : null;
  const lng = values.lng.trim() ? Number(values.lng) : null;
  return {
    ...(mode === "create" ? { slug: values.slug.trim() } : {}),
    name: values.name.trim(),
    street: values.street.trim() || null,
    city: values.city.trim() || null,
    postal: values.postal.trim() || null,
    phone: values.phone.trim() || null,
    radius_km: Number(values.radius_km) || 5,
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
    can_edit_prices: values.can_edit_prices,
    is_active: values.is_active,
  };
}
