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
    status: "CONFIGURABLE",
    readout: [
      { label: "trigger", value: "floating loss % of balance" },
      { label: "action", value: "flatten basket + halt" },
      { label: "scope", value: "account-wide" },
    ],
    description:
      "The master safety net: if floating losses reach your configured percentage of balance, the engine closes the entire basket and stops for the day. It is switchable — and we say plainly that running with it off is how classic Martingale accounts die. Turn it on before trading real money.",
  },
  {
    id: "max-legs",
    name: "Max-legs cap",
    status: "CONFIGURABLE",
    readout: [
      { label: "range", value: "1 – 210 legs" },
      { label: "sizing", value: "×1.21 geometric per leg" },
      { label: "uncapped", value: "possible — disclosed" },
    ],
    description:
      "A hard ceiling on how deep one basket may stack. The ladder grows geometrically, so this cap decides your worst case. Set high it is effectively uncapped — the historic behaviour of this strategy class, and exactly the trade-off we put in your hands rather than hide.",
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
