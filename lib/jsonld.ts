import { SITE, absoluteUrl } from "./site";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.companyName,
    legalName: SITE.companyName,
    identifier: SITE.companyNumber,
    url: SITE.url,
    email: SITE.supportEmail,
    address: {
      "@type": "PostalAddress",
      addressCountry: "GB",
      addressRegion: "Scotland",
    },
  };
}

export function softwareApplicationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE.url}/#software`,
    name: SITE.productName,
    description: SITE.description,
    url: SITE.url,
    applicationCategory: "FinanceApplication",
    operatingSystem: "MetaTrader 5",
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GBP",
      lowPrice: "29.00",
      highPrice: "49.00",
      offerCount: 2,
      description:
        "Standard £29/month or Premium £49/month — first month free on both, no card required, demo or live.",
      url: absoluteUrl("/pricing"),
    },
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

export function faqPageJsonLd(
  entries: { question: string; answerShort: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answerShort },
    })),
  };
}

export function articleJsonLd(post: {
  slug: string;
  title: string;
  description: string;
  date: string;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: absoluteUrl(`/blog/${post.slug}`),
    author: { "@id": `${SITE.url}/#organization` },
    publisher: { "@id": `${SITE.url}/#organization` },
    about: { "@id": `${SITE.url}/#software` },
  };
}

export function howToJsonLd(guide: {
  slug: string;
  title: string;
  description: string;
  steps: { name: string; text: string }[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    url: absoluteUrl(`/docs/${guide.slug}`),
    step: guide.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function itemListJsonLd(
  items: { name: string; path: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: absoluteUrl(it.path),
    })),
  };
}

export function howToGuideJsonLd(guide: {
  path: string;
  title: string;
  description: string;
  totalMinutes: number;
  steps: { name: string; text: string; imagePath?: string }[];
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    url: absoluteUrl(guide.path),
    totalTime: `PT${guide.totalMinutes}M`,
    step: guide.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
      ...(s.imagePath
        ? {
            image: {
              "@type": "ImageObject",
              contentUrl: absoluteUrl(s.imagePath),
            },
          }
        : {}),
    })),
  };
}

export function breadcrumbJsonLd(
  crumbs: { name: string; path: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}
