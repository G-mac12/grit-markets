import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { StatusPill, SessionClock } from "@/components/dashboard/DashboardPreview";
import { CHANGELOG } from "@/content/changelog";
import {
  CopyKey,
  DownloadButton,
  PortalButton,
  RebindButton,
  SignOutButton,
} from "./ui";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface LicenseRow {
  id: string;
  license_key: string;
  status: string;
  mt5_account_numbers: string[];
  max_accounts: number;
  last_validated_at: string | null;
}

interface SubscriptionRow {
  id: string;
  tier: string;
  status: string;
  current_period_end: string | null;
  stripe_customer_id: string;
}

interface InvoiceView {
  id: string;
  number: string | null;
  amount: string;
  date: string;
  url: string | null;
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export default async function AccountPage() {
  if (!authConfigured()) redirect("/login");

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const [{ data: subscription }, { data: licenses }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, tier, status, current_period_end, stripe_customer_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<SubscriptionRow>(),
    supabase
      .from("licenses")
      .select(
        "id, license_key, status, mt5_account_numbers, max_accounts, last_validated_at"
      )
      .order("created_at", { ascending: false })
      .returns<LicenseRow[]>(),
  ]);

  let invoices: InvoiceView[] = [];
  if (subscription && process.env.STRIPE_SECRET_KEY) {
    try {
      const list = await getStripe().invoices.list({
        customer: subscription.stripe_customer_id,
        limit: 6,
      });
      invoices = list.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        amount: new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: inv.currency.toUpperCase(),
        }).format((inv.amount_paid || inv.amount_due) / 100),
        date: dateFmt.format(new Date(inv.created * 1000)),
        url: inv.hosted_invoice_url ?? null,
      }));
    } catch {
      // invoices are non-critical; render the rest of the dashboard
    }
  }

  const subActive =
    subscription &&
    ["active", "trialing", "past_due"].includes(subscription.status);

  return (
    <section className="mx-auto max-w-site px-5 pb-24 pt-32 md:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-micro mb-3">Subscriber dashboard</p>
          <h1 className="font-display text-display-md font-medium">
            {user.email}
          </h1>
        </div>
        <SignOutButton />
      </div>

      <div className="term-panel scanlines mt-10 p-5 md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-term-line pb-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-term-fg">
              Grit Markets — Account
            </p>
            {subscription ? (
              <StatusPill
                label={`${subscription.tier} · ${subscription.status}`}
                tone={subscription.status === "active" ? "active" : "warn"}
              />
            ) : (
              <StatusPill label="No subscription" tone="warn" />
            )}
          </div>
          <SessionClock />
        </div>

        {/* Subscription */}
        <div className="grid gap-8 pt-6 md:grid-cols-3">
          <div>
            <p className="label-micro mb-2 text-term-faint">Subscription</p>
            {subscription ? (
              <dl className="space-y-2 font-mono text-xs text-term-muted">
                <div className="flex justify-between gap-4">
                  <dt className="uppercase tracking-[0.1em] text-term-faint">Tier</dt>
                  <dd className="text-term-fg">{subscription.tier}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="uppercase tracking-[0.1em] text-term-faint">Status</dt>
                  <dd className="text-term-fg">{subscription.status}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="uppercase tracking-[0.1em] text-term-faint">Renews</dt>
                  <dd className="text-term-fg">
                    {subscription.current_period_end
                      ? dateFmt.format(new Date(subscription.current_period_end))
                      : "—"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-term-muted">
                No subscription yet.{" "}
                <Link href="/pricing" className="text-accent-bright underline">
                  Choose a tier
                </Link>
                .
              </p>
            )}
            {subscription && (
              <div className="mt-4">
                <PortalButton />
              </div>
            )}
          </div>

          {/* Licenses */}
          <div className="md:col-span-2">
            <p className="label-micro mb-2 text-term-faint">License</p>
            {licenses && licenses.length > 0 ? (
              <ul className="space-y-5">
                {licenses.map((lic) => (
                  <li key={lic.id} className="border border-term-line p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <CopyKey licenseKey={lic.license_key} />
                      <StatusPill
                        label={lic.status}
                        tone={lic.status === "active" ? "active" : "warn"}
                      />
                    </div>
                    <div className="mt-4 font-mono text-xs text-term-muted">
                      <p className="label-micro mb-1 text-term-faint">
                        Bound MT5 accounts ({lic.mt5_account_numbers.length}/
                        {lic.max_accounts})
                      </p>
                      {lic.mt5_account_numbers.length > 0 ? (
                        <ul className="space-y-1">
                          {lic.mt5_account_numbers.map((acc) => (
                            <li
                              key={acc}
                              className="flex items-center justify-between gap-4"
                            >
                              <span className="text-term-fg">{acc}</span>
                              <RebindButton licenseId={lic.id} account={acc} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>
                          None yet — the license binds to your MT5 account the
                          first time the EA validates.
                        </p>
                      )}
                      <p className="mt-3 text-term-faint">
                        Last validated:{" "}
                        {lic.last_validated_at
                          ? dateFmt.format(new Date(lic.last_validated_at))
                          : "never"}{" "}
                        · Self-service rebinds limited to 2 per 30 days.
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-term-muted">
                Your license key is generated automatically when checkout
                completes.
              </p>
            )}
          </div>
        </div>

        {/* Downloads */}
        <div className="mt-8 border-t border-term-line pt-6">
          <p className="label-micro mb-3 text-term-faint">EA downloads</p>
          {subActive ? (
            <ul className="space-y-3">
              {CHANGELOG.slice(0, 2).map((entry) => (
                <li
                  key={entry.version}
                  className="flex flex-wrap items-center gap-4 font-mono text-xs text-term-muted"
                >
                  <DownloadButton version={entry.version} />
                  <span>{entry.date}</span>
                  <Link
                    href="/changelog"
                    className="text-term-faint underline-offset-4 hover:text-accent-bright hover:underline"
                  >
                    changelog
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-term-muted">
              Downloads unlock with an active subscription.
            </p>
          )}
        </div>

        {/* Invoices */}
        <div className="mt-8 border-t border-term-line pt-6">
          <p className="label-micro mb-3 text-term-faint">Invoices</p>
          {invoices.length > 0 ? (
            <table className="w-full max-w-xl font-mono text-xs">
              <thead>
                <tr className="border-b border-term-line text-left text-term-faint">
                  <th className="py-2 pr-4 font-normal uppercase tracking-[0.1em]">Number</th>
                  <th className="py-2 pr-4 font-normal uppercase tracking-[0.1em]">Date</th>
                  <th className="py-2 pr-4 text-right font-normal uppercase tracking-[0.1em]">Amount</th>
                  <th className="py-2 font-normal uppercase tracking-[0.1em]"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-term-line/40 text-term-muted">
                    <td className="py-2 pr-4 text-term-fg">{inv.number ?? inv.id}</td>
                    <td className="py-2 pr-4">{inv.date}</td>
                    <td className="py-2 pr-4 text-right">{inv.amount}</td>
                    <td className="py-2 text-right">
                      {inv.url && (
                        <a
                          href={inv.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent-bright underline-offset-4 hover:underline"
                        >
                          view
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-term-muted">No invoices yet.</p>
          )}
        </div>
      </div>

      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-fg-faint">
        Need help? Installation guides live in{" "}
        <Link href="/docs" className="text-accent underline">
          docs
        </Link>
        , including MT5&apos;s WebRequest whitelist step. Remember: no
        configuration removes Martingale risk entirely.
      </p>
    </section>
  );
}
