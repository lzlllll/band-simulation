/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: {
          900: "#0E0B0A",
          800: "#161110",
          700: "#1F1815",
          600: "#2A201C",
          500: "#3A2E28",
          400: "#524038",
        },
        amber: {
          DEFAULT: "#E8A33D",
          soft: "#D8902A",
          glow: "rgba(232,163,61,0.18)",
        },
        crimson: {
          DEFAULT: "#C5303A",
          soft: "#8E2434",
        },
        cream: {
          DEFAULT: "#F5EDE0",
          dim: "#C9BCA8",
          mute: "#8B7E6E",
          fade: "#5E5448",
        },
        sage: {
          DEFAULT: "#7BA05B",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Noto Serif SC"', "serif"],
        body: ['"Inter Tight"', '"Noto Sans SC"', "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
        wider2: "0.12em",
        widest2: "0.24em",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        "spin-slow": "spin 12s linear infinite",
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite",
        "flicker": "flicker 4s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(232,163,61,0.0)" },
          "50%": { boxShadow: "0 0 24px 2px rgba(232,163,61,0.25)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "47%": { opacity: "1" },
          "48%": { opacity: "0.6" },
          "49%": { opacity: "1" },
          "72%": { opacity: "1" },
          "73%": { opacity: "0.4" },
          "74%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
