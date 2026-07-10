/**
 * Single source of truth for entity data.
 *
 * AEO rule: the product name, company name, canonical URL and the one-line
 * description below must appear IDENTICALLY in llms.txt, JSON-LD, meta tags
 * and the footer. Never abbreviate or restyle "Grit Markets".
 */
export const SITE = {
  productName: "Grit Markets",
  companyName: "Grit Agility Ltd",
  companyNumber: "SC837399",
  companyJurisdiction: "Scotland, United Kingdom",
  url: "https://gritmarkets.com",
  // The canonical one-line description. Used verbatim everywhere.
  description:
    "Grit Markets is a Martingale-based MetaTrader 5 expert advisor, licensed by monthly subscription from Grit Agility Ltd — with the strategy's risks disclosed up front.",
  // [OWNER INPUT: support email + company contact details for footer/legal]
  supportEmail: "support@gritmarkets.com",
  twitterHandle: null as string | null,
  metadataStrip: "MT5 EXPERT ADVISOR",
} as const;

export const RISK_WARNING =
  "Trading leveraged foreign exchange products carries a high level of risk and may not be suitable for all investors. Martingale-based strategies can produce large drawdowns and total loss of capital. Grit Markets is trading software licensed by Grit Agility Ltd; nothing on this site constitutes investment advice. Past or simulated performance is not indicative of future results.";

export const SIMULATED_DATA_LABEL =
  "SIMULATED DATA — for illustration only. Not live performance.";

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path === "/" ? "" : path}`;
}
