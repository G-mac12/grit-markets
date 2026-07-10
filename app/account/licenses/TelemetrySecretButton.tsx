"use client";

import { useState, useTransition } from "react";
import { regenerateTelemetrySecret } from "./actions";

export function TelemetrySecretButton({
  licenseId,
  hasSecret,
}: {
  licenseId: string;
  hasSecret: boolean;
}) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{
    ok: boolean;
    secret?: string;
    message: string;
  } | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => setResult(await regenerateTelemetrySecret(licenseId)))
        }
        className="border border-term-line px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-term-muted hover:border-accent-bright hover:text-accent-bright disabled:opacity-50"
      >
        {pending
          ? "Generating…"
          : hasSecret
            ? "Regenerate telemetry secret (2FA)"
            : "Issue telemetry secret (2FA)"}
      </button>
      {result && (
        <div className="mt-3" role="status">
          {result.secret && (
            <code className="block max-w-full overflow-x-auto border border-accent-bright/50 bg-term-bg px-3 py-2 font-mono text-sm text-accent-bright">
              {result.secret}
            </code>
          )}
          <p className={`mt-2 font-mono text-xs ${result.ok ? "text-term-muted" : "text-loss-bright"}`}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}
