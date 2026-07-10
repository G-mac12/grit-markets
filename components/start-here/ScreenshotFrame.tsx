import { existsSync } from "fs";
import path from "path";
import Image from "next/image";
import type { GuideScreenshot } from "@/content/start-here";

/**
 * Terminal-framed screenshot slot. Every image is owner-supplied — this
 * component renders a labelled placeholder until the file exists at
 * public/images/start-here/<file>, then swaps to the real screenshot
 * automatically on the next build. Never scrape or fake third-party UI.
 *
 * Annotation callouts are numbered markers listed under the frame —
 * consistent, readable, and they survive screen readers.
 */
export function ScreenshotFrame({
  screenshot,
  stepNumber,
}: {
  screenshot: GuideScreenshot;
  stepNumber: number;
}) {
  const rel = `/images/start-here/${screenshot.file}`;
  const exists = existsSync(path.join(process.cwd(), "public", rel));

  return (
    <figure className="mt-4">
      <div className="term-panel overflow-hidden">
        {/* frame chrome */}
        <div className="flex items-center gap-2 border-b border-term-line px-4 py-2.5">
          <span aria-hidden="true" className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-term-line" />
            <span className="h-2 w-2 rounded-full bg-term-line" />
            <span className="h-2 w-2 rounded-full bg-accent-bright/60" />
          </span>
          <span className="truncate font-mono text-micro uppercase tracking-[0.12em] text-term-faint">
            {screenshot.file}
          </span>
        </div>

        {exists ? (
          <div className="relative aspect-video bg-term-bg">
            <Image
              src={rel}
              alt={screenshot.alt}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-contain"
            />
          </div>
        ) : (
          <div
            role="img"
            aria-label={`Screenshot pending: ${screenshot.alt}`}
            className="flex aspect-video flex-col items-center justify-center gap-3 bg-term-bg px-6 text-center"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent 0, transparent 14px, rgba(94,113,255,0.05) 14px, rgba(94,113,255,0.05) 15px)",
            }}
          >
            <span className="border border-term-line px-2 py-1 font-mono text-micro uppercase tracking-[0.14em] text-term-faint">
              Screenshot slot — see SHOT-LIST.md
            </span>
            <span className="max-w-md text-sm leading-relaxed text-term-muted">
              {screenshot.alt}
            </span>
          </div>
        )}
      </div>

      {screenshot.annotations.length > 0 && (
        <figcaption className="mt-2">
          <ol className="space-y-1">
            {screenshot.annotations.map((a, i) => (
              <li
                key={i}
                className="flex items-baseline gap-2 font-mono text-xs text-fg-muted"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white"
                >
                  {i + 1}
                </span>
                {a.replace(/^\d+\.\s*/, "")}
              </li>
            ))}
          </ol>
          <span className="sr-only">
            Callouts for step {stepNumber} screenshot
          </span>
        </figcaption>
      )}
    </figure>
  );
}
