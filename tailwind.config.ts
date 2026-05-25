import type { Config } from "tailwindcss";

/** Markenfarben exakt: Waldgrün #2e402a, Champagnergold #c49746 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        matte: "#0a0a0a",
        "matte-up": "#151515",
        forest: "#2e402a",
        "forest-up": "#3d5238",
        gold: "#c49746",
        "gold-dim": "#9e7b38",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 48px -8px rgba(196, 151, 70, 0.45)",
        box: "0 28px 56px -16px rgba(0, 0, 0, 0.75), inset 0 0 0 1px rgba(196, 151, 70, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;
