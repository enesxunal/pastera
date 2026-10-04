import type { Metadata } from "next";
import { LocalLandingPage } from "@/components/seo/LocalLandingPage";

export const metadata: Metadata = {
  title: "Pasta Venloer Straße – Pastera Köln-Ehrenfeld",
  description:
    "Pasta auf der Venloer Straße: Pastera in Köln-Ehrenfeld bietet Pasta-Gerichte, Saucen, Toppings und vegane Optionen an der Venloer Straße 342.",
  alternates: { canonical: "/pasta-venloer-strasse" },
  openGraph: {
    title: "Pasta auf der Venloer Straße – Pastera",
    description:
      "Pasta bei Pastera an der Venloer Straße 342 in Köln-Ehrenfeld.",
    url: "/pasta-venloer-strasse",
    type: "website",
  },
};

export default function PastaVenloerStrassePage() {
  return (
    <LocalLandingPage
      eyebrow="Venloer Straße · Köln"
      title="Pasta auf der Venloer Straße in Köln-Ehrenfeld"
      intro="Auf der Venloer Straße 342 findest du Pastera: ein Pasta-Konzept mit aktuellen Gerichten, verschiedenen Saucen, Toppings und veganen Optionen."
      path="/pasta-venloer-strasse"
      sections={[
        {
          heading: "Adresse: Venloer Straße 342",
          body: "Pastera liegt in 50823 Köln-Ehrenfeld direkt auf der Venloer Straße. Die Adresse ist Teil eines lebendigen Gastro- und Ausgehviertels.",
        },
        {
          heading: "Pasta als Schwerpunkt",
          body: "Im Mittelpunkt stehen Pasta-Gerichte und kombinierbare Komponenten. Dadurch bleibt das Konzept klar und die Auswahl trotzdem flexibel.",
        },
        {
          heading: "Vor dem Besuch online ansehen",
          body: "Über die digitale Speisekarte kannst du dir Gerichte, Saucen, Toppings und Preise vorab ansehen.",
        },
        {
          heading: "Ehrenfeld weiter entdecken",
          body: "Der Standort lässt sich gut mit weiteren Stops entlang der Venloer Straße verbinden – von Cafés bis Bars und kleinen Läden im Veedel.",
        },
      ]}
    />
  );
}
