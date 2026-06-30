import type { Config } from "tailwindcss";

/**
 * CDD Pays-Bas — Central brand theme.
 *
 * ▸ To match the existing website identity, edit ONLY the hex values below
 *   (or the CSS variables in src/app/globals.css). Nothing else needs to change.
 *
 *   brand.DEFAULT  -> primary brand color (navbar, headings, primary buttons)
 *   brand.dark     -> darker shade (hovers, footer)
 *   accent.DEFAULT -> accent / call-to-action color (gold by default)
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--brand)",
          dark: "var(--brand-dark)",
          light: "var(--brand-light)",
          50: "var(--brand-50)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      container: {
        center: true,
        padding: "1rem",
        screens: { "2xl": "1200px" },
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
