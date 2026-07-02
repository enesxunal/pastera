import dynamic from "next/dynamic";

const ChocolateBuilder = dynamic(
  () =>
    import("@/components/pasta-builder/ChocolateBuilder").then((m) => ({
      default: m.ChocolateBuilder,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center text-white/50">
        Yükleniyor …
      </div>
    ),
  },
);

export default function ChocolateBuilderPage() {
  return <ChocolateBuilder />;
}
