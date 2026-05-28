import type { Config } from "tailwindcss";

/**
 * NOTE: This project uses Tailwind v4 — the `@theme inline` block in
 * app/globals.css is the canonical source of truth for design tokens.
 * The color values here are kept in sync as a backstop only. If you change
 * a color, change it in globals.css FIRST, then mirror it here.
 *
 * TODO: Once we verify nothing depends on this config file for color
 * resolution (Tailwind v4 reads `@theme inline` directly), we can drop
 * the colors block entirely.
 */
const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* KALLOS design system — mirrors --color-* in app/globals.css */
        "parchment":   "#fdf6e9",
        "espresso":    "#16110d",
        "near-black":  "#1a1a1a",
        "sage":        "#4a7a62",
        "sage-muted":  "#7a9a8a",
        "blue-mist":   "#8aacb8",
        "sacred-gold": "#C19B5F",
        /* aliases */
        "accent-gold": "#C19B5F",
        "accent-gold-light": "#D4B56A",
        "gold":        "#C19B5F",
        "gold-light":  "#D4B56A",
        /* kept for any remaining legacy references */
        "deep-navy": "#1a2742",
        "deep-navy-light": "#263654",
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        "open-sans": ["Open Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
