import type { Config } from "tailwindcss";

// Dieselpunk palette lifted from docs/design-reference.html.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coal: "#11110f",
        "coal-2": "#171713",
        panel: "#1d1c18",
        "panel-2": "#24231e",
        line: "#4a4538",
        brass: "#a78a58",
        "brass-dim": "#6f6249",
        paper: "#d8d1bf",
        "paper-dim": "#aaa28f",
        signal: "#22a8e0",
        "signal-deep": "#0b5f86",
        danger: "#c46a55",
      },
      fontFamily: {
        industrial: [
          '"Arial Narrow"',
          '"Roboto Condensed"',
          "Arial",
          "sans-serif",
        ],
        serif: ["Georgia", "serif"],
      },
      boxShadow: {
        panel:
          "0 0 0 2px #0b0b09, 0 12px 25px rgba(0,0,0,0.62), inset 0 1px rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
