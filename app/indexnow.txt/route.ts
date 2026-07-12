/**
 * IndexNow key file. The weekly ping (api/cron/indexnow) references this
 * location so Bing/Yandex/Seznam can verify ownership. Bing's index feeds
 * ChatGPT search and Copilot — instant indexing is an AEO lever, not just SEO.
 */
export const dynamic = "force-dynamic";

export function GET(): Response {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new Response("not configured", { status: 404 });
  return new Response(key, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
