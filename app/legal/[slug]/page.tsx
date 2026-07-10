import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { LEGAL } from "@/content/legal";

export function generateStaticParams() {
  return LEGAL.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const doc = LEGAL.find((d) => d.slug === params.slug);
  if (!doc) return {};
  return {
    title: doc.title,
    description: doc.description,
    alternates: { canonical: `/legal/${doc.slug}` },
  };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = LEGAL.find((d) => d.slug === params.slug);
  if (!doc) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: doc.title, path: `/legal/${doc.slug}` },
        ])}
      />

      <article className="mx-auto max-w-site px-5 pb-24 pt-36 md:px-10">
        <p className="label-micro mb-5">Legal</p>
        <h1 className="max-w-3xl font-display text-display-md font-medium">
          {doc.title}
        </h1>
        <p className="mt-4 font-mono text-xs text-fg-faint">
          Last updated {doc.updated}
        </p>

        <div className="mt-12 max-w-2xl">
          {doc.sections.map((s) => (
            <section key={s.heading} className="mt-10 first:mt-0">
              <h2 className="font-display text-lg font-medium">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed text-fg-muted">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
