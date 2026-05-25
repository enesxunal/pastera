import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Syne } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { ConditionalChrome, ConditionalFooter } from "@/components/layout/ConditionalChrome";
import type { SupportedLocale } from "@/lib/cart";

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

export const metadata: Metadata = {
  title: "Pastera · Pasta, Suppen & mehr",
  description:
    "Pasta-Basis mit Saucen, Specials und Toppings konfigurieren. Speisekarte mit Suppen, Vorspeisen und Getränken – Warenkorb inklusive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = cookies();
  const initialLocale: SupportedLocale =
    cookieStore.get("pastera-locale")?.value === "tr" ? "tr" : "de";

  return (
    <html lang={initialLocale === "tr" ? "tr" : "de"}>
      <body
        className={`${syne.variable} ${dmSans.variable} font-sans antialiased bg-matte text-white`}
      >
        <AppProviders initialLocale={initialLocale}>
          <div className="pastera-brand-bar" aria-hidden />
          <div className="relative flex min-h-screen flex-col overflow-x-hidden">
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
            <ConditionalChrome />
            <main className="relative z-10 flex-1">{children}</main>
            <ConditionalFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
