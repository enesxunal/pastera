import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pastera · Links",
  description: "Pastera — Menü, Bestellung und Social Media.",
  robots: { index: false, follow: false },
};

/** QR sayfası — ana site header/footer yok */
export default function ConnectLayout({ children }: { children: ReactNode }) {
  return children;
}
