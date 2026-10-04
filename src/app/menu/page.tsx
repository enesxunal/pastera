import type { Metadata } from "next";
import { MenuHub } from "@/components/menu/MenuHub";
import { MenuPageFrame } from "@/components/menu/MenuPageFrame";

export const metadata: Metadata = {
  title: "Pastera Speisekarte Köln-Ehrenfeld – Pasta, Preise & Vegan",
  description:
    "Entdecke die aktuelle Pastera Speisekarte in Köln-Ehrenfeld: Pasta, Saucen, Toppings, vegane Optionen und aktuelle Preise.",
  alternates: { canonical: "/menu" },
  openGraph: {
    title: "Pastera Speisekarte Köln-Ehrenfeld",
    description:
      "Pasta, Saucen, Toppings, vegane Optionen und aktuelle Preise bei Pastera in Köln-Ehrenfeld.",
    url: "/menu",
    type: "website",
  },
};

export default function MenuPage() {
  return (
    <MenuPageFrame>
      <MenuHub />
    </MenuPageFrame>
  );
}
