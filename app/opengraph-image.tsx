import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/**
 * Site-wide OG/Twitter card — Broadsheet Terminal styling. Rendered at the
 * edge; shown when any page without a more specific image is shared or
 * cited by an AI answer engine.
 */
export const runtime = "edge";
export const alt = `${SITE.productName} — MT5 expert advisor, subscription licensed`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          <div style={{ fontSize: 34, fontWeight: 700, color: "#161513" }}>
            Grit Markets<span style={{ color: "#1D35E0" }}>.</span>
          </div>
          <div style={{ fontSize: 18, color: "#8F897C", letterSpacing: 3, textTransform: "uppercase" as const }}>
            MT5 Expert Advisor
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 78, lineHeight: 1.05, color: "#161513", maxWidth: 1000 }}>
            A <span style={{ color: "#1D35E0", fontStyle: "italic" }}>Martingale</span> engine for MetaTrader 5.
          </div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#57524A", maxWidth: 900 }}>
            Compounding position sizing, hard risk controls — and the risk profile shown before you pay.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #D9D3C6", paddingTop: 24 }}>
          <div style={{ fontSize: 20, color: "#8F897C" }}>gritmarkets.com</div>
          <div style={{ fontSize: 20, color: "#8F897C" }}>Grit Agility Ltd · SC837399</div>
        </div>
      </div>
    ),
    size
  );
}
