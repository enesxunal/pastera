import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von Pastera Ehrenfeld.",
  alternates: { canonical: "/impressum" },
};

export default function ImpressumPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#c49746]">Rechtliches</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Impressum</h1>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-white/75">
          <section>
            <h2 className="text-xl font-semibold text-white">Angaben gemäß § 5 DDG</h2>
            <p className="mt-3">
              Robin Gül<br />
              Pastera – Frische Pasta (Einzelunternehmen)<br />
              Venloer Straße 342<br />
              50823 Köln<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Kontakt</h2>
            <p className="mt-3">
              Telefon: <a className="text-[#c49746] hover:underline" href="tel:+491634566354">+49 163 456 63 54</a><br />
              E-Mail: <a className="text-[#c49746] hover:underline" href="mailto:pastera.ehrenfeld@gmail.com">pastera.ehrenfeld@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Redaktionell verantwortlich</h2>
            <p className="mt-3">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />
              Robin Gül<br />
              Venloer Straße 342<br />
              50823 Köln
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
            <p className="mt-3">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Haftung für Inhalte</h2>
            <p className="mt-3">
              Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Haftung für Links</h2>
            <p className="mt-3">
              Unser Angebot enthält Links zu externen Websites Dritter (z. B. Instagram), auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft; rechtswidrige Inhalte waren nicht erkennbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">Urheberrecht</h2>
            <p className="mt-3">
              Die durch uns erstellten Inhalte und Werke (Texte, Fotos, Logo) auf diesen Seiten unterliegen dem deutschen Urheberrecht. Verviältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Rechteinhabers.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
