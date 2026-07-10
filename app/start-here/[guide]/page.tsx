import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { existsSync } from "fs";
import path from "path";
import { JsonLd } from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  howToGuideJsonLd,
} from "@/lib/jsonld";
import { ScreenshotFrame } from "@/components/start-here/ScreenshotFrame";
import { GuideNav, GuideProgress } from "@/components/start-here/GuideNav";
import { START_GUIDES } from "@/content/start-here";

export function generateStaticParams() {
  return START_GUIDES.map((g) => ({ guide: g.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { guide: string };
}): Metadata {
  const guide = START_GUIDES.find((g) => g.slug === params.guide);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.metaDescription,
    alternates: { canonical: `/start-here/${guide.slug}` },
  };
}

export default function GuidePage({ params }: { params: { guide: string } }) {
  const sorted = [...START_GUIDES].sort((a, b) => a.step - b.step);
  const idx = sorted.findIndex((g) => g.slug === params.guide);
  if (idx === -1) notFound();
  const guide = sorted[idx];
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
  const isFinal = next === null;

  const imagePathFor = (file: string) => {
    const rel = `/images/start-here/${file}`;
    return existsSync(path.join(process.cwd(), "public", rel))
      ? rel
      : undefined;
  };

  return (
    <>
      <JsonLd
        data={howToGuideJsonLd({
          path: `/start-here/${guide.slug}`,
          title: guide.title,
          description: guide.metaDescription,
          totalMinutes: guide.timeMinutes,
          steps: guide.steps.map((s) => ({
            name: s.name,
            text: s.text,
            imagePath: imagePathFor(s.screenshot.file),
          })),
        })}
      />
      <JsonLd
        data={faqPageJsonLd(
          guide.problems.map((p) => ({
            question: p.question,
            answerShort: p.answer,
          }))
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Start here", path: "/start-here" },
          { name: guide.title, path: `/start-here/${guide.slug}` },
        ])}
      />

      <article className="mx-auto max-w-site px-5 pb-24 pt-32 md:px-10">
        <div className="mb-10">
          <GuideProgress current={guide.step} total={sorted.length} />
        </div>

        <p className="label-micro mb-4">
          Step {guide.step} · about {guide.timeMinutes} minutes
        </p>
        <h1 className="max-w-4xl font-display text-display-md font-medium text-balance">
          {guide.title}
        </h1>

        {/* answer-first opening */}
        <p className="mt-8 max-w-2xl border-l-2 border-accent pl-5 text-lg leading-relaxed text-fg">
          {guide.answerFirst}
        </p>
        <p className="mt-6 max-w-2xl leading-relaxed text-fg-muted">
          {guide.intro}
        </p>

        {/* numbered steps: one action + one framed screenshot each */}
        <ol className="mt-14 max-w-3xl space-y-14">
          {guide.steps.map((step, i) => (
            <li key={i} id={`step-${i + 1}`} className="scroll-mt-28">
              <div className="grid grid-cols-[3rem_1fr] gap-4">
                <span
                  className="font-mono text-xl text-accent"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="font-display text-xl font-medium">
                    {step.name}
                  </h2>
                  <p className="mt-3 leading-relaxed text-fg-muted">
                    {step.text}
                  </p>
                  <ScreenshotFrame
                    screenshot={step.screenshot}
                    stepNumber={i + 1}
                  />
                </div>
              </div>
            </li>
          ))}
        </ol>

        {/* common problems accordion — native details = keyboard accessible */}
        <section className="mt-20 max-w-3xl">
          <h2 className="font-display text-display-md font-medium">
            Common problems.
          </h2>
          <div className="mt-8">
            {guide.problems.map((p) => (
              <details
                key={p.question}
                className="group border-t border-line py-4 last:border-b"
              >
                <summary className="cursor-pointer list-none font-display text-lg font-medium transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden="true"
                    className="mr-3 inline-block font-mono text-accent transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                  {p.question}
                </summary>
                <p className="mt-3 pl-7 leading-relaxed text-fg-muted">
                  {p.answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* single hard CTA appears only at path completion */}
        {isFinal && (
          <section className="mt-20 max-w-3xl border-2 border-ink bg-paper-card p-6 md:p-8">
            <p className="label-micro mb-3">Path complete</p>
            <h2 className="font-display text-display-md font-medium">
              You can now run any MT5 expert advisor.
            </h2>
            <p className="mt-4 leading-relaxed text-fg-muted">
              If the one you run is Grit Markets, you already understand
              exactly what it does — including the Martingale risk profile you
              saw disclosed before anything was for sale. Licensed monthly,
              cancel any time, demo it first.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="/pricing" className="btn-primary">
                See pricing
              </Link>
              <Link href="/#simulator" className="btn-ghost">
                Stress-test the strategy again
              </Link>
            </div>
          </section>
        )}

        <GuideNav
          current={guide.step}
          prev={prev && { slug: prev.slug, step: prev.step, navLabel: prev.navLabel }}
          next={next && { slug: next.slug, step: next.step, navLabel: next.navLabel }}
        />
      </article>
    </>
  );
}
