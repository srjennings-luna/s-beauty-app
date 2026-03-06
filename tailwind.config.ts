import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* KALLOS design system */
        "parchment":   "#fdf6e8",
        "espresso":    "#16110d",
        "near-black":  "#1a1a1a",
        "sage":        "#4a7a62",
        "sage-muted":  "#7a9a8a",
        "blue-mist":   "#8aacb8",
        "sacred-gold": "#C19B5F",
        /* aliases */
        "accent-gold": "#C19B5F",
        "accent-gold-light": "#D4B56A",
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
