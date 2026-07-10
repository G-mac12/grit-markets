/**
 * EA risk-control spec cards.
 * [OWNER INPUT: confirm the actual EA feature list before launch — these
 * four are the working set from the build brief.]
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
    status: "ARMED",
    readout: [
      { label: "trigger", value: "account equity %" },
      { label: "action", value: "flatten all + halt" },
      { label: "default", value: "−8.0%" },
    ],
    description:
      "An account-level circuit breaker. If floating losses reach your configured equity threshold, the engine closes the whole sequence and stops trading — it will not average down into a margin call.",
  },
  {
    id: "max-level",
    name: "Max-level cap",
    status: "ENFORCED",
    readout: [
      { label: "range", value: "2 – 10 levels" },
      { label: "sizing", value: "geometric per level" },
      { label: "default", value: "6" },
    ],
    description:
      "A hard ceiling on how many recovery steps the Martingale sequence may take. Lower caps mean smaller worst-case losses and more frequent realised losing sequences — that trade-off is yours to set.",
  },
  {
    id: "news-filter",
    name: "News filter",
    status: "WATCHING",
    readout: [
      { label: "source", value: "economic calendar" },
      { label: "action", value: "no new sequences" },
      { label: "window", value: "configurable" },
    ],
    description:
      "High-impact releases produce the gaps and spread spikes that hurt averaging strategies most. The filter blocks new sequences around scheduled events you select.",
  },
  {
    id: "session-filter",
    name: "Session filter",
    status: "SCHEDULED",
    readout: [
      { label: "windows", value: "per-day trading hours" },
      { label: "timezone", value: "server time" },
      { label: "action", value: "scan only in-window" },
    ],
    description:
      "Restricts the engine to the market hours you choose, so sequences are not opened into thin, erratic liquidity outside your intended session.",
  },
];
