import { MenuHub } from "@/components/menu/MenuHub";

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div
        className="mb-8 inline-block rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0a0a0a]"
        style={{ backgroundColor: "#c49746" }}
      >
        Speisekarte
      </div>
      <MenuHub />
    </div>
  );
}
