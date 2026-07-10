import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { POSTS } from "@/content/posts";

export const metadata: Metadata = {
  title: "Blog — answer-first writing on EAs and risk",
  description:
    "Answer-first articles from Grit Markets on Martingale mechanics, capital requirements and choosing an MT5 expert advisor — honest about the risk.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndexPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />

      <section className="mx-auto max-w-site px-5 pb-24 pt-36 md:px-10">
        <p className="label-micro mb-5">Blog</p>
        <h1 className="max-w-4xl font-display text-display-lg font-medium">
          The answer first. Then the detail.
        </h1>

        <div className="mt-16 max-w-3xl">
          {POSTS.map((post) => (
            <article key={post.slug} className="border-t border-line py-10 first:border-t-0">
              <div className="flex flex-wrap items-center gap-3">
                <time dateTime={post.date} className="font-mono text-xs text-fg-faint">
                  {post.date}
                </time>
                {post.status === "draft" && (
                  <span className="border border-line-strong px-2 py-0.5 font-mono text-micro uppercase tracking-[0.12em] text-fg-faint">
                    Draft — awaiting owner review
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-display text-xl font-medium md:text-2xl">
                <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-accent">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">
                {post.answerFirst}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="label-micro mt-4 inline-block hover:text-accent"
              >
                Read →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
