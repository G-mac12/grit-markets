import type { Config } from "tailwindcss";

/**
 * Grit Markets — "Quant Terminal" design tokens.
 *
 * Accent direction: SIGNAL AMBER (CRT-terminal amber) is the committed accent.
 * The alternative candidate, electric green (#2BD576), is kept below as
 * `accent-alt` so the owner can compare both live; swap the two values to
 * flip the whole system. [OWNER INPUT: confirm amber vs green]
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base graphite scale
        ink: {
          DEFAULT: "#0A0B0D", // page background
          900: "#0A0B0D",
          850: "#0D0F12", // alt section background
          800: "#101216", // panel
          700: "#16191F", // elevated panel
          600: "#1D2129", // hover surface
        },
        line: {
          DEFAULT: "#23262E", // 1px rules
          strong: "#343945",
        },
        fg: {
          DEFAULT: "#E8EAED", // primary text
          muted: "#9BA1AC", // secondary text (slate)
          faint: "#5D636E", // metadata / labels
        },
        accent: {
          DEFAULT: "#FFB300", // signal amber
          dim: "#B37E00",
          alt: "#2BD576", // electric green candidate (unused unless swapped)
        },
        // P&L semantics — only ever used inside data readouts
        gain: "#3DD68C",
        loss: "#E5484D",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // K95-scale display sizes (clamped fluid)
        "display-xl": [
          "clamp(2.75rem, 9vw, 8.5rem)",
          { lineHeight: "0.95", letterSpacing: "-0.03em" },
        ],
        "display-lg": [
          "clamp(2.25rem, 6vw, 5.5rem)",
          { lineHeight: "1", letterSpacing: "-0.025em" },
        ],
        "display-md": [
          "clamp(1.75rem, 4vw, 3.5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.02em" },
        ],
        micro: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.12em" }],
      },
      maxWidth: {
        site: "90rem",
      },
      transitionTimingFunction: {
        terminal: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
