import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (!cached) {
    cached = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return cached;
}

/** Maps our tier ids to Stripe Price ids (set in Vercel env). */
export function priceIdForTier(tier: string): string | null {
  if (tier === "standard") return process.env.STRIPE_PRICE_STANDARD ?? null;
  if (tier === "pro") return process.env.STRIPE_PRICE_PRO ?? null;
  return null;
}

export function tierForPriceId(priceId: string): "standard" | "pro" | null {
  if (priceId === process.env.STRIPE_PRICE_STANDARD) return "standard";
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  return null;
}
