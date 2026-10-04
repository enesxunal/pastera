import type { Metadata } from "next";
import { LocalLandingPage } from "@/components/seo/LocalLandingPage";

export const metadata: Metadata = {
  title: "Pasta Köln – Frische Pasta bei Pastera in Ehrenfeld",
  description:
    "Pasta in Köln: Entdecke Pastera in Köln-Ehrenfeld mit Pasta-Gerichten, Saucen, Toppings und veganen Optionen auf der Venloer Straße.",
  alternates: { canonical: "/pasta-koeln" },
  openGraph: {
    title: "Pasta Köln – Pastera Ehrenfeld",
    description:
      "Moderne Pasta, Saucen, Toppings und vegane Optionen bei Pastera in Köln-Ehrenfeld.",
    url: "/pasta-koeln",
    type: "website",
  },
};

export default function PastaKoelnPage() {
  return (
    <LocalLandingPage
      eyebrow="Pasta · Köln"
      title="Pasta in Köln: Pastera in Köln-Ehrenfeld"
      intro="Bei Pastera in Köln-Ehrenfeld dreht sich alles um Pasta. Wähle aus aktuellen Gerichten oder kombiniere Pastasorte, Sauce und Toppings nach deinem Geschmack."
      path="/pasta-koeln"
      sections={[
        {
          heading: "Pasta statt beliebiger großer Karte",
          body: "Unser Konzept konzentriert sich klar auf Pasta. Dadurch stehen Kombinationen aus Pastasorten, Saucen und Toppings im Mittelpunkt statt einer beliebigen Mischung vieler Küchen.",
        },
        {
          heading: "Köln-Ehrenfeld als Standort",
          body: "Pastera liegt auf der Venloer Straße in Ehrenfeld. Der Standort ist gut mit einem Besuch im Veedel, Cafés, Bars und weiteren Food-Spots kombinierbar.",
        },
        {
          heading: "Pasta individuell kombinieren",
          body: "Neben benannten Gerichten kannst du unterschiedliche Komponenten entdecken und deine bevorzugte Pasta-Kombination zusammenstellen.",
        },
        {
          heading: "Auch vegan möglich",
          body: "Für vegane Gäste gibt es passende Optionen. Die aktuelle Kennzeichnung und Auswahl findest du in der Speisekarte und im Pasta-Konfigurator.",
        },
      ]}
    />
  );
}
