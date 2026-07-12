import { ImageResponse } from "next/og";
import { POSTS } from "@/content/posts";

/** Per-post OG card: the article title in the editorial system. */
export const runtime = "edge";
export const alt = "Grit Markets article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function PostOgImage({ params }: { params: { slug: string } }) {
  const post = POSTS.find((p) => p.slug === params.slug);
  const title = post?.title ?? "Grit Markets";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4F1EA",
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#161513" }}>
            Grit Markets<span style={{ color: "#1D35E0" }}>.</span>
          </div>
          <div style={{ fontSize: 18, color: "#8F897C", letterSpacing: 3, textTransform: "uppercase" as const }}>
            Blog
          </div>
        </div>
        <div
          style={{
            fontSize: title.length > 70 ? 52 : 62,
            lineHeight: 1.12,
            color: "#161513",
            maxWidth: 1020,
            borderLeft: "6px solid #1D35E0",
            paddingLeft: 36,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #D9D3C6", paddingTop: 24 }}>
          <div style={{ fontSize: 20, color: "#8F897C" }}>gritmarkets.com/blog</div>
          <div style={{ fontSize: 20, color: "#8F897C" }}>The answer first. Then the detail.</div>
        </div>
      </div>
    ),
    size
  );
}
