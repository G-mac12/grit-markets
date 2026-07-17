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
    name: "News filter",
    status: "TIERED",
    readout: [
      { label: "watches", value: "USD · EUR · CAD" },
      { label: "pauses", value: "10m before events" },
      { label: "after", value: "45–90m by impact tier" },
    ],
    description:
      "Rate decisions and NFP get the longest post-event pause, CPI and GDP a shorter one, other high-impact releases the base tier. Blocks both new baskets and adding legs to an open one. An optional stricter mode blocks the whole day ahead of major events.",
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
];
