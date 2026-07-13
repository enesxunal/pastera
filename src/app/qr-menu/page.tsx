import type { Metadata } from "next";
import { QrMenuClient } from "@/components/menu/QrMenuClient";

export const metadata: Metadata = {
  title: "Pastera · Speisekarte",
  description: "Pastera Speisekarte — Pasta, Suppen, Vorspeisen und Getränke.",
  robots: { index: true, follow: true },
};

export default function QrMenuPage() {
  return <QrMenuClient />;
}
