import { NextRequest, NextResponse } from "next/server";
import { adminConfigured } from "@/lib/env";
import { cronAuthorized } from "@/lib/cron";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

/**
 * Daily: purge accounts whose 14-day deletion grace period has expired.
 * Cancels any live Stripe subscription, then deletes the auth user —
 * profiles and all dependent rows cascade. UK GDPR: purge completes well
 * inside the 30-day commitment.
 */
export const dynamic = "force-dynamic";

const GRACE_DAYS = 14;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const admin = createSupabaseAdminClient();

  const cutoff = new Date(
    Date.now() - GRACE_DAYS * 24 * 3600_000
  ).toISOString();
  const { data: expired } = await admin
    .from("profiles")
    .select("id")
    .not("deletion_requested_at", "is", null)
    .lt("deletion_requested_at", cutoff)
    .limit(50);

  let purged = 0;
  for (const profile of expired ?? []) {
    if (process.env.STRIPE_SECRET_KEY) {
      const { data: subs } = await admin
        .from("subscriptions")
        .select("stripe_subscription_id, status")
        .eq("user_id", profile.id)
        .neq("status", "canceled");
      for (const sub of subs ?? []) {
        try {
          await getStripe().subscriptions.cancel(sub.stripe_subscription_id);
        } catch {
          // already canceled or gone — deletion proceeds regardless
        }
      }
    }
    const { error } = await admin.auth.admin.deleteUser(profile.id);
    if (!error) purged++;
  }

  return NextResponse.json({ ok: true, purged });
}
