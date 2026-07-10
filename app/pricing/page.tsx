import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { PRICING_NOTES, TIERS } from "@/content/pricing";
import { RISK_WARNING, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing — monthly MT5 EA subscription",
  description:
    "Grit Markets subscription pricing: monthly rolling license for the MT5 expert advisor, cancel any time. No lifetime deals, no performance fees.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Pricing", path: "/pricing" },
        ])}
      />

      <section className="mx-auto max-w-site px-5 pb-24 pt-36 md:px-10">
        <p className="label-micro mb-5">Pricing</p>
        <h1 className="max-w-4xl font-display text-display-lg font-medium">
          License the engine. Keep your capital decisions.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fg-muted">
          Grit Markets is licensed as a monthly rolling subscription. You are
          paying for software and updates — not for a trading outcome, which
          nobody can sell you.
        </p>

        {/* [OWNER INPUT: confirm tiers & prices — placeholders below] */}
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:max-w-4xl">
          {TIERS.map((tier) => (
            <article
              key={tier.id}
              className={`panel flex flex-col p-7 ${
                tier.featured ? "border-accent/60" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-medium">{tier.name}</h2>
                {tier.featured && (
                  <span className="border border-accent/50 px-2 py-1 font-mono text-micro uppercase tracking-[0.12em] text-accent">
                    Most chosen
                  </span>
                )}
              </div>
              <p className="mt-5 font-mono text-4xl text-fg">
                £{tier.pricePerMonthGBP}
                <span className="text-base text-fg-faint"> /month</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-line pt-6">
                {tier.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sm text-fg-muted">
                    <span className="text-accent" aria-hidden="true">
                      —
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${SITE.supportEmail}?subject=Grit Markets ${tier.name} — early access`}
                className={`${tier.featured ? "btn-primary" : "btn-ghost"} mt-8 justify-center`}
              >
                Request early access
              </a>
            </article>
          ))}
        </div>
        <p className="mt-6 font-mono text-micro uppercase tracking-[0.14em] text-fg-faint lg:max-w-4xl">
          Online checkout and instant licensing launch with the customer
          dashboard. Early access is handled by email until then.
        </p>

        <ul className="mt-14 max-w-2xl space-y-3">
          {PRICING_NOTES.map((n) => (
            <li key={n} className="flex gap-3 text-sm leading-relaxed text-fg-muted">
              <span className="text-fg-faint" aria-hidden="true">
                §
              </span>
              {n}
            </li>
          ))}
        </ul>

        <div className="mt-14 max-w-2xl panel p-5">
          <p className="label-micro mb-2 text-accent">Before you subscribe</p>
          <p className="text-sm leading-relaxed text-fg-muted">
            {RISK_WARNING} Try the{" "}
            <Link href="/#simulator" className="text-accent underline">
              Martingale simulator
            </Link>{" "}
            first — it exists so you can see the drawdown profile before
            spending a pound.
          </p>
        </div>
      </section>
    </>
  );
}
