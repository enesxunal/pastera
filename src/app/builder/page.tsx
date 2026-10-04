import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Pasta selbst zusammenstellen – Pastera Köln-Ehrenfeld",
  description:
    "Stelle bei Pastera in Köln-Ehrenfeld deine Pasta aus Pastasorte, Sauce und Toppings zusammen. Vegane Optionen im Pasta-Konfigurator entdecken.",
  alternates: { canonical: "/builder" },
};

const PastaBuilder = dynamic(
  () => import("@/components/pasta-builder/PastaBuilder").then((m) => ({ default: m.PastaBuilder })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center text-white/50">
        Konfigurator wird geladen …
      </div>
    ),
  },
);

export default function BuilderPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#c49746]">
          Pastera · Köln-Ehrenfeld
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold text-white sm:text-5xl">
          Deine Pasta selbst zusammenstellen
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/65">
          Wähle Pastasorte, Sauce und Toppings und entdecke die Kombinationsmöglichkeiten
          bei Pastera auf der Venloer Straße in Köln-Ehrenfeld. Auch vegane Varianten
          sind verfügbar.
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/menu" className="text-[#c49746] hover:underline">
            Speisekarte ansehen →
          </Link>
          <Link href="/pasta-ehrenfeld" className="text-white/75 hover:text-white">
            Pasta in Ehrenfeld →
          </Link>
        </div>
      </section>
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-4 py-12 text-center text-white/50">
            Konfigurator wird geladen …
          </div>
        }
      >
        <PastaBuilder mode="classic" />
      </Suspense>
    </>
  );
}
