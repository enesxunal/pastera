import Link from "next/link";
import { PASTERA_BUSINESS } from "@/lib/site-info";

export function HomeLocalSeo() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6" aria-labelledby="pastera-koeln-heading">
      <div className="rounded-2xl border border-[#2e402a] bg-[#0f0f0f] p-6 sm:p-8">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#c49746]">
          Pastera · Köln-Ehrenfeld
        </p>
        <h2 id="pastera-koeln-heading" className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
          Frische Pasta in Köln-Ehrenfeld
        </h2>
        <div className="mt-4 grid gap-6 text-sm leading-relaxed text-white/65 md:grid-cols-2">
          <p>
            Pastera ist ein Pasta-Restaurant in Köln-Ehrenfeld. In der Venloer Straße 342 findest du
            frisch zubereitete Pasta-Gerichte mit verschiedenen Saucen und Toppings; auf der Speisekarte
            gibt es auch vegane Optionen.
          </p>
          <p>
            Online-Bestellungen sind derzeit pausiert. Die Speisekarte und der Pasta-Konfigurator bleiben
            zum Entdecken verfügbar. Besuche uns vor Ort oder schau auf Instagram bei
            {" "}
            <a
              href={PASTERA_BUSINESS.instagram}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#c49746] underline-offset-4 hover:underline"
            >
              @pastera.official
            </a>
            {" "}vorbei.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/menu" className="rounded-full border border-[#c49746]/40 px-5 py-2.5 text-sm font-semibold text-[#c49746] hover:bg-[#c49746]/10">
            Speisekarte entdecken
          </Link>
          <Link href="/builder" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 hover:border-white/30">
            Pasta zusammenstellen
          </Link>
        </div>
        <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-5 text-sm font-semibold text-white/65">
          <Link href="/restaurant-ehrenfeld" className="hover:text-[#c49746]">
            Restaurant Ehrenfeld
          </Link>
          <Link href="/pasta-koeln" className="hover:text-[#c49746]">
            Pasta Köln
          </Link>
          <Link href="/pasta-ehrenfeld" className="hover:text-[#c49746]">
            Pasta Ehrenfeld
          </Link>
          <Link href="/pasta-venloer-strasse" className="hover:text-[#c49746]">
            Pasta Venloer Straße
          </Link>
        </nav>
      </div>
    </section>
  );
}
