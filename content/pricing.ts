/**
 * Confirmed launch pricing (owner sign-off 2026-07-30): Standard £29,
 * Premium £49, first month free for everyone — demo or live — then billed
 * monthly. Every safety feature ships in every tier: risk controls, the
 * no-trade calendar, alerts and the always-armed equity stop are never
 * paywalled. Premium adds capacity, analytics depth and priority support.
 */
export interface Tier {
  id: string;
  name: string;
  pricePerMonthGBP: number;
  maxAccounts: number;
  highlights: string[];
  featured?: boolean;
}

export const FIRST_MONTH_FREE = true;

export const TIERS: Tier[] = [
  {
    id: "standard",
    name: "Standard",
    pricePerMonthGBP: 29,
    maxAccounts: 1,
    highlights: [
      "Full Grit Markets EA — every risk control, nothing held back",
      "1 MT5 account license (demo or live)",
      "Maintained no-trade calendar, delivered automatically",
      "Live dashboard, alerts and daily digest",
      "Safety Buffer with one skim rule",
      "All updates while subscribed · email support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    pricePerMonthGBP: 49,
    maxAccounts: 3,
    featured: true,
    highlights: [
      "Everything in Standard — same EA, same protections",
      "Up to 3 MT5 account licenses (demo or live)",
      "Advanced analytics: ladder-depth histogram, Costs & True ROI",
      "Full Safety Buffer automation — unlimited skim rules",
      "Priority support (next business day)",
      "Early access to new platform features",
    ],
  },
];

export const PRICING_NOTES = [
  "First month free on every plan, demo or live account — billing starts from month two, and you can cancel before it ever does.",
  "Monthly rolling subscription — cancel any time, effective at the end of the current billing period.",
  "The license key is bound to your MT5 account number(s); rebinding is self-service from the dashboard.",
  "Every safety feature is in every tier. We do not sell risk management as an upgrade.",
  "Subscribing licenses software. It does not buy a trading outcome.",
];
