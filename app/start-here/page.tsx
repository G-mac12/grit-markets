import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, itemListJsonLd } from "@/lib/jsonld";
import { Checklist } from "@/components/start-here/Checklist";
import { HUB_RISK_PRIMER, START_GUIDES } from "@/content/start-here";

export const metadata: Metadata = {
  title: "Start here — from zero to running an MT5 expert advisor",
  description:
    "Never traded before? A complete five-step path from opening a broker demo account to running an expert advisor on MetaTrader 5 — honestly, demo-first.",
  alternates: { canonical: "/start-here" },
};

export default function StartHerePage() {
  const totalMinutes = START_GUIDES.reduce((a, g) => a + g.timeMinutes, 0);

  return (
    <>
      <JsonLd
        data={itemListJsonLd(
          START_GUIDES.map((g) => ({
            name: g.title,
            path: `/start-here/${g.slug}`,
          }))
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Start here", path: "/start-here" },
        ])}
      />

      <section className="mx-auto max-w-site px-5 pb-24 pt-36 md:px-10">
        <p className="label-micro mb-5">The setup path</p>
        <h1 className="max-w-4xl font-display text-display-lg font-medium text-balance">
          Never traded before? <em className="italic text-accent">Start here.</em>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fg-muted">
          Five steps from nothing to an expert advisor running on MetaTrader 5
          — broker, hosting, platform, installation, first run. Complete and
          honest whether or not you ever subscribe to anything, and taught
          demo-first throughout.
        </p>
        <p className="label-micro mt-6">
          Total setup time ≈ {totalMinutes} minutes, spread over a day or two
        </p>

        {/* Risk primer FIRST — beginners are who regulators care most about */}
        <div className="mt-14 max-w-3xl border-2 border-ink bg-paper-card p-6 md:p-8">
          <p className="label-micro mb-4 text-loss">
            Before you risk anything — read this once, properly
          </p>
          <div className="space-y-4">
            {HUB_RISK_PRIMER.map((p, i) => (
              <p key={i} className="leading-relaxed text-fg">
                {p}
              </p>
            ))}
          </div>
          <p className="mt-6 border-t border-line pt-4 text-sm text-fg-muted">
            Want to see the risk before reading another word? Run the{" "}
            <Link href="/#simulator" className="text-accent underline">
              Martingale simulator
            </Link>{" "}
            — it exists for exactly this moment.
          </p>
        </div>

        {/* The five-step wizard */}
        <div className="mt-20">
          <h2 className="mb-8 font-display text-display-md font-medium">
            The path.
          </h2>
          <Checklist
            items={START_GUIDES.map((g) => ({
              step: g.step,
              slug: g.slug,
              navLabel: g.navLabel,
              title: g.title,
              timeMinutes: g.timeMinutes,
            }))}
          />
        </div>

        <div className="mt-16 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
          <p className="text-sm text-fg-muted">
            Questions first?{" "}
            <Link href="/faq" className="text-accent underline">
              Read the FAQ
            </Link>
          </p>
          <p className="text-sm text-fg-muted">
            Already set up?{" "}
            <Link href="/pricing" className="text-accent underline">
              See pricing
            </Link>
          </p>
          <p className="text-sm text-fg-muted">
            Deeper reference material lives in{" "}
            <Link href="/docs" className="text-accent underline">
              docs
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
