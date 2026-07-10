import { CardScanClient } from "@/components/cards/CardScanClient";

export default function CardPage({ params }: { params: { code: string } }) {
  return (
    <div className="min-h-dvh bg-[#080808]">
      <CardScanClient code={params.code} />
    </div>
  );
}
