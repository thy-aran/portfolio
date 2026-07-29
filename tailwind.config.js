/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        panel: "#0D0D0D",
        blood: {
          DEFAULT: "#450000",
          deep: "#450000",
          mid: "#8B0000",
          glow: "#C1121F",
        },
        chrome: "#C0C0C0",
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["Outfit", "sans-serif"],
      },
      letterSpacing: {
        brand: "0.28em",
        wide: "0.18em",
      },
      boxShadow: {
        redglow: "0 0 40px rgba(193, 18, 31, 0.35)",
        "redglow-sm": "0 0 20px rgba(193, 18, 31, 0.25)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.85" },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
