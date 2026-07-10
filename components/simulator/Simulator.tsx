"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { simulate, type SimParams, type SimResult } from "@/lib/martingale";

/**
 * The honesty centrepiece: a client-side Monte Carlo of the Martingale
 * sizing model, run in a web worker, drawn as an equity fan chart including
 * the drawdown clusters the strategy produces. Fully keyboard-accessible;
 * results are also reported as text for screen readers.
 */

const DEFAULTS = {
  startBalance: 10_000,
  baseLot: 0.01,
  multiplier: 2,
  maxLevels: 6,
  winRate: 0.6,
};

const CYCLES = 250;
const RUNS = 400;

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

interface Control {
  key: keyof typeof DEFAULTS;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

const CONTROLS: Control[] = [
  { key: "startBalance", label: "Starting balance", min: 1000, max: 100000, step: 500, format: (v) => gbp.format(v) },
  { key: "baseLot", label: "Base lot", min: 0.01, max: 0.5, step: 0.01, format: (v) => v.toFixed(2) },
  { key: "multiplier", label: "Multiplier", min: 1.2, max: 3, step: 0.1, format: (v) => `×${v.toFixed(1)}` },
  { key: "maxLevels", label: "Max recovery levels", min: 2, max: 10, step: 1, format: (v) => String(v) },
  { key: "winRate", label: "Win rate per trade", min: 0.4, max: 0.9, step: 0.01, format: (v) => `${Math.round(v * 100)}%` },
];

function drawChart(
  canvas: HTMLCanvasElement,
  result: SimResult,
  startBalance: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const all = [...result.p90, ...result.sample];
  const yMax = Math.max(...all, startBalance) * 1.05;
  const n = result.p50.length;
  const x = (i: number) => (i / (n - 1)) * w;
  const y = (v: number) => h - (v / yMax) * (h - 12) - 6;

  // grid
  ctx.strokeStyle = "rgba(22,21,19,0.07)";
  ctx.lineWidth = 1;
  for (let g = 1; g < 4; g++) {
    ctx.beginPath();
    ctx.moveTo(0, (h / 4) * g);
    ctx.lineTo(w, (h / 4) * g);
    ctx.stroke();
  }
  // starting balance reference
  ctx.strokeStyle = "rgba(22,21,19,0.3)";
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(0, y(startBalance));
  ctx.lineTo(w, y(startBalance));
  ctx.stroke();
  ctx.setLineDash([]);

  // p10–p90 band
  ctx.beginPath();
  result.p90.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(x(i), y(result.p10[i]));
  ctx.closePath();
  ctx.fillStyle = "rgba(29,53,224,0.08)";
  ctx.fill();

  // sample bad run
  ctx.beginPath();
  result.sample.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
  ctx.strokeStyle = "rgba(192,51,43,0.75)";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // median
  ctx.beginPath();
  result.p50.forEach((v, i) => (i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v))));
  ctx.strokeStyle = "#1D35E0";
  ctx.lineWidth = 1.75;
  ctx.stroke();
}

export function Simulator({
  initial,
}: {
  /** Seed with real account values for dashboard what-if previews. */
  initial?: Partial<typeof DEFAULTS>;
}) {
  const [params, setParams] = useState({ ...DEFAULTS, ...initial });
  const [result, setResult] = useState<SimResult | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const jobRef = useRef(0);

  const run = useCallback((p: typeof DEFAULTS) => {
    const simParams: SimParams = { ...p, cycles: CYCLES, runs: RUNS };
    const id = ++jobRef.current;
    setBusy(true);
    try {
      if (!workerRef.current && typeof Worker !== "undefined") {
        workerRef.current = new Worker(
          new URL("./mc.worker.ts", import.meta.url)
        );
        workerRef.current.onmessage = (
          e: MessageEvent<{ id: number; result: SimResult }>
        ) => {
          if (e.data.id === jobRef.current) {
            setResult(e.data.result);
            setBusy(false);
          }
        };
      }
      if (workerRef.current) {
        workerRef.current.postMessage({ id, params: simParams });
        return;
      }
    } catch {
      // fall through to main-thread compute
    }
    setResult(simulate(simParams));
    setBusy(false);
  }, []);

  // debounce recompute on parameter change
  useEffect(() => {
    const t = setTimeout(() => run(params), 220);
    return () => clearTimeout(t);
  }, [params, run]);

  useEffect(() => () => workerRef.current?.terminate(), []);

  useEffect(() => {
    if (result && canvasRef.current)
      drawChart(canvasRef.current, result, params.startBalance);
  }, [result, params.startBalance]);

  const summary = useMemo(() => {
    if (!result) return null;
    const terminal = result.p50[result.p50.length - 1];
    return {
      medianTerminal: terminal,
      worstTerminal: result.p10[result.p10.length - 1],
      ruinPct: result.ruinPct,
      dd: result.medianMaxDrawdownPct,
    };
  }, [result]);

  return (
    <div className="panel p-5 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(16rem,1fr)_2fr]">
        <form className="space-y-6" aria-label="Simulator parameters">
          {CONTROLS.map((c) => (
            <div key={c.key}>
              <div className="mb-2 flex items-baseline justify-between">
                <label
                  htmlFor={`sim-${c.key}`}
                  className="label-micro"
                >
                  {c.label}
                </label>
                <output
                  htmlFor={`sim-${c.key}`}
                  className="font-mono text-sm text-accent"
                >
                  {c.format(params[c.key])}
                </output>
              </div>
              <input
                id={`sim-${c.key}`}
                type="range"
                min={c.min}
                max={c.max}
                step={c.step}
                value={params[c.key]}
                onChange={(e) =>
                  setParams((p) => ({ ...p, [c.key]: Number(e.target.value) }))
                }
                className="w-full accent-[#1D35E0]"
              />
            </div>
          ))}
          <p className="border-t border-line pt-4 text-xs leading-relaxed text-fg-faint">
            Model: fixed 20-pip target and stop, £10 pip value per 1.0 lot,
            independent outcomes, {RUNS} Monte Carlo runs of {CYCLES} sequences.
            Simulated results. Backtests and simulations do not predict live
            performance.
          </p>
        </form>

        <div>
          <div className="relative h-64 border border-line bg-white md:h-80">
            <canvas
              ref={canvasRef}
              className="h-full w-full"
              role="img"
              aria-label="Simulated equity fan chart: median path, 10th to 90th percentile band, and one bad run"
            />
            {busy && (
              <p className="absolute left-3 top-3 font-mono text-micro uppercase tracking-[0.12em] text-fg-faint">
                Computing…
              </p>
            )}
            <p className="absolute bottom-2 right-3 font-mono text-micro uppercase tracking-[0.12em] text-fg-faint">
              Simulated — not live performance
            </p>
          </div>

          {summary && (
            <dl className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4" aria-live="polite">
              <div>
                <dt className="label-micro">Median outcome</dt>
                <dd className="mt-1 font-mono text-lg text-fg">
                  {gbp.format(summary.medianTerminal)}
                </dd>
              </div>
              <div>
                <dt className="label-micro">Bad decile</dt>
                <dd className="mt-1 font-mono text-lg text-loss">
                  {gbp.format(summary.worstTerminal)}
                </dd>
              </div>
              <div>
                <dt className="label-micro">Median max drawdown</dt>
                <dd className="mt-1 font-mono text-lg text-accent">
                  {summary.dd.toFixed(1)}%
                </dd>
              </div>
              <div>
                <dt className="label-micro">Runs hitting zero</dt>
                <dd className="mt-1 font-mono text-lg text-loss">
                  {summary.ruinPct.toFixed(1)}%
                </dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
