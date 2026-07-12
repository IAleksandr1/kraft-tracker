import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#EAE8E2",
        "paper-dark": "#DAD7CE",
        ink: "#161513",
        "ink-soft": "#3A3835",
        graphite: "#6E6B64",
        line: "#B9B6AC",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
