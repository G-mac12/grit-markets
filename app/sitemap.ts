import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { GUIDES } from "@/content/docs";
import { START_GUIDES } from "@/content/start-here";
import { POSTS } from "@/content/posts";
import { LEGAL } from "@/content/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/how-it-works",
    "/pricing",
    "/faq",
    "/start-here",
    "/docs",
    "/blog",
    "/changelog",
  ];

  return [
    ...staticPaths.map((p) => ({
      url: absoluteUrl(p),
      changeFrequency: "weekly" as const,
      priority: p === "/" ? 1 : 0.8,
    })),
    ...START_GUIDES.map((g) => ({
      url: absoluteUrl(`/start-here/${g.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...GUIDES.map((g) => ({
      url: absoluteUrl(`/docs/${g.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // draft posts are excluded until published
    ...POSTS.filter((p) => p.status !== "draft").map((p) => ({
      url: absoluteUrl(`/blog/${p.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...LEGAL.map((d) => ({
      url: absoluteUrl(`/legal/${d.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
