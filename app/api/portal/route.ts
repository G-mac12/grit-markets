import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authConfigured, siteUrl } from "@/lib/env";

/** Deep link into the Stripe Customer Portal for card management/cancellation. */
export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  if (!authConfigured() || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!sub) {
    return NextResponse.json({ error: "no_subscription" }, { status: 404 });
  }

  const session = await getStripe().billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${siteUrl()}/account`,
  });

  return NextResponse.json({ url: session.url });
}
