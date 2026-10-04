import type { Metadata } from "next";
import { LocalLandingPage } from "@/components/seo/LocalLandingPage";

export const metadata: Metadata = {
  title: "Restaurant Ehrenfeld – Frische Pasta auf der Venloer Straße",
  description:
    "Restaurant in Köln-Ehrenfeld gesucht? Pastera auf der Venloer Straße 342 bietet Pasta, Saucen, Toppings und vegane Optionen.",
  alternates: { canonical: "/restaurant-ehrenfeld" },
  openGraph: {
    title: "Restaurant Ehrenfeld – Pastera Köln",
    description:
      "Pasta-Restaurant auf der Venloer Straße in Köln-Ehrenfeld mit frischen Gerichten und veganen Optionen.",
    url: "/restaurant-ehrenfeld",
    type: "website",
  },
};

export default function RestaurantEhrenfeldPage() {
  return (
    <LocalLandingPage
      eyebrow="Restaurant · Köln-Ehrenfeld"
      title="Restaurant in Ehrenfeld: Pasta bei Pastera auf der Venloer Straße"
      intro="Pastera ist ein Pasta-Restaurant in Köln-Ehrenfeld. Im Mittelpunkt stehen Pasta-Gerichte, verschiedene Saucen und Toppings sowie vegane Optionen – direkt auf der Venloer Straße."
      path="/restaurant-ehrenfeld"
      sections={[
        {
          heading: "Pasta-Restaurant in Ehrenfeld",
          body: "Wer in Ehrenfeld unkompliziert Pasta essen möchte, findet bei Pastera fertige Gerichte und individuelle Kombinationen. So passen unterschiedliche Vorlieben an einen Tisch.",
        },
        {
          heading: "Direkt auf der Venloer Straße",
          body: "Unser Standort liegt an der Venloer Straße 342 in 50823 Köln. Damit liegt Pastera mitten in einem der bekanntesten Gastro-Veedel der Stadt.",
        },
        {
          heading: "Vegane Optionen",
          body: "Neben klassischen Pasta-Kombinationen gibt es auch vegane Möglichkeiten. Welche Komponenten aktuell verfügbar sind, findest du direkt in der Speisekarte.",
        },
        {
          heading: "Aktuelle Speisekarte online",
          body: "Menü, Saucen, Toppings und Preise werden auf unserer Website gepflegt. So kannst du dich bereits vor deinem Besuch über die aktuelle Auswahl informieren.",
        },
      ]}
    />
  );
}
