"use client";

/** A shared loyalty card for the member and the physical cashier screen. */
type VipStampCardProps = {
  memberName?: string;
  cardNumber?: string | null;
  progress: number;
  stamps: number;
  remaining: number;
  availableRewards: number;
  redemptions: number;
  lastScanAt?: string;
  animationKey?: string | null;
  lastDelta?: number;
  isSimulation?: boolean;
  waiting?: boolean;
};

export function VipStampCard({
  memberName,
  cardNumber,
  progress,
  stamps,
  remaining,
  availableRewards,
  redemptions,
  lastScanAt,
  animationKey,
  lastDelta = 0,
  isSimulation = false,
  waiting = false,
}: VipStampCardProps) {
  const filled = Math.max(0, Math.min(10, availableRewards > 0 && progress === 0 ? 10 : progress));
  const newStamp = Boolean(animationKey && lastDelta === 1 && filled > 0);
  const corrected = Boolean(animationKey && lastDelta < 0);

  return (
    <section aria-label="VIP-Stempelkarte" aria-live="polite" className="relative overflow-hidden rounded-[28px] border border-[#c49746]/35 bg-[#18281d] shadow-[0_25px_65px_-36px_rgba(0,0,0,0.65)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#273b29] via-[#17271c] to-[#0d170f]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-36 h-[370px] w-[370px] rounded-full border border-[#c49746]/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-14 h-[250px] w-[250px] rounded-full border border-[#c49746]/10" />
      <div className="relative px-5 pb-6 pt-6 sm:px-9 sm:pb-8 sm:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0c18b]/15 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d1ae70]/45 text-[#dfbd80]" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6">
                <path d="M7 7a7 7 0 0 1 0 10M11 4a11 11 0 0 1 0 16M15 2a15 15 0 0 1 0 20" />
              </svg>
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d9b875]">VIP Club</p>
              <p className="mt-0.5 font-display text-[17px] font-semibold tracking-tight text-[#f1e9d9]">Deine Stempelkarte</p>
            </div>
          </div>
          <div className="rounded-full border border-[#c49746]/25 bg-[#c49746]/[0.08] px-3.5 py-2 text-[11px] font-medium tracking-[0.04em] text-[#e3c896]">
            10 Stempel = 1 Gratis-Pasta
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#a9b5a7]">
              {waiting ? "Karte noch nicht gescannt" : "VIP-Mitglied"}
            </p>
            <h2 className="mt-2 max-w-[530px] truncate font-display text-[26px] font-semibold leading-tight tracking-tight text-[#faf7ed] sm:text-[32px]">
              {waiting ? "Bereit für deine VIP-Karte" : memberName || "VIP-Mitglied"}
            </h2>
            {cardNumber ? <p className="mt-1.5 text-sm text-[#ddc38f]">Kartennummer {cardNumber}</p> : null}
          </div>
          <div className="flex items-baseline gap-1.5 rounded-2xl border border-[#d7b77d]/20 bg-black/15 px-4 py-2">
            <strong className="font-display text-[40px] font-semibold tabular-nums leading-none text-[#ebca8a] sm:text-[48px]">{filled}</strong>
            <span className="font-display text-xl text-[#c0b197]">/ 10</span>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-5 gap-2.5 sm:grid-cols-10 sm:gap-3" aria-label={`${filled} von 10 Stempeln gesammelt`}>
          {Array.from({ length: 10 }, (_, index) => {
            const isFilled = index < filled;
            const isNew = newStamp && index === filled - 1;
            return (
              <div key={index} className="flex items-center justify-center">
                <span key={isNew ? `${index}-${animationKey}` : index} className={`relative flex aspect-square w-full max-w-[78px] items-center justify-center rounded-full border-[1.5px] transition-colors duration-300 ${isFilled ? "border-[#dcb978] bg-[#c49746]/[0.14] text-[#f0d49d]" : "border-dashed border-[#a9b19d]/25 bg-[#0d180f]/35 text-[#92a293]/55"} ${isNew ? "vip-new-stamp" : ""}`} aria-label={`Stempel ${index + 1}: ${isFilled ? "gesammelt" : "offen"}`}>
                  {isFilled ? (
                    <svg aria-hidden="true" className="h-[62%] w-[62%] -rotate-[12deg]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="24" cy="24" r="19" strokeWidth="1.5" opacity=".84" />
                      <circle cx="24" cy="24" r="15.5" strokeWidth=".75" opacity=".55" strokeDasharray="2.2 2.2" />
                      <path d="m15.5 24 5.5 5.5L32.5 18" strokeWidth="3.3" />
                    </svg>
                  ) : <span className="font-display text-[15px] font-medium tabular-nums sm:text-lg">{String(index + 1).padStart(2, "0")}</span>}
                  {isNew ? <span key={`ring-${animationKey}`} aria-hidden="true" className="vip-new-stamp-ring pointer-events-none absolute -inset-2 rounded-full border-2 border-[#e9ca88]" /> : null}
                </span>
              </div>
            );
          })}
        </div>

        {isSimulation ? <p className="mt-5 text-sm font-semibold text-amber-200">TESTBUCHUNG – KEIN ECHTER VERKAUF</p> : null}

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#e0c18b]/15 pt-5">
          <div>
            {newStamp ? (
              <p key={animationKey} className="vip-booking-pop flex items-center gap-2 font-semibold text-[#edce92]" role="status">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 12 5 5L20 6" /></svg>
                +1 Stempel gesammelt!
              </p>
            ) : corrected ? <p className="text-sm font-semibold text-[#e7c48b]">Eine Buchung wurde korrigiert.</p> : availableRewards > 0 ? (
              <p className="font-display text-lg font-semibold text-[#f1d295]">Deine Gratis-Pasta ist bereit!</p>
            ) : <p className="font-medium text-[#f0ebde]">{waiting ? "Karte auflegen und Stempel sammeln" : `Noch ${remaining} ${remaining === 1 ? "Bestellung" : "Bestellungen"} bis zur Gratis-Pasta`}</p>}
            {availableRewards > 0 ? <p className="mt-1 text-sm text-[#c6cbbd]">{availableRewards} Gratis-Pasta verfügbar · An der Kasse einlösbar</p> : null}
          </div>
          <div className="text-right text-xs leading-5 text-[#9eab9e]">
            <p>{stamps} Bestellungen · {redemptions} eingelöste Prämien</p>
            {lastScanAt ? <p>Letzte Buchung: {new Date(lastScanAt).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</p> : null}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes vip-stamp-ink {
          0% { transform: scale(1.65) rotate(-20deg); opacity: 0; filter: brightness(1.8); }
          42% { transform: scale(.88) rotate(6deg); opacity: 1; filter: brightness(1.4); }
          68% { transform: scale(1.07) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); filter: brightness(1); }
        }
        @keyframes vip-stamp-ripple {
          0% { transform: scale(.55); opacity: .85; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes vip-booking-appear {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .vip-new-stamp { animation: vip-stamp-ink 650ms cubic-bezier(.19,1,.22,1) both; }
        .vip-new-stamp-ring { animation: vip-stamp-ripple 820ms ease-out forwards; }
        .vip-booking-pop { animation: vip-booking-appear 350ms ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .vip-new-stamp, .vip-new-stamp-ring, .vip-booking-pop { animation: none; }
          .vip-new-stamp-ring { display: none; }
        }
      `}</style>
    </section>
  );
}
