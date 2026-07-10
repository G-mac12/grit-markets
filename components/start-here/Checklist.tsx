"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { doneParam, parseDone, withStep, withoutStep } from "./progress";

interface ChecklistItem {
  step: number;
  slug: string;
  navLabel: string;
  title: string;
  timeMinutes: number;
}

function ChecklistInner({ items }: { items: ChecklistItem[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const done = parseDone(params.get("done"));

  const toggle = (step: number) => {
    const next = done.includes(step)
      ? withoutStep(done, step)
      : withStep(done, step);
    router.replace(`/start-here${doneParam(next)}`, { scroll: false });
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="label-micro" aria-live="polite">
          {done.length} of {items.length} steps complete
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {items.map((it) => (
            <span
              key={it.step}
              className={`h-1 w-8 ${
                done.includes(it.step) ? "bg-accent" : "bg-line"
              }`}
            />
          ))}
        </div>
      </div>

      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => {
          const isDone = done.includes(item.step);
          return (
            <li key={item.step} className="flex">
              <article
                className={`panel flex w-full flex-col p-5 transition-colors duration-200 ${
                  isDone ? "border-accent/50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl text-accent">
                    {String(item.step).padStart(2, "0")}
                  </span>
                  <span className="label-micro">{item.timeMinutes} min</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-medium">
                  <Link
                    href={`/start-here/${item.slug}${doneParam(done)}`}
                    className="transition-colors hover:text-accent"
                  >
                    {item.navLabel}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">
                  {item.title}
                </p>
                <button
                  type="button"
                  onClick={() => toggle(item.step)}
                  aria-pressed={isDone}
                  className={`mt-4 border px-3 py-1.5 text-left font-mono text-micro uppercase tracking-[0.12em] transition-colors duration-200 ${
                    isDone
                      ? "border-accent bg-accent text-white"
                      : "border-line-strong text-fg-muted hover:border-accent hover:text-accent"
                  }`}
                >
                  {isDone ? "✓ Done" : "Mark done"}
                </button>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Checklist({ items }: { items: ChecklistItem[] }) {
  return (
    <Suspense fallback={null}>
      <ChecklistInner items={items} />
    </Suspense>
  );
}
