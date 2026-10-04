import Link from "next/link";
import { PASTERA_BUSINESS, SITE_URL } from "@/lib/site-info";

type Section = {
  heading: string;
  body: string;
};

type LocalLandingPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  path: string;
  sections: Section[];
};

export function LocalLandingPage({
  eyebrow,
  title,
  intro,
  path,
  sections,
}: LocalLandingPageProps) {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}${path}` },
    ],
  };

  return (
    <article className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-[#c49746]">
        {eyebrow}
      </p>
      <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-white/65">{intro}</p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <section
            key={section.heading}
            className="rounded-2xl border border-[#2e402a] bg-[#0f0f0f] p-6"
          >
            <h2 className="font-display text-2xl font-bold text-white">
              {section.heading}
            </h2>
            <p className="mt-3 text-base leading-7 text-white/65">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-[#c49746]/30 bg-[#15130d] p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold text-[#c49746]">
          Pastera in Köln-Ehrenfeld
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/70">
          Du findest Pastera in der {PASTERA_BUSINESS.streetAddress}, {PASTERA_BUSINESS.postalCode}{" "}
          {PASTERA_BUSINESS.addressLocality}. Entdecke aktuelle Pasta-Gerichte, Saucen,
          Toppings und vegane Optionen direkt in unserer Speisekarte.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/menu"
            className="rounded-full bg-[#c49746] px-5 py-2.5 text-sm font-bold text-[#0a0a0a] hover:brightness-110"
          >
            Speisekarte ansehen
          </Link>
          <Link
            href="/builder"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/85 hover:border-white/30"
          >
            Pasta zusammenstellen
          </Link>
          <Link
            href="/blog"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/85 hover:border-white/30"
          >
            Pastera Magazin
          </Link>
        </div>
      </section>

      <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#c49746]">
        <Link href="/restaurant-ehrenfeld">Restaurant Ehrenfeld</Link>
        <Link href="/pasta-koeln">Pasta Köln</Link>
        <Link href="/pasta-ehrenfeld">Pasta Ehrenfeld</Link>
        <Link href="/pasta-venloer-strasse">Pasta Venloer Straße</Link>
      </nav>
    </article>
  );
}
