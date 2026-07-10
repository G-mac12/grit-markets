import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { SpecCards } from "@/components/SpecCards";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "How it works — an honest Martingale explanation",
  description:
    "How the Grit Markets MT5 expert advisor works: compounding Martingale position sizing, the exact level math, and the hard risk controls that bound it.",
  alternates: { canonical: "/how-it-works" },
};

const LEVELS = Array.from({ length: 7 }, (_, i) => {
  const lot = 0.01 * 2 ** i;
  const cumulative = 0.01 * (2 ** (i + 1) - 1);
  return { level: i + 1, lot, cumulative };
});

const LIFECYCLE = [
  {
    n: "01",
    title: "Scan",
    body: "Within your configured session windows, the engine scans its market for a qualifying entry. Outside a window, or around filtered news events, it does nothing.",
  },
  {
    n: "02",
    title: "Enter at base lot",
    body: "Every sequence starts at the smallest size — the base lot you set. A winning first trade closes the sequence with a small profit, which is the most common single outcome.",
  },
  {
    n: "03",
    title: "Recover with compounding size",
    body: "If price moves against the position by the step distance, the engine adds a larger position — multiplied at each level — so a reversal to a nearer price closes the whole set profitably. This is the Martingale core, and it is where the risk lives.",
  },
  {
    n: "04",
    title: "Hit a limit, take the loss",
    body: "If the sequence reaches your max-level cap or floating losses reach your equity stop, the engine flattens everything and realises the loss. A bounded loss taken on purpose is the feature; unbounded averaging is the failure mode we refuse.",
  },
];

const FAILURE_MODES = [
  {
    title: "The long adverse run",
    body: "A strong trend without meaningful pullbacks can walk a sequence straight to its maximum level. When that happens the realised loss is many times larger than the wins that preceded it. The simulator on the home page shows how often this occurs at your settings.",
  },
  {
    title: "Gap risk",
    body: "Weekend gaps and news spikes can jump past step prices and stop levels. The news filter reduces exposure to scheduled events; it cannot remove gap risk entirely.",
  },
  {
    title: "Margin exhaustion",
    body: "Deep sequences demand margin exactly when floating losses are largest. Undersized accounts get margin-called before the sequence can resolve — which is why the max-level cap and equity stop exist, and why base-lot sizing matters more than any other setting.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "How it works", path: "/how-it-works" },
        ])}
      />

      <section className="mx-auto max-w-site px-5 pb-20 pt-36 md:px-10">
        <p className="label-micro mb-5">How it works</p>
        <h1 className="max-w-4xl font-display text-display-lg font-medium text-balance">
          Martingale, explained the way we&apos;d want it explained to us.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fg-muted">
          Grit Markets opens a small position, and if the market moves against
          it, adds progressively larger positions so that a partial reversal
          closes the whole set in profit. That produces frequent small wins and
          occasional deep drawdowns. Hard limits decide how deep. That is the
          entire strategy — no black box.
        </p>
      </section>

      {/* The level math — honest exponential table */}
      <section className="border-y border-line bg-ink-850 py-24">
        <div className="mx-auto grid max-w-site gap-12 px-5 md:grid-cols-2 md:px-10">
          <Reveal>
            <p className="label-micro mb-4 text-accent">The sizing math</p>
            <h2 className="font-display text-display-md font-medium">
              Each level doubles. So does the damage a bust does.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-fg-muted">
              With a 0.01 base lot and a ×2 multiplier, level seven trades 64
              times the base size, and the whole sequence has committed 127
              times the base exposure. This table is the reason the max-level
              cap exists — and the reason we publish it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <table className="w-full font-mono text-sm">
              <caption className="sr-only">
                Position size per Martingale level at base lot 0.01 and multiplier 2
              </caption>
              <thead>
                <tr className="border-b border-line text-left text-fg-faint">
                  <th className="py-2 font-normal uppercase tracking-[0.1em]">Level</th>
                  <th className="py-2 text-right font-normal uppercase tracking-[0.1em]">Lot</th>
                  <th className="py-2 text-right font-normal uppercase tracking-[0.1em]">
                    Cumulative lots
                  </th>
                </tr>
              </thead>
              <tbody>
                {LEVELS.map((l) => (
                  <tr key={l.level} className="border-b border-line/40">
                    <td className="py-2 text-fg">{l.level}</td>
                    <td className="py-2 text-right text-fg">{l.lot.toFixed(2)}</td>
                    <td
                      className={`py-2 text-right ${
                        l.level >= 6 ? "text-loss" : "text-fg-muted"
                      }`}
                    >
                      {l.cumulative.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 font-mono text-micro uppercase tracking-[0.12em] text-fg-faint">
              Illustration at multiplier ×2 — configurable in the EA
            </p>
          </Reveal>
        </div>
      </section>

      {/* Lifecycle */}
      <section className="mx-auto max-w-site px-5 py-24 md:px-10">
        <p className="label-micro mb-4">The lifecycle</p>
        <h2 className="max-w-3xl font-display text-display-md font-medium">
          Four states. Nothing hidden between them.
        </h2>
        <ol className="mt-14 grid gap-4 md:grid-cols-2">
          {LIFECYCLE.map((step, i) => (
            <li key={step.n}>
              <Reveal delay={i * 0.06} x={i % 2 === 0 ? -20 : 20} y={0}>
                <article className="panel h-full p-6">
                  <p className="font-mono text-2xl text-accent">{step.n}</p>
                  <h3 className="mt-3 font-display text-lg font-medium">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-fg-muted">{step.body}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* What can go wrong */}
      <section className="border-y border-line bg-ink-850 py-24">
        <div className="mx-auto max-w-site px-5 md:px-10">
          <p className="label-micro mb-4 text-loss">What can go wrong</p>
          <h2 className="max-w-3xl font-display text-display-md font-medium">
            The failure modes, before you pay us — not after.
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {FAILURE_MODES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <h3 className="border-t border-loss/40 pt-4 font-display text-lg font-medium">
                  {f.title}
                </h3>
                <p className="mt-3 leading-relaxed text-fg-muted">{f.body}</p>
              </Reveal>
            ))}
          </div>
          <div className="mt-14">
            <Link href="/#simulator" className="btn-primary">
              Run the numbers yourself
            </Link>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="mx-auto max-w-site px-5 py-24 md:px-10">
        <p className="label-micro mb-4">The controls</p>
        <h2 className="max-w-3xl font-display text-display-md font-medium">
          Four hard limits stand between the ladder and your account.
        </h2>
        <div className="mt-12">
          <SpecCards />
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-fg-faint">
          Risk controls bound losses; they do not eliminate them. Tighter caps
          mean smaller worst cases and more frequent realised losing sequences.
          No configuration of Grit Markets removes the risk of losing capital.
        </p>
      </section>
    </>
  );
}
