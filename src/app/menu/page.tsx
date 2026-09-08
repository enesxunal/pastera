import type { Metadata } from "next";
import { MenuHub } from "@/components/menu/MenuHub";
import { MenuPageFrame } from "@/components/menu/MenuPageFrame";

export const metadata: Metadata = {
  title: "Speisekarte – Frische Pasta in Köln-Ehrenfeld",
  description: "Entdecke die Pastera Speisekarte mit Pasta-Gerichten, Saucen, Toppings, veganen Optionen und weiteren Gerichten in Köln-Ehrenfeld.",
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  return (
    <MenuPageFrame>
      <MenuHub />
    </MenuPageFrame>
  );
}
