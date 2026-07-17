"use client";

import { useState, useTransition } from "react";
import { Simulator } from "@/components/simulator/Simulator";
import type { AbstractProfile } from "@/lib/strategy";
import { submitRiskProfile, type StrategyActionResult } from "./actions";

/**
 * Risk-profile picker (constraint 6). Raw strategy parameters never reach
 * the client: the cards below carry only server-computed abstractions, and
 * submission sends a profile key which the server maps to raw params.
 * Submission requires TOTP step-up, enforced server-side.
 */
export function StrategyForm({
  accountLinkId,
  currentProfile,
  accountBalance,
  profiles,
}: {
  accountLinkId: string;
  currentProfile: string | null;
  accountBalance: number | null;
  profiles: AbstractProfile[];
}) {
  const [selected, setSelected] = useState<string>(
    currentProfile ?? "balanced"
  );
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [result, setResult] = useState<StrategyActionResult | null>(null);
  const [pending, start] = useTransition();

  const fmtExposure = (x: number) =>
    Math.abs(x - 1) < 0.05 ? "baseline" : `≈${x.toFixed(1)}× Balanced`;

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="sr-only">Risk profile</legend>
        <div className="grid gap-4 md:grid-cols-3">
          {profiles.map((p) => {
            const active = selected === p.key;
            return (
              <label
                key={p.key}
                className={`block cursor-pointer border p-4 transition-colors ${
                  active
                    ? "border-accent-bright bg-term-bg"
                    : "border-term-line hover:border-term-muted"
                }`}
              >
                <input
                  type="radio"
                  name="risk-profile"
                  value={p.key}
                  checked={active}
                  onChange={() => setSelected(p.key)}
                  className="sr-only"
                />
                <p
                  className={`font-mono text-xs font-bold uppercase tracking-[0.14em] ${
                    active ? "text-accent-bright" : "text-term-fg"
                  }`}
                >
                  {p.label}
                  {currentProfile === p.key && (
                    <span className="ml-2 text-gain-bright">· applied</span>
                  )}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-term-muted">
                  {p.description}
                </p>
                <dl className="mt-3 space-y-1 font-mono text-micro uppercase tracking-[0.08em] text-term-faint">
                  <div className="flex justify-between">
                    <dt>Equity stop</dt>
                    <dd className="text-accent-bright">−{p.equityStopPct}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Worst-case exposure</dt>
                    <dd>{fmtExposure(p.exposureVsBalanced)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Ladder</dt>
                    <dd>
                      {p.depth} · {p.spacing} spacing
                    </dd>
                  </div>
                </dl>
              </label>
            );
          })}
        </div>
      </fieldset>

      {selected === "aggressive" && (
        <div className="border border-loss-bright/40 bg-term-bg p-4" role="status">
          <p className="font-mono text-xs leading-relaxed text-term-muted">
            — Aggressive tolerates a deeper account drawdown before the equity
            stop flattens the sequence, and commits meaningfully more capital
            in a worst-case ladder. Only choose this if you have read the risk
            guide and sized your account for it.
          </p>
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
          disabled={pending || selected === currentProfile}
          onClick={() =>
            start(async () => {
              setResult(await submitRiskProfile(accountLinkId, selected));
            })
          }
          className="btn-primary px-4 py-2 text-xs disabled:opacity-50"
        >
          {pending
            ? "Submitting…"
            : selected === currentProfile
              ? "Already applied"
              : "Submit to EA (requires 2FA)"}
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
            Seeded with your current balance and the engine&apos;s published
            shipped configuration (the Balanced profile). Profile parameter
            details stay server-side; the cards above show each profile&apos;s
            risk character relative to this baseline. Simulated results — they
            do not predict live performance.
          </p>
          <Simulator initial={{ startBalance: accountBalance ?? 10_000 }} />
        </div>
      )}
    </div>
  );
}
