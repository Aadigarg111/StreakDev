import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "duo-green": "var(--duo-green)",
        "duo-green-dark": "var(--duo-green-dark)",
        "duo-blue": "var(--duo-blue)",
        "duo-blue-dark": "var(--duo-blue-dark)",
        "duo-red": "var(--duo-red)",
        "duo-red-dark": "var(--duo-red-dark)",
        "duo-yellow": "var(--duo-yellow)",
        "duo-yellow-dark": "var(--duo-yellow-dark)",
        "duo-purple": "var(--duo-purple)",
        "duo-grey-bg": "var(--duo-grey-bg)",
        "duo-grey-panel": "var(--duo-grey-panel)",
        "duo-grey-border": "var(--duo-grey-border)",
        "duo-grey-text": "var(--duo-grey-text)",
        "duo-grey-disabled": "var(--duo-grey-disabled)",
        "duo-eel": "var(--duo-eel)",
        "duo-swan": "var(--duo-swan)",
        "duo-snow": "var(--duo-snow)",
      },
      borderRadius: {
        duo: "16px",
        "duo-lg": "24px",
      },
      boxShadow: {
        "duo-focus": "0 0 0 4px rgb(28 176 246 / 0.22)",
      },
      fontFamily: {
        rounded: ["var(--font-rounded)", "Nunito", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
