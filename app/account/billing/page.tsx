import Link from "next/link";
import { getDashboardContext } from "@/lib/account-data";
import { StatusPill } from "@/components/dashboard/DashboardPreview";
import { TIERS } from "@/content/pricing";
import { PortalButton } from "../ui";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export default async function BillingPage() {
  const { supabase } = await getDashboardContext();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, status, current_period_end")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const tier = TIERS.find((t) => t.id === sub?.tier);

  return (
    <section>
      <h1 className="font-display text-display-md font-medium">Billing.</h1>
      <div className="term-panel mt-8 max-w-2xl p-5 md:p-6">
        {sub ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-sm text-term-fg">
                {tier?.name ?? sub.tier} · £{tier?.pricePerMonthGBP ?? "—"}/month
              </p>
              <StatusPill
                label={sub.status}
                tone={sub.status === "active" ? "active" : "warn"}
              />
            </div>
            <p className="mt-3 font-mono text-xs text-term-muted">
              Renews:{" "}
              {sub.current_period_end
                ? dateFmt.format(new Date(sub.current_period_end))
                : "—"}
            </p>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-term-muted">
              Cards, cancellation and billing address are managed in the
              Stripe Customer Portal — card data never touches this platform.
            </p>
            <div className="mt-4">
              <PortalButton />
            </div>
          </>
        ) : (
          <p className="text-sm text-term-muted">
            No subscription yet.{" "}
            <Link href="/pricing" className="text-accent-bright underline">
              Choose a tier
            </Link>
            .
          </p>
        )}
      </div>
      <p className="mt-4 font-mono text-micro uppercase tracking-[0.1em] text-fg-faint">
        Invoice history lives in Costs &amp; ROI.
      </p>
    </section>
  );
}
