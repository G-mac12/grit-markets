export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

/** [OWNER INPUT: confirm real EA version history] */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "2026-07-01",
    changes: [
      "Initial public release of the Grit Markets expert advisor for MetaTrader 5.",
      "Risk controls: account-level equity stop, max recovery-level cap, news filter, session filter.",
      "License validation over HTTPS against gritmarkets.com.",
    ],
  },
];
