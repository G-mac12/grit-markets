import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/jsonld";
import { POSTS } from "@/content/posts";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = POSTS.find((p) => p.slug === params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    // drafts stay out of the index until the owner publishes
    robots: post.status === "draft" ? { index: false, follow: true } : undefined,
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS.find((p) => p.slug === params.slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      <article className="mx-auto max-w-site px-5 pb-24 pt-36 md:px-10">
        <nav aria-label="Breadcrumb" className="label-micro mb-6">
          <Link href="/blog" className="hover:text-accent">
            Blog
          </Link>{" "}
          / {post.title}
        </nav>

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

        <h1 className="mt-4 max-w-4xl font-display text-display-md font-medium text-balance">
          {post.title}
        </h1>

        {/* answer-first: the direct 40–60 word answer leads */}
        <p className="mt-8 max-w-2xl border-l-2 border-accent pl-5 text-lg leading-relaxed text-fg">
          {post.answerFirst}
        </p>

        <div className="mt-12 max-w-2xl">
          {post.sections.map((s) => (
            <section key={s.heading} className="mt-10 first:mt-0">
              <h2 className="font-display text-xl font-medium">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="mt-4 leading-relaxed text-fg-muted">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-14 max-w-2xl border-t border-line pt-6 text-sm leading-relaxed text-fg-faint">
          Nothing in this article is investment advice. Martingale-based
          strategies can produce large drawdowns and total loss of capital.
        </p>
      </article>
    </>
  );
}
