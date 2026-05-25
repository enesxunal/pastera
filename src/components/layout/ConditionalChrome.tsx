"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DeliveryBanner } from "@/components/delivery/DeliveryBanner";
import { DineInBanner } from "@/components/dine-in/DineInBanner";

const HIDE_PREFIXES = ["/display", "/branch", "/admin", "/lobby"];

export function ConditionalChrome() {
  const pathname = usePathname();
  const hide = HIDE_PREFIXES.some((p) => pathname.startsWith(p));
  if (hide) return null;
  return (
    <>
      <SiteHeader />
      <DineInBanner />
      <DeliveryBanner />
    </>
  );
}

export function ConditionalFooter() {
  const pathname = usePathname();
  const hide = HIDE_PREFIXES.some((p) => pathname.startsWith(p));
  if (hide) return null;
  return <SiteFooter />;
}
