import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { FAQ } from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ — honest answers about Martingale EAs and licensing",
  description:
    "Direct answers about Grit Markets: how Martingale works, whether it can blow an account (yes, it can), capital requirements, brokers, VPS and licensing.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqPageJsonLd(FAQ)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />

      <section className="mx-auto max-w-site px-5 pb-24 pt-36 md:px-10">
        <p className="label-micro mb-5">FAQ</p>
        <h1 className="max-w-4xl font-display text-display-lg font-medium">
          Asked before you did.
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-fg-muted">
          Every answer opens with the short version. Where the honest answer is
          uncomfortable — it stays honest.
        </p>

        <div className="mt-16 max-w-3xl">
          {FAQ.map((f) => (
            <article
              key={f.slug}
              id={f.slug}
              className="scroll-mt-28 border-t border-line py-10 first:border-t-0"
            >
              <h2 className="font-display text-xl font-medium md:text-2xl">
                {f.question}
              </h2>
              <p className="mt-4 border-l-2 border-accent pl-4 leading-relaxed text-fg">
                {f.answerShort}
              </p>
              <div className="mt-5 space-y-4">
                {f.answerLong.map((p, i) => (
                  <p key={i} className="leading-relaxed text-fg-muted">
                    {p}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
