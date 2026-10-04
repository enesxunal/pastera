import type { Metadata } from "next";
import { LocalLandingPage } from "@/components/seo/LocalLandingPage";

export const metadata: Metadata = {
  title: "Pasta Ehrenfeld – Pastera auf der Venloer Straße",
  description:
    "Pasta in Ehrenfeld: Pastera auf der Venloer Straße 342 mit Pasta-Gerichten, Saucen, Toppings und veganen Optionen.",
  alternates: { canonical: "/pasta-ehrenfeld" },
  openGraph: {
    title: "Pasta Ehrenfeld – Pastera",
    description:
      "Pasta auf der Venloer Straße in Köln-Ehrenfeld entdecken.",
    url: "/pasta-ehrenfeld",
    type: "website",
  },
};

export default function PastaEhrenfeldPage() {
  return (
    <LocalLandingPage
      eyebrow="Pasta · Ehrenfeld"
      title="Pasta in Ehrenfeld auf der Venloer Straße"
      intro="Pastera verbindet moderne Pasta-Gerichte mit frei kombinierbaren Saucen und Toppings. Du findest uns an der Venloer Straße 342 im Herzen von Köln-Ehrenfeld."
      path="/pasta-ehrenfeld"
      sections={[
        {
          heading: "Pasta mitten in Ehrenfeld",
          body: "Die Venloer Straße gehört zu den wichtigsten Gastro-Achsen in Ehrenfeld. Pastera liegt direkt an dieser Strecke und konzentriert sich auf moderne Pasta.",
        },
        {
          heading: "Für unterschiedliche Geschmäcker",
          body: "Cremig, tomatig, würziger oder vegan: Durch verschiedene Saucen und Toppings lassen sich unterschiedliche Geschmäcker auf einer gemeinsamen Pasta-Basis zusammenbringen.",
        },
        {
          heading: "Speisekarte mit aktuellen Preisen",
          body: "Die aktuelle Auswahl und Preise findest du auf unserer Speisekarte. So kannst du Gerichte und Komponenten vor deinem Besuch vergleichen.",
        },
        {
          heading: "Pasta-Konfigurator",
          body: "Im Konfigurator kannst du nachvollziehen, welche Pastasorten, Saucen und Toppings sich miteinander kombinieren lassen.",
        },
      ]}
    />
  );
}
