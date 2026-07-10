import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { CHANGELOG } from "@/content/changelog";

export const metadata: Metadata = {
  title: "Changelog — EA version history",
  description:
    "Version history for the Grit Markets MT5 expert advisor: releases, risk-control changes and fixes, documented in the open.",
  alternates: { canonical: "/changelog" },
};

export default function ChangelogPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Changelog", path: "/changelog" },
        ])}
      />

      <section className="mx-auto max-w-site px-5 pb-24 pt-36 md:px-10">
        <p className="label-micro mb-5">Changelog</p>
        <h1 className="max-w-4xl font-display text-display-lg font-medium">
          Every version, on the record.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fg-muted">
          What changed in the engine and when. Subscribers always run the
          version they choose — updates are downloads, not silent pushes.
        </p>

        <div className="mt-16 max-w-3xl">
          {CHANGELOG.map((entry) => (
            <article
              key={entry.version}
              className="grid grid-cols-[6rem_1fr] gap-6 border-t border-line py-8 first:border-t-0 md:grid-cols-[10rem_1fr]"
            >
              <div>
                <h2 className="font-mono text-lg text-accent">v{entry.version}</h2>
                <time dateTime={entry.date} className="font-mono text-xs text-fg-faint">
                  {entry.date}
                </time>
              </div>
              <ul className="space-y-2">
                {entry.changes.map((c, i) => (
                  <li key={i} className="flex gap-3 leading-relaxed text-fg-muted">
                    <span className="text-fg-faint" aria-hidden="true">
                      —
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
