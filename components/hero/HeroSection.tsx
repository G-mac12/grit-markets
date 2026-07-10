"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { FORMATIONS, type FormationKind } from "./formations";
import { HeroFallback } from "./HeroFallback";

const TapeCanvas = dynamic(() => import("./TapeCanvas"), {
  ssr: false,
  loading: () => <HeroFallback />,
});

const FORMATION_COPY: Record<FormationKind, string> = {
  flow: "Streaming tick tape",
  structure: "Market structure",
  engine: "The position-sizing ladder",
};

function useCanAnimate(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;
    // degrade gracefully on devices without WebGL
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    if (!gl) return;
    // defer mounting the 3D bundle until the browser is idle → LCP is the headline
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idle = w.requestIdleCallback
      ? w.requestIdleCallback(() => setOk(true), { timeout: 2000 })
      : window.setTimeout(() => setOk(true), 300);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);
  return ok;
}

// Auto-tour: hold each formation this long before advancing (the morph
// itself takes ~1.4s on top). A manual selection hands control to the visitor.
const AUTO_CYCLE_MS = 3000;

export function HeroSection() {
  const [formation, setFormation] = useState<FormationKind>("flow");
  const [autoTour, setAutoTour] = useState(true);
  const animate = useCanAnimate();

  useEffect(() => {
    if (!animate || !autoTour) return;
    const id = setInterval(() => {
      setFormation(
        (f) => FORMATIONS[(FORMATIONS.indexOf(f) + 1) % FORMATIONS.length]
      );
    }, AUTO_CYCLE_MS);
    return () => clearInterval(id);
  }, [animate, autoTour]);

  const selectFormation = (f: FormationKind) => {
    setAutoTour(false);
    setFormation(f);
  };

  return (
    <section className="relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden">
      <div className="absolute inset-0">
        {animate ? <TapeCanvas formation={formation} /> : <HeroFallback />}
      </div>
      {/* readability scrim */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper/40 via-transparent to-paper" />

      <div className="relative z-10 mx-auto flex w-full max-w-site flex-1 flex-col justify-center px-5 pt-20 md:px-10">
        <p className="label-micro mb-6">
          {SITE.companyName} · {SITE.companyNumber}
        </p>
        <h1 className="max-w-5xl font-display text-display-xl font-medium text-balance">
          A <em className="italic text-accent">Martingale</em> engine for
          MetaTrader&nbsp;5.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-fg-muted">
          Compounding position sizing, bounded by hard risk controls — and a
          risk profile we show you before you pay. Licensed monthly.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/pricing" className="btn-primary">
            Get access
          </Link>
          <Link href="/#simulator" className="btn-ghost">
            Stress-test the strategy
          </Link>
        </div>
      </div>

      {/* formation toggle — the K95 Rings/Spiral move */}
      <div className="relative z-10 mx-auto w-full max-w-site px-5 pb-16 md:px-10">
        <div
          role="group"
          aria-label="Hero formation"
          className="flex items-center gap-6"
        >
          {FORMATIONS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={formation === f}
              onClick={() => selectFormation(f)}
              className={`font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                formation === f
                  ? "text-accent"
                  : "text-fg-faint hover:text-fg"
              }`}
            >
              {formation === f ? "● " : "○ "}
              {f}
            </button>
          ))}
          <span className="hidden font-mono text-micro uppercase tracking-[0.14em] text-fg-faint sm:inline">
            — {FORMATION_COPY[formation]}
          </span>
        </div>
      </div>

      {/* scroll indicator + metadata strip */}
      <div className="absolute bottom-5 left-5 z-10 md:left-10">
        <span className="label-micro animate-pulse">Scroll ↓</span>
      </div>
      <div className="absolute bottom-5 right-5 z-10 hidden md:right-10 md:block">
        <span className="label-micro">
          {SITE.metadataStrip} — 03 FORMATIONS — © {new Date().getFullYear()}
        </span>
      </div>
    </section>
  );
}
