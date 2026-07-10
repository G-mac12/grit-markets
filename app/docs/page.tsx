import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { GUIDES } from "@/content/docs";

export const metadata: Metadata = {
  title: "Docs — installation & setup guides",
  description:
    "Setup guides for Grit Markets: installing the EA in MetaTrader 5, choosing a VPS for 24/5 operation, and configuring the risk controls.",
  alternates: { canonical: "/docs" },
};

export default function DocsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Docs", path: "/docs" },
        ])}
      />

      <section className="mx-auto max-w-site px-5 pb-24 pt-36 md:px-10">
        <p className="label-micro mb-5">Documentation</p>
        <h1 className="max-w-4xl font-display text-display-lg font-medium">
          From download to first sequence.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fg-muted">
          Everything needed to run Grit Markets properly: installation, hosting
          and — most importantly — risk configuration.
        </p>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {GUIDES.map((g, i) => (
            <Link
              key={g.slug}
              href={`/docs/${g.slug}`}
              className="panel group flex flex-col p-6 transition-colors duration-200 hover:border-accent/60"
            >
              <p className="font-mono text-sm text-fg-faint">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-3 font-display text-lg font-medium transition-colors group-hover:text-accent">
                {g.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">
                {g.description}
              </p>
              <p className="label-micro mt-6">
                {g.steps.length} steps →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
