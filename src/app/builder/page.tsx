import { Suspense } from "react";
import { PastaBuilder } from "@/components/pasta-builder/PastaBuilder";

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-white/50">
          Konfigurator wird geladen …
        </div>
      }
    >
      <PastaBuilder />
    </Suspense>
  );
}
