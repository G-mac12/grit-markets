import Link from "next/link";
import { HeroSection } from "@/components/hero/HeroSection";
import { StickySequence } from "@/components/sticky/StickySequence";
import { DashboardPreview } from "@/components/dashboard/DashboardPreview";
import { Simulator } from "@/components/simulator/Simulator";
import { SpecCards } from "@/components/SpecCards";
import { FAQ } from "@/content/faq";
import { TIERS } from "@/content/pricing";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <StickySequence />

      {/* Dashboard showcase — OnlyGenius "product as dashboard" pattern */}
      <section className="mx-auto max-w-site px-5 py-24 md:px-10 md:py-32">
        <p className="label-micro mb-4">The subscriber dashboard</p>
        <h2 className="max-w-3xl font-display text-display-md font-medium">
          Your account, your license, your engine — one terminal.
        </h2>
        <p className="mt-5 max-w-xl leading-relaxed text-fg-muted">
          Every subscription includes the Grit Markets dashboard: license
          management, EA downloads, and account state at a glance. This is the
          real interface, running on simulated data.
        </p>
        <div className="mt-12">
          <DashboardPreview />
        </div>
      </section>

      {/* Martingale simulator — the honesty centrepiece */}
      <section
        id="simulator"
        className="border-y border-line bg-paper-dark py-24 md:py-32"
      >
        <div className="mx-auto max-w-site px-5 md:px-10">
          <p className="label-micro mb-4 text-accent">Stress-test before you subscribe</p>
          <h2 className="max-w-3xl font-display text-display-md font-medium">
            See exactly how the engine sizes positions — including the risk.
          </h2>
          <p className="mt-5 max-w-xl leading-relaxed text-fg-muted">
            Martingale sizing produces long runs of small wins punctuated by
            deep drawdowns. We would rather you see that here, on a Monte
            Carlo, than discover it on a live account. Move the sliders; the
            bad decile is part of the product page on purpose.
          </p>
          <div className="mt-12">
            <Simulator />
          </div>
        </div>
      </section>

      {/* Risk-control spec cards */}
      <section className="mx-auto max-w-site px-5 py-24 md:px-10 md:py-32">
        <p className="label-micro mb-4">Risk controls</p>
        <h2 className="max-w-3xl font-display text-display-md font-medium">
          The strategy compounds. The limits are hard.
        </h2>
        <p className="mt-5 max-w-xl leading-relaxed text-fg-muted">
          Every control ships enabled by default. They bound the damage a
          recovery sequence can do — no setting removes Martingale risk
          entirely, and we will not tell you otherwise.
        </p>
        <div className="mt-12">
          <SpecCards />
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-y border-line bg-paper-dark py-24 md:py-32">
        <div className="mx-auto max-w-site px-5 md:px-10">
          <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <div>
              <p className="label-micro mb-4">Licensing</p>
              <h2 className="max-w-2xl font-display text-display-md font-medium">
                One engine. Monthly license. Cancel any time.
              </h2>
              <p className="mt-5 max-w-xl leading-relaxed text-fg-muted">
                From £{Math.min(...TIERS.map((t) => t.pricePerMonthGBP))}/month.
                No lifetime-deal lock-in, no performance fees — you are
                licensing software, not buying a promise.
              </p>
            </div>
            <Link href="/pricing" className="btn-primary shrink-0">
              View pricing
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="mx-auto max-w-site px-5 py-24 md:px-10 md:py-32">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="label-micro mb-4">Straight answers</p>
            <h2 className="font-display text-display-md font-medium">
              Asked before you did.
            </h2>
            <Link href="/faq" className="btn-ghost mt-8">
              All questions
            </Link>
          </div>
          <dl className="space-y-8">
            {FAQ.slice(0, 4).map((f) => (
              <div key={f.slug} className="border-b border-line pb-8 last:border-0">
                <dt className="font-display text-lg font-medium">
                  <Link
                    href={`/faq#${f.slug}`}
                    className="transition-colors hover:text-accent"
                  >
                    {f.question}
                  </Link>
                </dt>
                <dd className="mt-3 max-w-2xl leading-relaxed text-fg-muted">
                  {f.answerShort}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
