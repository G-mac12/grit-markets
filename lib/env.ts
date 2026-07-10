/**
 * Feature gates for Phase 2 services. Every integration is env-var driven so
 * the site builds and runs (Phase 1 behaviour) with no secrets configured,
 * and each capability switches on when its keys arrive.
 */

export function authConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function adminConfigured(): boolean {
  return authConfigured() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function billingConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_PRICE_STANDARD &&
      process.env.STRIPE_PRICE_PRO
  );
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://gritmarkets.com";
}
