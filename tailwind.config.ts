import type { Config } from "tailwindcss";

/**
 * Grit Markets — "Broadsheet Terminal" design tokens (v2).
 *
 * Deliberate departure from the dark graphite/amber system (too close to
 * gritagility.com): warm paper ground, near-black ink, serif display type,
 * single cobalt accent. Product UI artifacts (dashboard preview, lifecycle
 * panels) remain dark "terminal windows" via the `term` scale — the page is
 * editorial, the product is a screen.
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
        // Editorial page ground
        paper: {
          DEFAULT: "#F4F1EA", // page background — warm bone
          dark: "#ECE7DC", // alt section background
          card: "#FBFAF7", // raised card
        },
        ink: {
          DEFAULT: "#161513", // primary text / dark blocks (footer)
          soft: "#232019",
        },
        fg: {
          DEFAULT: "#161513", // primary text
          muted: "#57524A", // secondary text — warm grey
          faint: "#8F897C", // metadata / labels
        },
        line: {
          DEFAULT: "#D9D3C6", // hairline rules on paper
          strong: "#B4AC9B",
        },
        accent: {
          DEFAULT: "#1D35E0", // cobalt — light surfaces
          bright: "#5E71FF", // cobalt lifted for dark terminal surfaces
        },
        // Dark terminal surfaces (product UI artifacts only)
        term: {
          bg: "#0C0D10",
          panel: "#13151A",
          line: "#262932",
          fg: "#E6E8EC",
          muted: "#9BA1AC",
          faint: "#5D636E",
        },
        // P&L semantics — light-surface and dark-surface variants
        gain: { DEFAULT: "#0E7A4A", bright: "#3DD68C" },
        loss: { DEFAULT: "#C0332B", bright: "#F0564F" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // K95-scale display sizes (clamped fluid)
        "display-xl": [
          "clamp(2.75rem, 9vw, 8.5rem)",
          { lineHeight: "0.98", letterSpacing: "-0.015em" },
        ],
        "display-lg": [
          "clamp(2.25rem, 6vw, 5.5rem)",
          { lineHeight: "1.02", letterSpacing: "-0.01em" },
        ],
        "display-md": [
          "clamp(1.75rem, 4vw, 3.5rem)",
          { lineHeight: "1.08", letterSpacing: "-0.005em" },
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
