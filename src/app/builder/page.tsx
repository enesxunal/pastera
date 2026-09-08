import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Pasta zusammenstellen – Pastera Köln",
  description: "Entdecke Pastasorten, Saucen und Toppings im Pastera Pasta-Konfigurator. Online-Bestellungen sind derzeit pausiert.",
  alternates: { canonical: "/builder" },
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

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-white/50">
          Konfigurator wird geladen …
        </div>
      }
    >
      <PastaBuilder mode="classic" />
    </Suspense>
  );
}
