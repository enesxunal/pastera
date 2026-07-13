"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DeliveryBanner } from "@/components/delivery/DeliveryBanner";
import { DineInBanner } from "@/components/dine-in/DineInBanner";
import { isDeliveryEnabled } from "@/lib/delivery-enabled";

const HIDE_PREFIXES = ["/display", "/branch", "/admin", "/lobby", "/connect", "/c"];

export function ConditionalChrome({ hidden = false }: { hidden?: boolean }) {
  const pathname = usePathname();
  const hide = hidden || HIDE_PREFIXES.some((p) => pathname.startsWith(p));
  if (hide) return null;
  return (
    <>
      <SiteHeader />
      <DineInBanner />
      {isDeliveryEnabled() ? <DeliveryBanner /> : null}
    </>
  );
}

export function ConditionalFooter({ hidden = false }: { hidden?: boolean }) {
  const pathname = usePathname();
  const hide = hidden || HIDE_PREFIXES.some((p) => pathname.startsWith(p));
  if (hide) return null;
  return <SiteFooter />;
}
