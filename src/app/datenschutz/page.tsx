import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung von Pastera Ehrenfeld.",
  alternates: { canonical: "/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#c49746]">Rechtliches</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Datenschutzerklärung</h1>
        <p className="mt-3 text-sm text-white/45">Stand: 23. September 2026</p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-white/75">
          <section>
            <h2 className="text-xl font-semibold text-white">1. Verantwortlicher</h2>
            <p className="mt-3">
              Verantwortlich für die Datenverarbeitung auf dieser Website (www.pastera.de) ist:
            </p>
            <p className="mt-3">
              Robin Gül<br />
              Pastera – Frische Pasta (Einzelunternehmen)<br />
              Venloer Straße 342<br />
              50823 Köln<br />
              Telefon: <a className="text-[#c49746] hover:underline" href="tel:+491634566354">+49 163 456 63 54</a><br />
              E-Mail: <a className="text-[#c49746] hover:underline" href="mailto:pastera.ehrenfeld@gmail.com">pastera.ehrenfeld@gmail.com</a>
            </p>
            <p className="mt-3">Ein Datenschutzbeauftragter ist nicht bestellt, da hierzu keine gesetzliche Pflicht besteht.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">2. Allgemeines</h2>
            <p className="mt-3">
              Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website, unserer Inhalte und Leistungen (z. B. Kundenkonto, Treuepunkte, Online-Bestellung) erforderlich ist. Rechtsgrundlagen sind insbesondere:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung),</li>
              <li>Art. 6 Abs. 1 lit. b DSGVO (Vertrag bzw. vorvertragliche Maßnahmen),</li>
              <li>Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung, z. B. steuerliche Aufbewahrungspflichten),</li>
              <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse).</li>
            </ul>
            <p className="mt-3">Die Übertragung dieser Website erfolgt aus Sicherheitsgründen per SSL/TLS-Verschlüsselung.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">3. Hosting (Vercel)</h2>
            <p className="mt-3">
              Unsere Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet. Beim Aufruf der Website werden automatisch Informationen erfasst, die Ihr Browser übermittelt (Server-Logfiles):
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>IP-Adresse,</li>
              <li>Datum und Uhrzeit des Zugriffs,</li>
              <li>aufgerufene Seite/Datei, übertragene Datenmenge,</li>
              <li>Referrer-URL,</li>
              <li>Browsertyp und -version, Betriebssystem.</li>
            </ul>
            <p className="mt-3">
              Die Verarbeitung erfolgt zur Auslieferung und Absicherung der Website auf Grundlage unseres berechtigten Interesses an einem stabilen und sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO). Vercel ist nach dem EU-US Data Privacy Framework zertifiziert; zusätzlich wurden Standardvertragsklauseln der EU-Kommission vereinbart. Weitere Informationen:{" "}
              <a className="text-[#c49746] hover:underline" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">https://vercel.com/legal/privacy-policy</a>
            </p>
            <p className="mt-3">Schriftarten werden lokal von unserem Server geladen; es findet keine Verbindung zu Google Fonts oder anderen Schriftarten-Anbietern statt.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">4. Cookies und lokale Speicherung</h2>
            <p className="mt-3">
              Wir setzen keine Analyse-, Tracking- oder Marketing-Cookies ein. Wenn Sie sich in Ihr Kundenkonto einloggen, wird ein für die Anmeldung technisch notwendiges Sitzungs-Token in Ihrem Browser gespeichert (Cookie bzw. Local Storage). Dies ist nach § 25 Abs. 2 Nr. 2 TDDDG ohne Einwilligung zulässig, da es für den von Ihnen ausdrücklich gewünschten Dienst unbedingt erforderlich ist. Rechtsgrundlage der anschließenden Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO. Das Token wird beim Abmelden bzw. nach Ablauf der Sitzung gelöscht.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">5. Kundenkonto und Treuepunkte</h2>
            <p className="mt-3">
              Sie können auf unserer Website ein Kundenkonto anlegen, um Treuepunkte zu sammeln und Bestellungen aufzugeben. Dabei verarbeiten wir:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Name,</li>
              <li>E-Mail-Adresse,</li>
              <li>Passwort (ausschließlich verschlüsselt/gehasht gespeichert),</li>
              <li>Bestellhistorie und Treuepunktestand.</li>
            </ul>
            <p className="mt-3">
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Durchführung des Nutzungsverhältnisses). Zur Bestätigung Ihrer E-Mail-Adresse bzw. zum Zurücksetzen des Passworts senden wir Ihnen E-Mails an die angegebene Adresse. Sie können Ihr Konto jederzeit löschen lassen (Kontakt siehe oben); die Daten werden dann gelöscht, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
            <h3 className="mt-5 font-semibold text-white">Supabase</h3>
            <p className="mt-2">
              Für Benutzerkonten, Anmeldung und Datenbank nutzen wir den Dienst Supabase Inc., 970 Toa Payoh North #07-04, Singapore 318992. Supabase verarbeitet die oben genannten Kontodaten in unserem Auftrag. Mit Supabase besteht ein Vertrag zur Auftragsverarbeitung (Art. 28 DSGVO); soweit eine Übermittlung in Drittländer stattfindet, erfolgt diese auf Grundlage von Standardvertragsklauseln. Weitere Informationen:{" "}
              <a className="text-[#c49746] hover:underline" href="https://supabase.com/privacy" target="_blank" rel="noreferrer">https://supabase.com/privacy</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">6. Online-Bestellung (Abholung)</h2>
            <p className="mt-3">
              Wenn Sie über unsere Website bestellen (derzeit pausiert), verarbeiten wir die zur Abwicklung erforderlichen Daten, insbesondere Name, Kontaktdaten, bestellte Gerichte, Abholzeit und gewählte Zahlungsart. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Rechnungs- und Buchungsbelege bewahren wir entsprechend den gesetzlichen Pflichten (§ 147 AO, § 257 HGB – bis zu 10 Jahre) auf (Art. 6 Abs. 1 lit. c DSGVO).
            </p>
            <h3 className="mt-5 font-semibold text-white">Zahlung mit PayPal</h3>
            <p className="mt-2">
              Wählen Sie die Zahlungsart PayPal (einschließlich Karte über PayPal), werden die zur Zahlungsabwicklung erforderlichen Daten (z. B. Name, Betrag, Bestellnummer) an PayPal (Europe) S.à r.l. et Cie, S.C.A., 22–24 Boulevard Royal, L-2449 Luxemburg, übermittelt. PayPal ist für die Zahlungsabwicklung eigener Verantwortlicher und führt ggf. eine Identitäts- und Bonitätsprüfung durch. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Datenschutzhinweise von PayPal:{" "}
              <a className="text-[#c49746] hover:underline" href="https://www.paypal.com/de/legalhub/privacy-full" target="_blank" rel="noreferrer">https://www.paypal.com/de/legalhub/privacy-full</a>
            </p>
            <p className="mt-3">Bei Barzahlung vor Ort werden keine Zahlungsdaten online verarbeitet.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">7. Kontaktaufnahme</h2>
            <p className="mt-3">
              Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir Ihre Angaben zur Bearbeitung der Anfrage (Art. 6 Abs. 1 lit. b DSGVO bei vertragsbezogenen Anfragen, sonst Art. 6 Abs. 1 lit. f DSGVO). Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet ist und keine Aufbewahrungspflichten bestehen.
            </p>
            <p className="mt-3">
              Für unser E-Mail-Postfach nutzen wir Gmail der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. E-Mails, die Sie uns senden, werden dort gespeichert. Eine Übermittlung an die Google LLC (USA) kann nicht ausgeschlossen werden; Google ist nach dem EU-US Data Privacy Framework zertifiziert. Weitere Informationen:{" "}
              <a className="text-[#c49746] hover:underline" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">https://policies.google.com/privacy</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">8. Link zu Instagram</h2>
            <p className="mt-3">
              Auf unserer Website verlinken wir auf unseren Instagram-Auftritt (@pastera.official). Es handelt sich um einen einfachen Link; beim Besuch unserer Website werden keine Daten an Instagram übertragen. Erst wenn Sie den Link anklicken, gelangen Sie zu Instagram, betrieben von Meta Platforms Ireland Ltd., Merrion Road, Dublin 4, Irland. Dort gilt deren Datenschutzerklärung:{" "}
              <a className="text-[#c49746] hover:underline" href="https://privacycenter.instagram.com/policy" target="_blank" rel="noreferrer">https://privacycenter.instagram.com/policy</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">9. Speicherdauer</h2>
            <p className="mt-3">Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist oder gesetzliche Aufbewahrungsfristen es vorschreiben. Danach werden die Daten gelöscht.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">10. Ihre Rechte</h2>
            <p className="mt-3">Sie haben jederzeit das Recht auf:</p>
            <ul className="mt-3 list-disc space-y-1 pl-6">
              <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO),</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO),</li>
              <li>Löschung (Art. 17 DSGVO),</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO),</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO),</li>
              <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).</li>
            </ul>
            <p className="mt-3">
              <strong className="text-white">Widerspruchsrecht (Art. 21 DSGVO):</strong> Soweit wir Daten auf Grundlage berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO) verarbeiten, können Sie aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen.
            </p>
            <p className="mt-3">Zur Ausübung Ihrer Rechte genügt eine formlose Nachricht an die oben genannten Kontaktdaten.</p>
            <p className="mt-3">
              <strong className="text-white">Beschwerderecht:</strong> Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Für uns zuständig ist: Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf,{" "}
              <a className="text-[#c49746] hover:underline" href="https://www.ldi.nrw.de" target="_blank" rel="noreferrer">https://www.ldi.nrw.de</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">11. Änderungen</h2>
            <p className="mt-3">Wir passen diese Datenschutzerklärung an, sobald sich die Website oder die rechtlichen Vorgaben ändern. Es gilt die jeweils aktuelle Fassung auf dieser Seite.</p>
          </section>
        </div>
      </div>
    </section>
  );
}
