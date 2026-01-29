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
        "ewtn-red": "#EA002A",
        "ewtn-red-dark": "#C70023",
        "deep-navy": "#002D62",
        "deep-navy-light": "#003D82",
        "catskill-white": "#EFF2F8",
        "accent-gold": "#C9A227",
        "accent-gold-light": "#E6B92E",
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
