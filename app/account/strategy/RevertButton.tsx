"use client";

import { useState, useTransition } from "react";
import { revertStrategySettings, type StrategyActionResult } from "./actions";

export function RevertButton({ accountLinkId }: { accountLinkId: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<StrategyActionResult | null>(null);
  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => setResult(await revertStrategySettings(accountLinkId)))
        }
        className="border border-term-line px-2 py-1 font-mono text-micro uppercase tracking-[0.1em] text-term-muted hover:border-accent-bright hover:text-accent-bright disabled:opacity-50"
      >
        {pending ? "Reverting…" : "Revert to previous version"}
      </button>
      {result && (
        <span className={`font-mono text-micro ${result.ok ? "text-gain-bright" : "text-loss-bright"}`}>
          {result.message}
        </span>
      )}
    </span>
  );
}
