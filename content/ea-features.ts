/**
 * EA risk-control spec cards — matched to the real GritAgilityMartingale
 * EA (EURUSD M1, 24/5 mean-reversion scalper with a geometric lot ladder).
 * Source of truth: the EA's input groups and settings guide.
 */
export interface SpecCard {
  id: string;
  name: string;
  status: string;
  readout: { label: string; value: string }[];
  description: string;
}

export const SPEC_CARDS: SpecCard[] = [
  {
    id: "equity-stop",
    name: "Equity stop",
    status: "ALWAYS ARMED",
    readout: [
      { label: "trigger", value: "floating loss % of balance" },
      { label: "action", value: "flatten basket + halt" },
      { label: "scope", value: "every risk profile" },
    ],
    description:
      "The master safety net: if floating losses reach your profile's percentage of balance, the engine closes the entire basket and stops for the day. Running a Martingale without a stop is how classic Martingale accounts die — so every Grit Markets risk profile keeps it armed. The percentage varies by profile; the stop itself is not optional.",
  },
  {
    id: "max-legs",
    name: "Max-legs cap",
    status: "PROFILE-SET",
    readout: [
      { label: "ladder", value: "capped in every profile" },
      { label: "sizing", value: "×1.21 geometric per leg" },
      { label: "uncapped", value: "not offered" },
    ],
    description:
      "A hard ceiling on how deep one basket may stack. The ladder grows geometrically, so this cap decides your worst case. The uncapped ladder is the historic behaviour of this strategy class — we say so plainly, and no Grit Markets profile ships it. Your profile choice moves the cap between shallower and deeper, never to unlimited.",
  },
  {
    id: "daily-stop-limit",
    name: "Daily loss limit",
    status: "ENFORCED",
    readout: [
      { label: "counts", value: "equity-stop events / day" },
      { label: "action", value: "no new baskets today" },
      { label: "survives", value: "VPS restarts" },
    ],
    description:
      "After a stop-out, the engine refuses to open new baskets for the rest of the day. One bad regime day cannot compound into three.",
  },
  {
    id: "news-filter",
    name: "Event filter",
    status: "KEYWORD-TIERED",
    readout: [
      { label: "watches", value: "USD · EUR calendar" },
      { label: "tier 1", value: "24h before → 2h after" },
      { label: "tiers 2–3", value: "60/30m before → 90/60m after" },
    ],
    description:
      "Events are classified by what they are, not by the calendar's star rating — because those ratings misrank the events that matter (a Fed statement can carry a lower rating than an oil-inventory print). Rate decisions, NFP and central-bank pressers get the widest window; CPI and GDP the next; other high-impact releases the base tier, with the calendar's own rating as the fallback so nothing slips through unclassified. Blocks new baskets and new legs, never the management of open positions.",
  },
  {
    id: "volatility-gates",
    name: "Volatility gates",
    status: "WATCHING",
    readout: [
      { label: "hourly ATR cap", value: "skip wild markets" },
      { label: "daily range gate", value: "skip after big days" },
      { label: "spread cap", value: "skip wide spreads" },
    ],
    description:
      "Mean-reversion grids do their worst in fast, trending tape. The engine measures hourly volatility, yesterday's range versus the 5-day norm, and the live spread — and simply declines to start baskets when the tape is hostile.",
  },
  {
    id: "calendar-protection",
    name: "Calendar protection",
    status: "SCHEDULED",
    readout: [
      { label: "friday", value: "cutoff before weekend" },
      { label: "monday", value: "90-min warm-up" },
      { label: "rollover", value: "midnight blackout" },
    ],
    description:
      "No new baskets into the weekend close (gap risk), none in the choppy first minutes of the weekly reopen, and none during the broker's midnight rollover spread-spike. Holiday markets (24 Dec – 2 Jan) are blocked outright.",
  },
  {
    id: "no-trade-calendar",
    name: "No-trade calendar",
    status: "MAINTAINED",
    readout: [
      { label: "built from", value: "16.5-yr stop-out study" },
      { label: "encodes", value: "131 dates · 12 windows · 22 wks" },
      { label: "updates", value: "delivered automatically" },
    ],
    description:
      "We studied 16.5 years of this strategy class's failures — 1,372 stop-out events across 3,037 test windows — and encoded the historically dangerous calendar dates, weekday windows and weeks of the year as tiers the engine enforces. The calendar is maintained centrally and every licensed EA receives updates automatically. It removes historically hostile periods; it does not remove risk, and no study of the past binds the future.",
  },
];
