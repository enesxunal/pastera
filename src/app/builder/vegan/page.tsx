import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Vegane Pasta zusammenstellen – Pastera Köln",
  description: "Vegane Pasta, Saucen und Toppings bei Pastera in Köln-Ehrenfeld entdecken. Online-Bestellungen sind derzeit pausiert.",
  alternates: { canonical: "/builder/vegan" },
};

const PastaBuilder = dynamic(
  () => import("@/components/pasta-builder/PastaBuilder").then((m) => ({ default: m.PastaBuilder })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-white/50">
        Konfigurator wird geladen …
      </div>
    ),
  },
);

export default function VeganBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-white/50">
          Konfigurator wird geladen …
        </div>
      }
    >
      <PastaBuilder mode="vegan" />
    </Suspense>
  );
}
