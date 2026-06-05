"use client";

type MobileActionBarProps = {
  totalLabel: string;
  total: string;
  buttonLabel: string;
  onAction: () => void;
  disabled?: boolean;
};

/** Mobilde sabit alt eylem çubuğu (toplam + ana buton). */
export function MobileActionBar({
  totalLabel,
  total,
  buttonLabel,
  onAction,
  disabled = false,
}: MobileActionBarProps) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2e402a] bg-matte/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/45">
            {totalLabel}
          </p>
          <p className="font-display text-2xl font-bold text-white">{total}</p>
        </div>
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className="shrink-0 rounded-full px-6 py-3.5 font-display text-sm font-bold text-[#0a0a0a] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          style={{ backgroundColor: "#c49746" }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
