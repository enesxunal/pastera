import { Suspense } from "react";
import { ChocolateBuilder } from "@/components/pasta-builder/ChocolateBuilder";

export default function ChocolateBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-white/50">
          Yükleniyor …
        </div>
      }
    >
      <ChocolateBuilder />
    </Suspense>
  );
}
