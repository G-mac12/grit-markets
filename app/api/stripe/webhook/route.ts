import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, tierForPriceId } from "@/lib/stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminConfigured } from "@/lib/env";
import { generateLicenseKey, maxAccountsForTier } from "@/lib/license";
import {
  sendCanceled,
  sendPaymentFailed,
  sendWelcomeWithLicense,
} from "@/lib/email";

/**
 * Stripe webhooks drive ALL subscription/license state. Idempotent via the
 * stripe_events table (processed event ids). Signature-verified.
 *
 * Configure the endpoint in Stripe for:
 *   checkout.session.completed, invoice.payment_failed,
 *   customer.subscription.updated, customer.subscription.deleted
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!adminConfigured() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // idempotency: claim the event id; a duplicate insert means already handled
  const { error: claimError } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (claimError) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      if (!userId || !subscriptionId) break;

      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const item = sub.items.data[0];
      const priceId = item?.price.id ?? "";
      const tier = tierForPriceId(priceId) ?? "standard";
      const periodEnd = item?.current_period_end;

      const { data: subRow } = await admin
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            tier,
            status: sub.status === "trialing" ? "trialing" : "active",
            current_period_end: periodEnd
              ? new Date(periodEnd * 1000).toISOString()
              : null,
          },
          { onConflict: "stripe_subscription_id" }
        )
        .select("id")
        .single();
      if (!subRow) break;

      // one license per subscription; generate + email on first fulfilment
      const { data: existing } = await admin
        .from("licenses")
        .select("id")
        .eq("subscription_id", subRow.id)
        .maybeSingle();
      if (!existing) {
        const licenseKey = generateLicenseKey();
        await admin.from("licenses").insert({
          user_id: userId,
          subscription_id: subRow.id,
          license_key: licenseKey,
          status: "active",
          max_accounts: maxAccountsForTier(tier),
        });
        const email =
          session.customer_details?.email ?? session.customer_email;
        if (email) await sendWelcomeWithLicense(email, licenseKey, tier);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subscriptionId =
        typeof subRef === "string" ? subRef : (subRef?.id ?? null);
      if (!subscriptionId) break;
      await admin
        .from("subscriptions")
        .update({
          status: "past_due",
          past_due_since: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId);
      const email = invoice.customer_email;
      if (email) await sendPaymentFailed(email);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const status =
        sub.status === "trialing"
          ? "trialing"
          : sub.status === "past_due" || sub.status === "unpaid"
            ? "past_due"
            : sub.status === "canceled"
              ? "canceled"
              : "active";
      const itemPeriodEnd = sub.items.data[0]?.current_period_end;
      await admin
        .from("subscriptions")
        .update({
          status,
          current_period_end: itemPeriodEnd
            ? new Date(itemPeriodEnd * 1000).toISOString()
            : null,
          ...(status === "active" || status === "trialing"
            ? { past_due_since: null }
            : {}),
        })
        .eq("stripe_subscription_id", sub.id);

      // recovery from past_due reactivates a suspended license
      if (status === "active" || status === "trialing") {
        const { data: subRow } = await admin
          .from("subscriptions")
          .select("id")
          .eq("stripe_subscription_id", sub.id)
          .maybeSingle();
        if (subRow) {
          await admin
            .from("licenses")
            .update({ status: "active" })
            .eq("subscription_id", subRow.id)
            .eq("status", "suspended");
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: subRow } = await admin
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", sub.id)
        .select("id, user_id")
        .maybeSingle();
      if (subRow) {
        await admin
          .from("licenses")
          .update({ status: "revoked" })
          .eq("subscription_id", subRow.id);
        const { data: profile } = await admin
          .from("profiles")
          .select("email")
          .eq("id", subRow.user_id)
          .maybeSingle();
        if (profile?.email) await sendCanceled(profile.email);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
