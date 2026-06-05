import type { ReactNode } from "react";

type IconProps = { size?: number; className?: string };

function Svg({ size = 32, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const icons: Record<string, (p: IconProps) => JSX.Element> = {
  "noodle-classic": (p) => (
    <Svg {...p}>
      <path d="M6 8c4 0 6 3 6 8s-2 8-6 8" fill="none" stroke="#e8c882" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M13 6c4 0 6 4 6 10s-2 10-6 10" fill="none" stroke="#d4a85a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20 8c4 0 6 3 6 8s-2 8-6 8" fill="none" stroke="#e8c882" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  ),
  "noodle-vegan": (p) => (
    <Svg {...p}>
      <path d="M6 8c4 0 6 3 6 8s-2 8-6 8" fill="none" stroke="#9eb87a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 7c4 0 6 4 6 10s-2 10-6 10" fill="none" stroke="#7a9e5a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 9c3 0 5 3 5 7s-2 7-5 7" fill="none" stroke="#9eb87a" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  ),
  "noodle-black": (p) => (
    <Svg {...p}>
      <path d="M7 9c3 0 5 3 5 7s-2 7-5 7" fill="none" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 7c4 0 6 4 6 10s-2 10-6 10" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      <path d="M21 8c3 0 5 3 5 7s-2 7-5 7" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  ),
  "noodle-chocolate": (p) => (
    <Svg {...p}>
      <path d="M6 10c4 0 6 2 6 6s-2 6-6 6" fill="none" stroke="#6b4423" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14 8c4 0 6 3 6 8s-2 8-6 8" fill="none" stroke="#5c3d2e" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 10c3 0 5 2 5 6s-2 6-5 6" fill="none" stroke="#6b4423" strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  ),
  "s-domates-vegan": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="20" rx="10" ry="6" fill="#c73e2e" />
      <path d="M16 6v10" stroke="#c73e2e" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="5" r="3" fill="#e85a4a" />
    </Svg>
  ),
  "s-bolognese": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="22" rx="11" ry="6" fill="#7a3428" />
      <circle cx="10" cy="18" r="2" fill="#5c2820" />
      <circle cx="20" cy="19" r="1.5" fill="#5c2820" />
    </Svg>
  ),
  "s-curry": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="21" rx="10" ry="6" fill="#e8a317" />
      <path d="M10 18h12" stroke="#c88a10" strokeWidth="1.5" />
    </Svg>
  ),
  "s-krema": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="21" rx="10" ry="6" fill="#f3efe4" />
      <path d="M12 17c2 2 6 2 8 0" stroke="#ddd8cc" strokeWidth="1.5" fill="none" />
    </Svg>
  ),
  "s-pesto": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="21" rx="10" ry="6" fill="#4a7c3f" />
      <circle cx="12" cy="18" r="2" fill="#3a6232" />
      <circle cx="20" cy="19" r="1.5" fill="#3a6232" />
    </Svg>
  ),
  "s-arrabbiata": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="21" rx="10" ry="6" fill="#d4382a" />
      <path d="M22 12l2-4 2 1-3 5" fill="#c49746" />
    </Svg>
  ),
  "s-choc-dark": (p) => (
    <Svg {...p}>
      <rect x="8" y="10" width="16" height="14" rx="2" fill="#3d2314" />
      <path d="M8 14h16" stroke="#2a1810" strokeWidth="1" />
    </Svg>
  ),
  "s-choc-white": (p) => (
    <Svg {...p}>
      <rect x="8" y="10" width="16" height="14" rx="2" fill="#f2e8d8" />
      <path d="M8 14h16" stroke="#ddd0bc" strokeWidth="1" />
    </Svg>
  ),
  "t-julienne-rind": (p) => (
    <Svg {...p}>
      <rect x="6" y="12" width="20" height="4" rx="1" fill="#8b4513" transform="rotate(-8 16 14)" />
      <rect x="8" y="18" width="16" height="3" rx="1" fill="#a0522d" transform="rotate(5 16 19)" />
    </Svg>
  ),
  "t-julienne-haehnchen": (p) => (
    <Svg {...p}>
      <rect x="7" y="13" width="18" height="4" rx="1" fill="#f4c89a" transform="rotate(-6 16 15)" />
      <rect x="9" y="19" width="14" height="3" rx="1" fill="#e8b080" transform="rotate(4 16 20)" />
    </Svg>
  ),
  "t-jumbo-garnelen": (p) => (
    <Svg {...p}>
      <path d="M8 20c4-6 12-6 16 0" fill="none" stroke="#f4a89a" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 18c0-3 3-5 6-5" fill="none" stroke="#e89080" strokeWidth="2" />
      <circle cx="22" cy="18" r="1.5" fill="#333" />
    </Svg>
  ),
  "t-tenders": (p) => (
    <Svg {...p}>
      <path d="M10 22 L16 8 L22 22 Z" fill="#e8b060" stroke="#c89040" strokeWidth="1" />
    </Svg>
  ),
  "t-falafel": (p) => (
    <Svg {...p}>
      <circle cx="12" cy="18" r="5" fill="#8b6914" />
      <circle cx="20" cy="20" r="4" fill="#a07818" />
    </Svg>
  ),
  "t-tofu": (p) => (
    <Svg {...p}>
      <rect x="9" y="11" width="14" height="12" rx="1" fill="#f5f0e0" stroke="#ddd8c8" />
    </Svg>
  ),
  "t-seitan": (p) => (
    <Svg {...p}>
      <rect x="10" y="12" width="12" height="10" rx="2" fill="#c4a060" />
    </Svg>
  ),
  "t-cherry": (p) => (
    <Svg {...p}>
      <circle cx="12" cy="20" r="5" fill="#e03030" />
      <circle cx="20" cy="18" r="4" fill="#c02020" />
      <path d="M16 8v6" stroke="#4a7c3f" strokeWidth="1.5" />
    </Svg>
  ),
  "t-babyspinat": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="18" rx="10" ry="6" fill="#3d7a35" />
      <path d="M16 10v6" stroke="#2d5a28" strokeWidth="1.5" />
    </Svg>
  ),
  "t-mantar": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="14" rx="9" ry="5" fill="#c4a882" />
      <rect x="13" y="14" width="6" height="8" rx="1" fill="#e8dcc8" />
    </Svg>
  ),
  "t-rucola": (p) => (
    <Svg {...p}>
      <path d="M8 22 Q12 10 16 22 Q20 10 24 22" fill="none" stroke="#4a8c40" strokeWidth="2" />
    </Svg>
  ),
  "t-birne": (p) => (
    <Svg {...p}>
      <path d="M16 8c-5 0-7 6-7 11s3 9 7 9 7-4 7-9-2-11-7-11z" fill="#c8d85a" />
      <path d="M16 6v3" stroke="#5c4030" strokeWidth="1.5" />
    </Svg>
  ),
  "t-brokkoli": (p) => (
    <Svg {...p}>
      <circle cx="12" cy="14" r="4" fill="#3d8c35" />
      <circle cx="20" cy="14" r="4" fill="#4a9c40" />
      <circle cx="16" cy="10" r="4" fill="#3d8c35" />
      <rect x="14" y="16" width="4" height="8" fill="#5a9e48" />
    </Svg>
  ),
  "t-ceviz": (p) => (
    <Svg {...p}>
      <path d="M16 6c-4 4-6 10-6 14a6 6 0 0012 0c0-4-2-10-6-14z" fill="#8b5a2b" />
    </Svg>
  ),
  "t-mais": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="18" rx="6" ry="9" fill="#f0d040" />
      <path d="M12 12v12M16 10v14M20 12v12" stroke="#d4a820" strokeWidth="1" />
    </Svg>
  ),
  "t-gorgonzola": (p) => (
    <Svg {...p}>
      <path d="M8 24 L16 8 L24 24 Z" fill="#e8e8f0" stroke="#b8b8c8" />
      <circle cx="14" cy="18" r="1.5" fill="#8090a0" />
      <circle cx="18" cy="20" r="1" fill="#8090a0" />
    </Svg>
  ),
  "t-siyah-zeytin": (p) => (
    <Svg {...p}>
      <ellipse cx="12" cy="18" rx="4" ry="5" fill="#1a1a1a" />
      <ellipse cx="20" cy="17" rx="4" ry="5" fill="#2a2a2a" />
      <circle cx="12" cy="16" r="1" fill="#c49746" />
      <circle cx="20" cy="15" r="1" fill="#c49746" />
    </Svg>
  ),
  "t-yesil-zeytin": (p) => (
    <Svg {...p}>
      <ellipse cx="12" cy="18" rx="4" ry="5" fill="#5a7a32" />
      <ellipse cx="20" cy="17" rx="4" ry="5" fill="#6a8c3a" />
      <circle cx="12" cy="16" r="1" fill="#c49746" />
      <circle cx="20" cy="15" r="1" fill="#c49746" />
    </Svg>
  ),
  "t-rosmarin": (p) => (
    <Svg {...p}>
      <path d="M10 24 L16 8 L22 24" fill="none" stroke="#4a7c3f" strokeWidth="2" />
      <path d="M12 18h8M13 14h6" stroke="#3a6c2f" strokeWidth="1" />
    </Svg>
  ),
  "t-passion-fruit": (p) => (
    <Svg {...p}>
      <circle cx="16" cy="17" r="9" fill="#6a3080" />
      <circle cx="16" cy="17" r="5" fill="#f0c040" />
    </Svg>
  ),
  "t-kurutulmus-sogan": (p) => (
    <Svg {...p}>
      <ellipse cx="12" cy="18" rx="5" ry="2" fill="none" stroke="#c49040" strokeWidth="2" />
      <ellipse cx="20" cy="20" rx="4" ry="1.5" fill="none" stroke="#a87030" strokeWidth="2" />
    </Svg>
  ),
  "t-jalapeno": (p) => (
    <Svg {...p}>
      <path d="M16 6c-2 6-2 12 0 18 2-6 2-12 0-18z" fill="#3d8c35" />
    </Svg>
  ),
  "t-sarimsak": (p) => (
    <Svg {...p}>
      <ellipse cx="16" cy="18" rx="5" ry="7" fill="#f0ece0" stroke="#ddd8cc" />
    </Svg>
  ),
  "t-mozzarella": (p) => (
    <Svg {...p}>
      <circle cx="12" cy="18" r="5" fill="#f8f8f0" stroke="#e0e0d8" />
      <circle cx="20" cy="19" r="4" fill="#fff" stroke="#e8e8e0" />
    </Svg>
  ),
  "t-taze-sogan": (p) => (
    <Svg {...p}>
      <path d="M10 24 L16 10 L22 24" fill="none" stroke="#7cba5a" strokeWidth="2" />
      <line x1="16" y1="10" x2="16" y2="6" stroke="#5a9e40" strokeWidth="1.5" />
    </Svg>
  ),
  "t-kaju": (p) => (
    <Svg {...p}>
      <path d="M10 20c0-6 4-10 6-10s6 4 6 10" fill="#e8c070" stroke="#c8a050" />
    </Svg>
  ),
  "t-choc-muz": (p) => (
    <Svg {...p}>
      <path d="M8 20 Q16 6 24 20" fill="#f0d040" stroke="#d4a820" />
    </Svg>
  ),
  "t-choc-cilek": (p) => (
    <Svg {...p}>
      <path d="M16 8 L10 22 L22 22 Z" fill="#e03050" />
      <circle cx="14" cy="18" r="1" fill="#ff6080" />
      <circle cx="18" cy="17" r="1" fill="#ff6080" />
    </Svg>
  ),
  "t-choc-kiwi": (p) => (
    <Svg {...p}>
      <circle cx="16" cy="17" r="9" fill="#8b6914" />
      <circle cx="16" cy="17" r="4" fill="#90c040" />
    </Svg>
  ),
  "t-choc-birne": (p) => (
    <Svg {...p}>
      <path d="M16 8c-5 0-7 6-7 11s3 9 7 9 7-4 7-9-2-11-7-11z" fill="#c8d060" />
    </Svg>
  ),
  "t-choc-passion": (p) => (
    <Svg {...p}>
      <circle cx="16" cy="17" r="8" fill="#5a2870" />
      <circle cx="16" cy="17" r="4" fill="#e8b030" />
    </Svg>
  ),
};

function FallbackIcon({ size = 32 }: IconProps) {
  return (
    <Svg size={size}>
      <circle cx="16" cy="16" r="8" fill="#2e402a" stroke="#c49746" strokeWidth="1.5" />
    </Svg>
  );
}

export function IngredientIcon({ id, size = 32, className }: { id: string; size?: number; className?: string }) {
  const Icon = icons[id];
  if (!Icon) return <FallbackIcon size={size} className={className} />;
  return <Icon size={size} className={className} />;
}
