import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Pastera · VIP",
  robots: { index: false, follow: false },
};

/** NFC kart — header/footer yok */
export default function CardLayout({ children }: { children: ReactNode }) {
  return children;
}
