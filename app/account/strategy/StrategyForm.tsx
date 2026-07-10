"use client";

import { useMemo, useState, useTransition } from "react";
import { Simulator } from "@/components/simulator/Simulator";
import {
  DEFAULT_PARAMS,
  PARAM_BOUNDS,
  riskDeltas,
  type StrategyParams,
} from "@/lib/strategy";
import { submitStrategySettings, type StrategyActionResult } from "./actions";

/**
 * Edit form with live inline risk deltas and a what-if Monte Carlo preview
 * seeded with the account's real balance. Submission requires TOTP step-up,
 * enforced server-side.
 */
export function StrategyForm({
  accountLinkId,
  current,
  accountBalance,
}: {
  accountLinkId: string;
  current: StrategyParams | null;
  accountBalance: number | null;
}) {
  const base = current ?? DEFAULT_PARAMS;
  const [p, setP] = useState<StrategyParams>(base);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [result, setResult] = useState<StrategyActionResult | null>(null);
  const [pending, start] = useTransition();

  const deltas = useMemo(() => riskDeltas(base, p), [base, p]);
  const numField = (key: keyof typeof PARAM_BOUNDS) => {
    const b = PARAM_BOUNDS[key];
    return (
      <div key={key}>
        <div className="flex items-baseline justify-between">
          <label htmlFor={`sp-${key}`} className="label-micro text-term-faint">
            {b.label}
          </label>
          <output className="font-mono text-sm text-accent-bright">
            {p[key]}
          </output>
        </div>
        <input
          id={`sp-${key}`}
          type="range"
          min={b.min}
          max={b.max}
          step={b.step}
          value={p[key]}
          onChange={(e) =>
            setP((v) => ({ ...v, [key]: Number(e.target.value) }))
          }
          className="w-full accent-[#5E71FF]"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        {(Object.keys(PARAM_BOUNDS) as (keyof typeof PARAM_BOUNDS)[]).map(
          numField
        )}
        <div className="flex items-end gap-6">
          {(["session_filter", "news_filter"] as const).map((k) => (
            <label key={k} className="flex items-center gap-2 font-mono text-xs text-term-muted">
              <input
                type="checkbox"
                checked={p[k]}
                onChange={(e) => setP((v) => ({ ...v, [k]: e.target.checked }))}
                className="accent-[#5E71FF]"
              />
              {k === "session_filter" ? "Session filter" : "News filter"}
            </label>
          ))}
        </div>
      </div>

      {deltas.length > 0 && (
        <div className="border border-loss-bright/40 bg-term-bg p-4" role="status">
          <p className="label-micro mb-2 text-loss-bright">What this change does to your risk</p>
          <ul className="space-y-1.5">
            {deltas.map((d, i) => (
              <li key={i} className="font-mono text-xs leading-relaxed text-term-muted">
                — {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => setShowWhatIf((v) => !v)}
          className="border border-term-line px-4 py-2 font-mono text-micro uppercase tracking-[0.1em] text-term-muted hover:border-accent-bright hover:text-accent-bright"
        >
          {showWhatIf ? "Hide what-if preview" : "What-if preview (Monte Carlo)"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setResult(await submitStrategySettings(accountLinkId, p));
            })
          }
          className="btn-primary px-4 py-2 text-xs disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Submit to EA (requires 2FA)"}
        </button>
      </div>

      {result && (
        <p
          role="status"
          className={`font-mono text-xs ${result.ok ? "text-gain-bright" : "text-loss-bright"}`}
        >
          {result.message}
        </p>
      )}

      {showWhatIf && (
        <div>
          <p className="mb-3 text-xs leading-relaxed text-term-muted">
            Seeded with your current balance and proposed sizing. Simulated
            results — they do not predict live performance.
          </p>
          <Simulator
            initial={{
              startBalance: accountBalance ?? 10_000,
              baseLot: p.base_lot,
              multiplier: p.lot_multiplier,
              maxLevels: p.max_levels,
            }}
          />
        </div>
      )}
    </div>
  );
}
