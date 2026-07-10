import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, howToJsonLd } from "@/lib/jsonld";
import { GUIDES } from "@/content/docs";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/docs/${guide.slug}` },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) notFound();

  return (
    <>
      <JsonLd data={howToJsonLd(guide)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Docs", path: "/docs" },
          { name: guide.title, path: `/docs/${guide.slug}` },
        ])}
      />

      <article className="mx-auto max-w-site px-5 pb-24 pt-36 md:px-10">
        <nav aria-label="Breadcrumb" className="label-micro mb-6">
          <Link href="/docs" className="hover:text-accent">
            Docs
          </Link>{" "}
          / {guide.title}
        </nav>
        <h1 className="max-w-3xl font-display text-display-md font-medium">
          {guide.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">
          {guide.intro}
        </p>

        <ol className="mt-14 max-w-3xl space-y-8">
          {guide.steps.map((step, i) => (
            <li key={i} className="grid grid-cols-[3rem_1fr] gap-4">
              <span className="font-mono text-xl text-accent" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="font-display text-lg font-medium">{step.name}</h2>
                <p className="mt-2 leading-relaxed text-fg-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        {guide.codeBlocks?.map((block) => (
          <figure key={block.title} className="mt-14 max-w-3xl">
            <figcaption className="label-micro mb-3">
              {block.title} · {block.language}
            </figcaption>
            <pre className="term-panel scanlines overflow-x-auto p-5 font-mono text-xs leading-relaxed text-term-fg">
              <code>{block.code}</code>
            </pre>
          </figure>
        ))}

        {guide.notes && guide.notes.length > 0 && (
          <div className="mt-14 max-w-3xl panel p-5">
            <p className="label-micro mb-3 text-accent">Notes</p>
            <ul className="space-y-2">
              {guide.notes.map((n, i) => (
                <li key={i} className="text-sm leading-relaxed text-fg-muted">
                  {n}
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </>
  );
}
