import dynamic from "next/dynamic";

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
  return <PastaBuilder />;
}
