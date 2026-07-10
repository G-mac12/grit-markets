"use client";

import { useEffect, useRef, useState } from "react";
import { SIMULATED_DATA_LABEL } from "@/lib/site";

/**
 * Live-feeling preview of the Phase 2 subscriber dashboard (/account).
 * Real components fed with simulated data — never screenshots. Rendered as
 * a dark terminal window framed on the editorial paper page; these pieces
 * are the Phase 2 component library, previewed.
 */

const fmt = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function StatusPill({
  label,
  tone = "active",
}: {
  label: string;
  tone?: "active" | "warn";
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-micro uppercase tracking-[0.12em] ${
        tone === "active"
          ? "border-gain-bright/40 text-gain-bright"
          : "border-accent-bright/40 text-accent-bright"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "active" ? "bg-gain-bright" : "bg-accent-bright"
        } motion-safe:animate-pulse`}
      />
      {label}
    </span>
  );
}

export function SessionClock() {
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-GB", {
          hour12: false,
          timeZone: "UTC",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-xs text-term-faint">
      {now} <span className="text-term-faint/70">UTC</span>
    </span>
  );
}

export function EquityReadout({ value }: { value: number }) {
  return (
    <div>
      <p className="label-micro mb-1 text-term-faint">Equity</p>
      <p className="font-mono text-4xl text-term-fg md:text-5xl">
        <span className="text-term-faint">£</span>
        {fmt.format(value)}
      </p>
    </div>
  );
}

interface Row {
  symbol: string;
  side: "BUY" | "SELL";
  lots: number;
  entry: number;
  pnl: number;
}

const SEED_ROWS: Row[] = [
  { symbol: "EURUSD", side: "BUY", lots: 0.01, entry: 1.0842, pnl: 3.1 },
  { symbol: "EURUSD", side: "BUY", lots: 0.02, entry: 1.0828, pnl: -4.6 },
  { symbol: "GBPUSD", side: "SELL", lots: 0.01, entry: 1.2691, pnl: 1.8 },
];

export function PositionsTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full font-mono text-xs">
        <thead>
          <tr className="border-b border-term-line text-left text-term-faint">
            <th className="py-2 pr-4 font-normal uppercase tracking-[0.1em]">Symbol</th>
            <th className="py-2 pr-4 font-normal uppercase tracking-[0.1em]">Side</th>
            <th className="py-2 pr-4 text-right font-normal uppercase tracking-[0.1em]">Lots</th>
            <th className="py-2 pr-4 text-right font-normal uppercase tracking-[0.1em]">Entry</th>
            <th className="py-2 text-right font-normal uppercase tracking-[0.1em]">P/L</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-b border-term-line/40 text-term-muted motion-safe:animate-[fadeIn_0.4s_ease]"
            >
              <td className="py-2 pr-4 text-term-fg">{r.symbol}</td>
              <td
                className={`py-2 pr-4 ${
                  r.side === "BUY" ? "text-gain-bright" : "text-loss-bright"
                }`}
              >
                {r.side}
              </td>
              <td className="py-2 pr-4 text-right">{r.lots.toFixed(2)}</td>
              <td className="py-2 pr-4 text-right">{r.entry.toFixed(4)}</td>
              <td
                className={`py-2 text-right ${
                  r.pnl >= 0 ? "text-gain-bright" : "text-loss-bright"
                }`}
              >
                {r.pnl >= 0 ? "+" : ""}
                {r.pnl.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardPreview() {
  const [equity, setEquity] = useState(10_000);
  const [rows, setRows] = useState<Row[]>(SEED_ROWS);
  const tick = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      tick.current += 1;
      setEquity((e) => e + (Math.random() - 0.485) * 6);
      setRows((rs) =>
        rs.map((r) => ({ ...r, pnl: r.pnl + (Math.random() - 0.49) * 1.4 }))
      );
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const floating = rows.reduce((a, r) => a + r.pnl, 0);
  const maxLevel = 2;

  return (
    <div
      className="term-panel scanlines relative p-5 shadow-[0_24px_60px_-24px_rgba(22,21,19,0.45)] md:p-7"
      aria-label="Simulated dashboard preview"
    >
      <p className="absolute bottom-3 right-3 border border-accent-bright/50 px-2 py-1 font-mono text-micro uppercase tracking-[0.12em] text-accent-bright">
        Simulated data
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-term-line pb-4">
        <div className="flex items-center gap-4">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-term-fg">
            Grit Markets — Account
          </p>
          <StatusPill label="License active" />
        </div>
        <SessionClock />
      </div>

      <div className="grid gap-8 pt-6 md:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <EquityReadout value={equity} />
          <dl className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <dt className="label-micro text-term-faint">Floating P/L</dt>
              <dd
                className={
                  floating >= 0 ? "mt-1 text-gain-bright" : "mt-1 text-loss-bright"
                }
              >
                {floating >= 0 ? "+" : ""}
                {floating.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="label-micro text-term-faint">Recovery level</dt>
              <dd className="mt-1 text-term-fg">
                {maxLevel} <span className="text-term-faint">/ 6 max</span>
              </dd>
            </div>
            <div>
              <dt className="label-micro text-term-faint">Equity stop</dt>
              <dd className="mt-1 text-accent-bright">ARMED −8.0%</dd>
            </div>
            <div>
              <dt className="label-micro text-term-faint">EA version</dt>
              <dd className="mt-1 text-term-fg">v1.0.0</dd>
            </div>
          </dl>
        </div>
        <div>
          <p className="label-micro mb-2 text-term-faint">Open positions</p>
          <PositionsTable rows={rows} />
        </div>
      </div>

      <p className="mt-5 border-t border-term-line pt-3 font-mono text-micro uppercase tracking-[0.12em] text-term-faint">
        {SIMULATED_DATA_LABEL}
      </p>
    </div>
  );
}
