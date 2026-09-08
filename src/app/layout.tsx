import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Syne } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ConditionalChrome, ConditionalFooter } from "@/components/layout/ConditionalChrome";
import { isComingSoonEnabled } from "@/lib/coming-soon";
import type { SupportedLocale } from "@/lib/cart";
import { PASTERA_BUSINESS, SITE_URL } from "@/lib/site-info";

const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

/** Vercel ortam değişkenleri her istekte okunabilsin (yalnızca build anına bağlı kalmasın). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pastera – Frische Pasta in Köln-Ehrenfeld",
    template: "%s | Pastera Köln",
  },
  description:
    "Pastera in Köln-Ehrenfeld: frisch zubereitete Pasta-Gerichte, Saucen, Toppings und vegane Optionen. Speisekarte online entdecken.",
  applicationName: "Pastera",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    alternateLocale: ["tr_TR"],
    url: SITE_URL,
    siteName: "Pastera",
    title: "Pastera – Frische Pasta in Köln-Ehrenfeld",
    description:
      "Frisch zubereitete Pasta, Saucen, Toppings und vegane Optionen in Köln-Ehrenfeld. Menü online entdecken.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Pastera – Modern Pasta Kitchen in Köln-Ehrenfeld",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pastera – Frische Pasta in Köln-Ehrenfeld",
    description: "Pasta-Restaurant in Köln-Ehrenfeld – Speisekarte und vegane Optionen entdecken.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: ["/favicon.ico", "/icon.png"],
    apple: "/apple-touch-icon.png",
  },
};
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = cookies();
  const initialLocale: SupportedLocale =
    cookieStore.get("pastera-locale")?.value === "tr" ? "tr" : "de";

  const supabasePublic = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };

  const comingSoon = isComingSoonEnabled();
  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${SITE_URL}/#restaurant`,
    name: PASTERA_BUSINESS.name,
    url: SITE_URL,
    logo: `${SITE_URL}/pastera-Logo.png`,
    image: `${SITE_URL}/opengraph-image.png`,
    telephone: PASTERA_BUSINESS.telephone,
    description: PASTERA_BUSINESS.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: PASTERA_BUSINESS.streetAddress,
      postalCode: PASTERA_BUSINESS.postalCode,
      addressLocality: PASTERA_BUSINESS.addressLocality,
      addressCountry: PASTERA_BUSINESS.addressCountry,
    },
    servesCuisine: ["Pasta", "Italian-inspired", "Vegan options"],
    menu: `${SITE_URL}/menu`,
    sameAs: [
      PASTERA_BUSINESS.instagram,
      PASTERA_BUSINESS.facebook,
      PASTERA_BUSINESS.tiktok,
    ],
    openingHoursSpecification: PASTERA_BUSINESS.openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.days.map((day) => `https://schema.org/${day}`),
      opens: hours.opens,
      closes: hours.closes,
    })),
  };

  return (
    <html lang={initialLocale === "tr" ? "tr" : "de"}>
      <body
        className={`${syne.variable} ${dmSans.variable} font-sans antialiased bg-matte text-white`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
        <AppProviders initialLocale={initialLocale} supabasePublic={supabasePublic}>
          <div className="pastera-brand-bar" aria-hidden />
          <div className="relative flex min-h-dvh flex-col overflow-x-hidden">
            <div
              className="pointer-events-none fixed inset-0"
              style={{
                opacity: 0.14,
                backgroundImage: `radial-gradient(ellipse 70% 50% at 15% 0%, #2e402a 0%, transparent 55%),
                radial-gradient(ellipse 60% 45% at 100% 100%, #c49746 0%, transparent 50%)`,
              }}
              aria-hidden
            />
            <div
              className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c49746]/50 to-transparent"
              aria-hidden
            />
            <ConditionalChrome hidden={comingSoon} />
            <main className="relative z-10 flex-1">{children}</main>
            <ConditionalFooter hidden={comingSoon} />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
