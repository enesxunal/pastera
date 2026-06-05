type VeganBadgeProps = {
  label?: string;
  size?: "xs" | "sm";
  className?: string;
};

const sizeMap = {
  xs: { box: "h-5 w-5", icon: "h-3 w-3" },
  sm: { box: "h-7 w-7", icon: "h-4 w-4" },
};

export function VeganBadge({ label = "Vegan", size = "sm", className = "" }: VeganBadgeProps) {
  const s = sizeMap[size];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-[#1a3d24]/90 text-[#7dcea0] ring-1 ring-[#4ade80]/45 backdrop-blur-sm ${s.box} ${className}`}
      title={label}
      aria-label={label}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={s.icon}
        aria-hidden
      >
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20c0-1 .2-2.3 1.5-3.5C11 15 13 14 17 13c0-1.7.6-3.3 1.5-5C17.3 9.3 17 8.7 17 8z" />
      </svg>
    </span>
  );
}
