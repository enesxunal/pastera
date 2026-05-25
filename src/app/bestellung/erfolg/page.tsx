import { Suspense } from "react";
import { ErfolgClient } from "@/components/bestellung/ErfolgClient";

export default function BestellungErfolgPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-20 text-center text-white/50">…</div>
      }
    >
      <ErfolgClient />
    </Suspense>
  );
}
