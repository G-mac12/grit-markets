"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { doneParam, parseDone, withStep } from "./progress";

interface GuideRef {
  slug: string;
  step: number;
  navLabel: string;
}

/** Persistent progress indicator shown at the top of every guide. */
function ProgressInner({ current, total }: { current: number; total: number }) {
  const params = useSearchParams();
  const done = parseDone(params.get("done"));
  return (
    <div className="flex items-center gap-4">
      <Link
        href={`/start-here${doneParam(done)}`}
        className="label-micro hover:text-accent"
      >
        Start here
      </Link>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          return (
            <span
              key={step}
              className={`h-1 w-8 ${
                step === current
                  ? "bg-ink"
                  : done.includes(step)
                    ? "bg-accent"
                    : "bg-line"
              }`}
            />
          );
        })}
      </div>
      <span className="label-micro">
        Step {current} of {total}
      </span>
    </div>
  );
}

export function GuideProgress(props: { current: number; total: number }) {
  return (
    <Suspense fallback={null}>
      <ProgressInner {...props} />
    </Suspense>
  );
}

/** Prev/next footer: marking the step complete carries into the URL state. */
function NavInner({
  current,
  prev,
  next,
}: {
  current: number;
  prev: GuideRef | null;
  next: GuideRef | null;
}) {
  const params = useSearchParams();
  const done = parseDone(params.get("done"));
  const doneWithCurrent = withStep(done, current);

  return (
    <nav
      aria-label="Guide steps"
      className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8"
    >
      {prev ? (
        <Link
          href={`/start-here/${prev.slug}${doneParam(done)}`}
          className="btn-ghost"
        >
          ← Step {prev.step}: {prev.navLabel}
        </Link>
      ) : (
        <Link href={`/start-here${doneParam(done)}`} className="btn-ghost">
          ← Back to the path
        </Link>
      )}
      {next ? (
        <Link
          href={`/start-here/${next.slug}${doneParam(doneWithCurrent)}`}
          className="btn-primary"
        >
          Ready for step {next.step} →
        </Link>
      ) : (
        <Link
          href={`/start-here${doneParam(doneWithCurrent)}`}
          className="btn-primary"
        >
          Finish the path →
        </Link>
      )}
    </nav>
  );
}

export function GuideNav(props: {
  current: number;
  prev: GuideRef | null;
  next: GuideRef | null;
}) {
  return (
    <Suspense fallback={null}>
      <NavInner {...props} />
    </Suspense>
  );
}
