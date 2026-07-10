"use client";

import { useEffect, useRef, useState } from "react";

/**
 * aqryl-pattern pinned sequence: the section pins for 4 viewport-heights of
 * scroll; progress drives a 4-step walkthrough of one full trade lifecycle,
 * lighting up the relevant dashboard panel per step. Doubles as the honest
 * strategy explanation — step 3 is the Martingale recovery ladder, shown as
 * exactly what it is.
 *
 * Reduced-motion / no-JS fallback: the four steps render as a readable
 * stacked list with all panels visible.
 */

const STEPS = [
  {
    id: "scan",
    label: "01 — Market scan",
    caption:
      "The engine watches its configured session for a qualifying setup. No signal, no trade.",
  },
  {
    id: "entry",
    label: "02 — Entry executed",
    caption: "A base-lot position opens. Smallest size in the sequence, every time.",
  },
  {
    id: "recovery",
    label: "03 — Recovery sizing",
    caption:
      "If price moves against the position, the engine adds at stepped intervals with compounding size. This is Martingale — each step is larger than the last.",
  },
  {
    id: "guard",
    label: "04 — Equity protection",
    caption:
      "Hard limits rule everything: max recovery level and an account-level equity stop that flattens the sequence rather than let losses run unbounded.",
  },
] as const;

function LadderBars({ active }: { active: boolean }) {
  const widths = [12, 20, 33, 55, 90];
  return (
    <div className="space-y-1.5" aria-hidden="true">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-2 bg-accent transition-all duration-500 ease-terminal"
          style={{
            width: `${w}%`,
            opacity: active ? 0.35 + i * 0.15 : 0.12,
            transitionDelay: active ? `${i * 90}ms` : "0ms",
          }}
        />
      ))}
    </div>
  );
}

function Panel({
  title,
  active,
  children,
}: {
  title: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`panel p-4 transition-all duration-300 ease-terminal md:p-5 ${
        active ? "border-accent/70 opacity-100" : "opacity-40"
      }`}
    >
      <p className={`label-micro mb-3 ${active ? "text-accent" : ""}`}>{title}</p>
      {children}
    </div>
  );
}

function StepPanels({ step }: { step: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      <Panel title="Scanner" active={step === 0}>
        <div className="space-y-2 font-mono text-xs text-fg-muted">
          <p>EURUSD · M15</p>
          <p className={step >= 0 ? "text-fg" : ""}>
            session <span className="text-gain">OPEN</span> · spread 0.6
          </p>
          <p>
            signal{" "}
            <span className={step >= 1 ? "text-accent" : "text-fg-faint"}>
              {step >= 1 ? "QUALIFIED" : "SCANNING…"}
            </span>
          </p>
        </div>
      </Panel>
      <Panel title="Order ticket" active={step === 1}>
        <div className="space-y-2 font-mono text-xs text-fg-muted">
          <p>
            <span className="text-gain">BUY</span> 0.01 lots @ 1.0842
          </p>
          <p>base lot — level 1 of sequence</p>
          <p className={step >= 1 ? "text-fg" : "text-fg-faint"}>
            status {step >= 1 ? "FILLED" : "—"}
          </p>
        </div>
      </Panel>
      <Panel title="Recovery ladder" active={step === 2}>
        <LadderBars active={step >= 2} />
        <p className="mt-3 font-mono text-micro uppercase tracking-[0.12em] text-fg-faint">
          size compounds per level
        </p>
      </Panel>
      <Panel title="Equity guardian" active={step === 3}>
        <div className="space-y-2 font-mono text-xs text-fg-muted">
          <p>
            max level <span className="text-fg">6</span> · equity stop{" "}
            <span className="text-accent">−8.0%</span>
          </p>
          <p className={step >= 3 ? "text-accent" : "text-fg-faint"}>
            {step >= 3 ? "SEQUENCE FLATTENED — LIMIT HIT" : "ARMED"}
          </p>
        </div>
      </Panel>
    </div>
  );
}

export function StickySequence() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    (async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !wrapRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      setPinned(true);
      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: wrapRef.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          onUpdate: (self) => {
            setStep(Math.min(3, Math.floor(self.progress * 4)));
          },
        });
      }, wrapRef);
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  if (!pinned) {
    // Static fallback: fully readable without motion.
    return (
      <section className="mx-auto max-w-site px-5 py-24 md:px-10" aria-label="How a trade runs">
        <p className="label-micro mb-4">One trade, end to end</p>
        <h2 className="max-w-3xl font-display text-display-md font-medium">
          What the engine actually does with your next position.
        </h2>
        <ol className="mt-12 space-y-10">
          {STEPS.map((s, i) => (
            <li key={s.id} className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="font-mono text-sm uppercase tracking-[0.12em] text-accent">
                  {s.label}
                </p>
                <p className="mt-3 max-w-md leading-relaxed text-fg-muted">{s.caption}</p>
              </div>
              <StepPanels step={i} />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section aria-label="How a trade runs">
      <div ref={wrapRef} className="flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-site items-center gap-10 px-5 md:grid-cols-[1fr_1.2fr] md:px-10">
          <div>
            <p className="label-micro mb-4">One trade, end to end</p>
            <h2 className="font-display text-display-md font-medium">
              What the engine actually does with your next position.
            </h2>
            <div className="mt-10 min-h-[8rem]" aria-live="polite">
              <p className="font-mono text-sm uppercase tracking-[0.12em] text-accent">
                {STEPS[step].label}
              </p>
              <p className="mt-3 max-w-md leading-relaxed text-fg-muted">
                {STEPS[step].caption}
              </p>
            </div>
            <div className="mt-8 flex gap-2" aria-hidden="true">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-0.5 w-10 transition-colors duration-300 ${
                    i <= step ? "bg-accent" : "bg-line"
                  }`}
                />
              ))}
            </div>
          </div>
          <StepPanels step={step} />
        </div>
      </div>
    </section>
  );
}
