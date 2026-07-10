/**
 * [OWNER INPUT: confirm tiers and monthly amounts before launch.
 *  These are placeholder tiers so page structure, JSON-LD offers and Phase 2
 *  Stripe products can be built; every price below must be reviewed.]
 */
export interface Tier {
  id: string;
  name: string;
  pricePerMonthGBP: number;
  maxAccounts: number;
  highlights: string[];
  featured?: boolean;
}

export const TIERS: Tier[] = [
  {
    id: "standard",
    name: "Standard",
    pricePerMonthGBP: 49,
    maxAccounts: 1,
    highlights: [
      "Full Grit Markets EA, all risk controls",
      "1 live MT5 account license",
      "All updates while subscribed",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    pricePerMonthGBP: 89,
    maxAccounts: 3,
    featured: true,
    highlights: [
      "Everything in Standard",
      "Up to 3 live MT5 account licenses",
      "Self-service license rebinding",
      "Priority support",
    ],
  },
];

export const PRICING_NOTES = [
  "Monthly rolling subscription — cancel any time, effective at the end of the current billing period.",
  "The license key is bound to your MT5 account number(s); rebinding is self-service from the dashboard.",
  "Subscribing licenses software. It does not buy a trading outcome.",
];
