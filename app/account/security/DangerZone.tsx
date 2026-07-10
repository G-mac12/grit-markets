"use client";

import { useState, useTransition } from "react";
import { changeEmail, requestDeletion } from "./actions";

export function EmailChanger({ current }: { current: string }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      <p className="font-mono text-xs text-term-muted">
        Login email: <span className="text-term-fg">{current}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="new@email.com"
          aria-label="New email address"
          className="w-64 border border-term-line bg-term-bg px-2 py-1.5 font-mono text-xs text-term-fg"
        />
        <button
          type="button"
          disabled={pending || !email}
          onClick={() => start(async () => setMsg(await changeEmail(email)))}
          className="border border-term-line px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-term-muted hover:border-accent-bright hover:text-accent-bright disabled:opacity-50"
        >
          Change email (2FA)
        </button>
      </div>
      {msg && (
        <p role="status" className={`mt-2 font-mono text-xs ${msg.ok ? "text-gain-bright" : "text-loss-bright"}`}>
          {msg.message}
        </p>
      )}
    </div>
  );
}

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="border border-loss-bright/50 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-loss-bright hover:bg-loss-bright/10"
        >
          Delete my account
        </button>
      ) : (
        <div className="border border-loss-bright/50 p-4">
          <p className="max-w-md text-xs leading-relaxed text-term-muted">
            This schedules permanent deletion after a 14-day grace period:
            subscription cancelled, licenses revoked, every row of your data
            purged. Signing back in within 14 days lets you cancel it.
            Requires a step-up (2FA) verified session.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await requestDeletion();
                  if (res && !res.ok) setMsg(res.message);
                })
              }
              className="border border-loss-bright bg-loss-bright/10 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-loss-bright disabled:opacity-50"
            >
              {pending ? "Scheduling…" : "Schedule deletion"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="border border-term-line px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-term-muted"
            >
              Keep my account
            </button>
          </div>
          {msg && (
            <p role="alert" className="mt-2 font-mono text-xs text-loss-bright">
              {msg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
