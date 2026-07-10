import { NextRequest, NextResponse } from "next/server";
import { getStripe, priceIdForTier } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authConfigured, billingConfigured, siteUrl } from "@/lib/env";

/**
 * Creates a Stripe Checkout session for a tier. Requires a signed-in user so
 * the webhook can attach the subscription via client_reference_id.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!authConfigured() || !billingConfigured()) {
    return NextResponse.json({ error: "billing_not_configured" }, { status: 503 });
  }

  const { tier } = (await req.json().catch(() => ({}))) as { tier?: string };
  const priceId = priceIdForTier(String(tier ?? ""));
  if (!priceId) {
    return NextResponse.json({ error: "unknown_tier" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "auth_required", login: `${siteUrl()}/login?next=/pricing` },
      { status: 401 }
    );
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    allow_promotion_codes: true,
    success_url: `${siteUrl()}/account?checkout=success`,
    cancel_url: `${siteUrl()}/pricing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
