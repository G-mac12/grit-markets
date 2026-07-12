import { ImageResponse } from "next/og";
import { START_GUIDES } from "@/content/start-here";

/** Per-guide OG card for the beginner hub — the primary traffic pages. */
export const runtime = "edge";
export const alt = "Grit Markets setup guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function GuideOgImage({
  params,
}: {
  params: { guide: string };
}) {
  const guide = START_GUIDES.find((g) => g.slug === params.guide);
  const title = guide?.title ?? "Start here";
  const step = guide ? `Step ${guide.step} of 5` : "Setup path";
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
          <div style={{ fontSize: 18, color: "#1D35E0", letterSpacing: 3, textTransform: "uppercase" as const }}>
            {step}
          </div>
        </div>
        <div
          style={{
            fontSize: title.length > 60 ? 54 : 64,
            lineHeight: 1.12,
            color: "#161513",
            maxWidth: 1020,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #D9D3C6", paddingTop: 24 }}>
          <div style={{ fontSize: 20, color: "#8F897C" }}>gritmarkets.com/start-here</div>
          <div style={{ fontSize: 20, color: "#8F897C" }}>Demo-first. Risks up front.</div>
        </div>
      </div>
    ),
    size
  );
}
