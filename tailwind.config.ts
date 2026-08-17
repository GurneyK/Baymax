import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          25: "#FCFAFF",
          50: "#F9F5FF",
          100: "#F4EBFF",
          200: "#E9D7FE",
          300: "#D6BBFB",
          400: "#B692F6",
          500: "#9E77ED",
          600: "#7F56D9",
          700: "#6941C6",
          800: "#53389E",
          900: "#42307D",
        },
        gray: {
          25: "#FCFCFD",
          50: "#F9FAFB",
          100: "#F2F4F7",
          200: "#E4E7EC",
          300: "#D0D5DD",
          400: "#98A2B3",
          500: "#667085",
          600: "#475467",
          700: "#344054",
          800: "#1D2939",
          900: "#101828",
        },
        error: {
          50: "#FEF3F2",
          100: "#FEE4E2",
          300: "#FDA29B",
          500: "#F04438",
          600: "#D92D20",
          700: "#B42318",
        },
        warning: {
          50: "#FFFAEB",
          100: "#FEF0C7",
          300: "#FEC84B",
          500: "#F79009",
          600: "#DC6803",
          700: "#B54708",
        },
        success: {
          50: "#ECFDF3",
          100: "#D1FADF",
          300: "#6CE9A6",
          500: "#12B76A",
          600: "#039855",
          700: "#027A48",
        },
        info: {
          50: "#EFF8FF",
          100: "#D1E9FF",
          300: "#84CAFF",
          500: "#2E90FA",
          600: "#1570EF",
          700: "#175CD3",
        },
      },
      borderRadius: {
        habibiSm: "6px",
        habibiMd: "8px",
        habibiLg: "12px",
        habibiXl: "16px",
      },
      boxShadow: {
        habibiXs: "0 1px 2px rgba(16, 24, 40, 0.05)",
        habibiSm: "0 1px 3px rgba(16, 24, 40, 0.1), 0 1px 2px rgba(16, 24, 40, 0.06)",
        habibiMd: "0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
