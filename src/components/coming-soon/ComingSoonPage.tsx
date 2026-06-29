import Image from "next/image";
import Link from "next/link";

const INSTAGRAM = "https://www.instagram.com/pastapastera/";

export function ComingSoonPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4px)] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Image
            src="/pastera-Logo-beyaz.png"
            alt="Pastera"
            width={200}
            height={64}
            className="h-auto w-[min(200px,70vw)]"
            priority
          />
        </div>

        <p className="font-display text-sm font-semibold uppercase tracking-[0.35em] text-[#b8cc78]">
          Coming Soon
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
          Bald öffnen wir unsere Türen
        </h1>
        <p className="mt-5 text-base leading-relaxed text-white/60 sm:text-lg">
          Wir finalisieren gerade unser Online-Erlebnis. Frische Pasta, eigene Schalen
          und Lieferung — sehr bald auf{" "}
          <span className="text-[#c49746]">pastera.de</span>.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[#2e402a] bg-[#2e402a]/40 px-8 py-3 font-display text-sm font-bold text-white transition hover:border-[#c49746]/50 hover:text-[#c49746]"
          >
            Instagram folgen
          </Link>
        </div>

        <p className="mt-14 text-xs text-white/30">© {new Date().getFullYear()} Pastera</p>
      </div>
    </div>
  );
}
