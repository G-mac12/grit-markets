import { NextRequest, NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron";
import { SITE, absoluteUrl } from "@/lib/site";
import { GUIDES } from "@/content/docs";
import { POSTS } from "@/content/posts";
import { START_GUIDES } from "@/content/start-here";
import { LEGAL } from "@/content/legal";

/**
 * Weekly IndexNow ping: submits the site's canonical URLs to
 * api.indexnow.org so Bing (which feeds ChatGPT search and Copilot),
 * Yandex and Seznam re-crawl promptly after content changes. Google
 * ignores IndexNow — Google discovery runs through Search Console +
 * sitemap instead.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const urls = [
    "/",
    "/how-it-works",
    "/pricing",
    "/faq",
    "/start-here",
    "/docs",
    "/blog",
    "/changelog",
    ...START_GUIDES.map((g) => `/start-here/${g.slug}`),
    ...GUIDES.map((g) => `/docs/${g.slug}`),
    ...POSTS.filter((p) => p.status !== "draft").map((p) => `/blog/${p.slug}`),
    ...LEGAL.map((d) => `/legal/${d.slug}`),
  ].map(absoluteUrl);

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE.url).host,
      key,
      keyLocation: absoluteUrl("/indexnow.txt"),
      urlList: urls,
    }),
  });

  return NextResponse.json({
    ok: res.ok,
    status: res.status,
    submitted: urls.length,
  });
}
