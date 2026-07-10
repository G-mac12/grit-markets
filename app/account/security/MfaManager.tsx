"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useCallback, useEffect, useState } from "react";
import { syncTotpFlag } from "./actions";

interface Factor {
  id: string;
  status: string;
  friendly_name?: string | null;
}

/**
 * TOTP enrolment + step-up verification. Enrolment shows a QR (and the
 * plain secret for manual entry); verification upgrades the session to AAL2,
 * which the server requires for sensitive actions.
 */
export function MfaManager() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [factors, setFactors] = useState<Factor[]>([]);
  const [aal, setAal] = useState<string>("aal1");
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors((data?.totp ?? []) as Factor[]);
    const { data: aalData } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    setAal(aalData?.currentLevel ?? "aal1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verified = factors.filter((f) => f.status === "verified");

  const startEnroll = async () => {
    setBusy(true);
    setMsg(null);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `authenticator-${Date.now()}`,
    });
    setBusy(false);
    if (error || !data) {
      setMsg("Could not start enrolment.");
      return;
    }
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirm = async (factorId: string) => {
    setBusy(true);
    setMsg(null);
    const { data: challenge, error: cErr } = await supabase.auth.mfa.challenge({ factorId });
    if (cErr || !challenge) {
      setBusy(false);
      setMsg("Challenge failed — try again.");
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim(),
    });
    setBusy(false);
    setCode("");
    if (error) {
      setMsg("Wrong code — check your authenticator and try again.");
      return;
    }
    setEnroll(null);
    setMsg("Verified. This session is now step-up authenticated (AAL2).");
    await syncTotpFlag();
    await refresh();
  };

  const unenroll = async (factorId: string) => {
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    await syncTotpFlag();
    await refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
        <span className="text-term-muted">
          Two-factor:{" "}
          {verified.length > 0 ? (
            <span className="text-gain-bright">enabled</span>
          ) : (
            <span className="text-loss-bright">not enrolled</span>
          )}
        </span>
        <span className="text-term-muted">
          This session:{" "}
          <span className={aal === "aal2" ? "text-gain-bright" : "text-accent-bright"}>
            {aal === "aal2" ? "step-up verified" : "standard (aal1)"}
          </span>
        </span>
      </div>
      <p className="mt-2 max-w-lg text-xs leading-relaxed text-term-muted">
        Strategy changes, license rebinding, telemetry secrets, email changes
        and account deletion all require a step-up verified session.
      </p>

      {verified.length === 0 && !enroll && (
        <button
          type="button"
          disabled={busy}
          onClick={startEnroll}
          className="mt-4 border border-accent-bright/60 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-accent-bright hover:bg-accent-bright/10 disabled:opacity-50"
        >
          Enrol authenticator app
        </button>
      )}

      {enroll && (
        <div className="mt-4 max-w-md border border-term-line p-4">
          <p className="label-micro mb-3 text-term-faint">
            Scan with your authenticator, then enter the 6-digit code
          </p>
          <div
            className="inline-block bg-white p-2 [&>svg]:h-40 [&>svg]:w-40"
            dangerouslySetInnerHTML={{ __html: enroll.qr }}
          />
          <p className="mt-2 break-all font-mono text-micro text-term-faint">
            manual key: {enroll.secret}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              aria-label="Authenticator code"
              className="w-28 border border-term-line bg-term-bg px-2 py-1.5 font-mono text-sm text-term-fg"
            />
            <button
              type="button"
              disabled={busy || code.trim().length < 6}
              onClick={() => confirm(enroll.id)}
              className="border border-gain-bright/60 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-gain-bright hover:bg-gain-bright/10 disabled:opacity-50"
            >
              Verify
            </button>
          </div>
        </div>
      )}

      {verified.length > 0 && aal !== "aal2" && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            aria-label="Authenticator code for step-up"
            className="w-28 border border-term-line bg-term-bg px-2 py-1.5 font-mono text-sm text-term-fg"
          />
          <button
            type="button"
            disabled={busy || code.trim().length < 6}
            onClick={() => confirm(verified[0].id)}
            className="border border-accent-bright/60 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-accent-bright hover:bg-accent-bright/10 disabled:opacity-50"
          >
            Step up this session
          </button>
        </div>
      )}

      {verified.length > 0 && (
        <button
          type="button"
          disabled={busy}
          onClick={() => unenroll(verified[0].id)}
          className="mt-4 block border border-term-line px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-term-faint hover:text-loss-bright disabled:opacity-50"
        >
          Remove authenticator
        </button>
      )}

      {msg && (
        <p role="status" className="mt-3 font-mono text-xs text-term-muted">
          {msg}
        </p>
      )}
    </div>
  );
}
