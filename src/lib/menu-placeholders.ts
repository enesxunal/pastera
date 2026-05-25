/** Stabile Demo-Bilder: lokale SVG-data-URI (kein externes CDN/404). */

function pickEmoji(label: string): string {
  const t = label.toLowerCase();

  // Pasta
  if (/(spaghetti|penne|tagliatelle|gnocchi|pasta|nudel)/.test(t)) return "🍝";

  if (/(suppe|soup|cremig)/.test(t)) return "🥣";
  if (/(aubergine|eggplant)/.test(t)) return "🍆";
  if (/(garnelen|shrimp|garnele)/.test(t)) return "🦐";
  if (/(pilz|champignon|mushroom)/.test(t)) return "🍄";
  if (/(tofu)/.test(t)) return "🧈";
  if (/(seitan)/.test(t)) return "🌾";
  if (/(curry)/.test(t)) return "🍛";

  // Sauces
  if (/(bolognese|bolo)/.test(t)) return "🍖";
  if (/(pesto)/.test(t)) return "🌿";
  if (/(arrabbiata|tomat|pomodoro)/.test(t)) return "🍅";
  if (/(carbonara)/.test(t)) return "🥚";
  if (/(aglio|knoblauch|garlic)/.test(t)) return "🧄";

  // Ingredients
  if (/(parmesan|burrata|käse|kase|cheese)/.test(t)) return "🧀";
  if (/(chili|pepper)/.test(t)) return "🌶️";
  if (/(olive|oliven)/.test(t)) return "🫒";
  if (/(rucola|rocket)/.test(t)) return "🥬";

  // Drinks
  if (/(wasser|water)/.test(t)) return "💧";
  if (/(cola|limo|limonade|soda)/.test(t)) return "🥤";
  if (/(espresso|kaffee|coffee)/.test(t)) return "☕";
  if (/(wein|wine)/.test(t)) return "🍷";

  // Desserts
  if (/(tiramisu|kakao|cake)/.test(t)) return "🍰";
  if (/(sorbet|eis|ice)/.test(t)) return "🍧";

  return "🍽️";
}

export function menuDemoImage(label: string): string {
  const title = label.replace(/\s+/g, " ").trim().slice(0, 28);
  const emoji = pickEmoji(title);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1b2719"/>
      <stop offset="1" stop-color="#2e402a"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.3" cy="0.25" r="0.9">
      <stop offset="0" stop-color="#c49746" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#c49746" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>

  <rect width="800" height="600" fill="url(#bg)"/>
  <rect width="800" height="600" fill="url(#glow)"/>

  <g filter="url(#shadow)">
    <rect x="60" y="60" width="680" height="480" rx="32" fill="rgba(10,10,10,0.35)" stroke="rgba(196,151,70,0.55)" stroke-width="3"/>
  </g>

  <text x="400" y="290" text-anchor="middle" font-size="160" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial">
    ${emoji}
  </text>

  <text x="400" y="420" text-anchor="middle" font-size="44" font-weight="800"
        fill="#f6f0e3" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial">
    ${escapeXml(title)}
  </text>
  <text x="400" y="468" text-anchor="middle" font-size="18" font-weight="700"
        fill="rgba(255,255,255,0.65)" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" letter-spacing="2">
    TEMSİLİ GÖRSEL
  </text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
