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

// Real engine geometry: ×1.21 per leg from a 0.01 base lot. Shown at the
// depths that matter — the historic strategy reached ~24 legs in practice.
const LEG_SAMPLE = [1, 5, 9, 13, 17, 21, 24];
const LEVELS = LEG_SAMPLE.map((leg) => {
  const lot = 0.01 * Math.pow(1.21, leg - 1);
  let cumulative = 0;
  for (let i = 0; i < leg; i++) cumulative += 0.01 * Math.pow(1.21, i);
  return { level: leg, lot, cumulative };
});

const LIFECYCLE = [
  {
    n: "01",
    title: "Scan",
    body: "The engine watches EURUSD around the clock, five days a week, entering against the recent move only when its volatility, spread and news gates all agree the tape is calm enough for mean reversion.",
  },
  {
    n: "02",
    title: "Enter at base lot",
    body: "Every sequence starts at the smallest size — the base lot you set. A winning first trade closes the sequence with a small profit, which is the most common single outcome.",
  },
  {
    n: "03",
    title: "Recover with compounding size",
    body: "If price moves 2.1 pips against the basket, the engine adds a leg \u00d71.21 the size of the last, so a reversal to a nearer price closes the whole basket 3.4 pips in profit. This is the Martingale core, and it is where the risk lives.",
  },
  {
    n: "04",
    title: "Hit a limit, take the loss",
    body: "If floating losses reach your equity stop, the engine flattens the basket, realises the loss, and refuses new baskets for the rest of the day. A bounded loss taken on purpose is the feature; unbounded averaging is the failure mode this control exists to prevent — which is why we tell you never to run live with it switched off.",
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
          Grit Markets trades EURUSD around the clock, five days a week. It
          opens a small position against the recent move (mean reversion), and
          if price keeps going the wrong way it adds a larger position every
          2.1 pips — each leg ×1.21 the last — so that a partial reversal
          closes the whole basket 3.4 pips in profit. Frequent small wins,
          occasional deep drawdowns. Hard limits decide how deep. That is the
          entire strategy — no black box.
        </p>
      </section>

      {/* The level math — honest exponential table */}
      <section className="border-y border-line bg-paper-dark py-24">
        <div className="mx-auto grid max-w-site gap-12 px-5 md:grid-cols-2 md:px-10">
          <Reveal>
            <p className="label-micro mb-4 text-accent">The sizing math</p>
            <h2 className="font-display text-display-md font-medium">
              Every leg is ×1.21 the last. Depth is what does the damage.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-fg-muted">
              A ×1.21 ladder grows gently at first — which is exactly why it
              can go deep. By leg 24 (the depth this strategy class has
              actually reached in practice) a single leg trades over 60 times
              the base size and the basket has committed more than 300 times
              the base exposure. This table is why the max-legs cap and the
              equity stop exist — and why we publish it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <table className="w-full font-mono text-sm">
              <caption className="sr-only">
                Position size per Martingale leg at base lot 0.01 and multiplier 1.21
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
                        l.level >= 17 ? "text-loss" : "text-fg-muted"
                      }`}
                    >
                      {l.cumulative.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 font-mono text-micro uppercase tracking-[0.12em] text-fg-faint">
              The engine&apos;s shipped ×1.21 geometry — multiplier and cap configurable
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
      <section className="border-y border-line bg-paper-dark py-24">
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
          Six controls stand between the ladder and your account.
        </h2>
        <div className="mt-12">
          <SpecCards />
        </div>
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-fg-faint">
          Risk controls bound losses; they do not eliminate them. Tighter caps
          mean smaller worst cases and more frequent realised losing baskets —
          and every control, including the equity stop, is yours to configure
          or disable. No configuration of Grit Markets removes the risk of
          losing capital.
        </p>
      </section>
    </>
  );
}
