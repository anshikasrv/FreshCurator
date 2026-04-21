import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface-container-highest": "var(--surface-container-highest)",
        "surface": "var(--surface)",
        "tertiary-dim": "#922c00", // Keep fixed if not used in primary theme
        "on-error": "var(--on-error)",
        "tertiary-container": "var(--tertiary-container)",
        "primary-container": "var(--primary-container)",
        "secondary": "var(--secondary)",
        "surface-tint": "var(--primary)",
        "outline": "var(--outline)",
        "surface-container-lowest": "var(--background)",
        "tertiary": "var(--tertiary)",
        "on-secondary-fixed": "var(--on-secondary)",
        "primary-fixed": "var(--primary)",
        "on-tertiary": "var(--on-tertiary)",
        "secondary-fixed-dim": "var(--secondary)",
        "secondary-fixed": "var(--secondary)",
        "on-surface": "var(--on-surface)",
        "outline-variant": "var(--outline-variant)",
        "secondary-container": "var(--secondary-container)",
        "primary-fixed-dim": "var(--primary)",
        "on-background": "var(--on-background)",
        "on-tertiary-fixed": "var(--on-tertiary)",
        "surface-container-high": "var(--surface-container-high)",
        "error-container": "var(--error-container)",
        "on-primary-container": "var(--on-primary-container)",
        "inverse-on-surface": "var(--on-background)",
        "tertiary-fixed-dim": "var(--tertiary)",
        "tertiary-fixed": "var(--tertiary)",
        "surface-dim": "var(--surface-container-low)",
        "on-error-container": "var(--on-error-container)",
        "primary": "var(--primary)",
        "on-surface-variant": "var(--on-surface-variant)",
        "inverse-primary": "var(--on-primary-container)",
        "error": "var(--error)",
        "on-primary": "var(--on-primary)",
        "surface-bright": "var(--surface-container-high)",
        "background": "var(--background)",
        "inverse-surface": "var(--on-surface)",
        "error-dim": "var(--error)",
        "on-secondary": "var(--on-secondary)",
        "on-primary-fixed-variant": "var(--primary)",
        "on-secondary-fixed-variant": "var(--secondary)",
        "on-secondary-container": "var(--on-secondary-container)",
        "surface-container-low": "var(--surface-container-low)",
        "on-tertiary-container": "var(--on-tertiary-container)",
        "surface-container": "var(--surface-container)",
        "surface-variant": "var(--surface-variant)",
        "primary-dim": "var(--primary)",
        "on-primary-fixed": "var(--on-primary)",
        "secondary-dim": "var(--secondary)",
        "on-tertiary-fixed-variant": "var(--on-tertiary)"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      fontFamily: {
        "headline": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
