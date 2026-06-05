"use client";

import type { CatalogItem } from "@/lib/catalog-types";
import { applyStaticCatalogOverrides, getStaticCatalog } from "@/lib/catalog-static";
import { loadDeliveryContext } from "@/lib/delivery-context";
import { loadDineInContext } from "@/lib/dine-in-context";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type CatalogCtx = { catalog: CatalogItem[]; refresh: () => void };

const CatalogContext = createContext<CatalogCtx | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<CatalogItem[]>(() => getStaticCatalog());

  const refresh = useMemo(
    () => () => {
      const branchId =
        loadDineInContext()?.branchId ?? loadDeliveryContext()?.branchId ?? undefined;
      const q = branchId ? `?branchId=${encodeURIComponent(branchId)}` : "";
      void fetch(`/api/catalog${q}`)
        .then((r) => r.json())
        .then((data: CatalogItem[]) => {
          if (Array.isArray(data) && data.length) {
            setCatalog(applyStaticCatalogOverrides(data));
          }
        })
        .catch(() => {});
    },
    [],
  );

  useEffect(() => {
    refresh();
    const onBranch = () => refresh();
    window.addEventListener("pastera-dine-in-update", onBranch);
    window.addEventListener("pastera-delivery-update", onBranch);
    return () => {
      window.removeEventListener("pastera-dine-in-update", onBranch);
      window.removeEventListener("pastera-delivery-update", onBranch);
    };
  }, [refresh]);

  const value = useMemo(() => ({ catalog, refresh }), [catalog, refresh]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogCtx {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog outside CatalogProvider");
  return ctx;
}
