"use client";

import { useState, useTransition } from "react";
import {
  extendLicense,
  issueLicense,
  publishSchedule,
  resendWelcome,
  revokeLicense,
  type AdminActionResult,
} from "./actions";

/** Client half of the admin tool: issue form + per-license actions. */

function ResultBanner({ result }: { result: AdminActionResult | null }) {
  if (!result) return null;
  return (
    <div
      role="status"
      className={`border p-4 ${result.ok ? "border-gain/50" : "border-loss/50"}`}
    >
      <p className={`font-mono text-xs ${result.ok ? "text-gain" : "text-loss"}`}>
        {result.message}
      </p>
      {result.licenseKey && (
        <div className="mt-3 space-y-2 font-mono text-sm">
          <p>
            <span className="label-micro mr-2">License key</span>
            <span className="bg-paper-dim border border-line px-2 py-1">{result.licenseKey}</span>
          </p>
          {result.telemetrySecret && (
            <p>
              <span className="label-micro mr-2">Telemetry secret</span>
              <span className="bg-paper-dim border border-line px-2 py-1">{result.telemetrySecret}</span>
            </p>
          )}
          <p className="text-xs text-fg-faint">
            Shown once. The welcome email carries the key; the secret is only here.
          </p>
        </div>
      )}
    </div>
  );
}

export function IssueForm() {
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="panel p-5 md:p-6">
      <p className="label-micro mb-4">Issue a manual license</p>
      <form
        action={(fd) => start(async () => setResult(await issueLicense(fd)))}
        className="flex flex-wrap items-end gap-4"
      >
        <label className="block">
          <span className="label-micro">Email</span>
          <input
            name="email"
            type="email"
            required
            className="mt-1 block w-64 border border-line bg-white px-3 py-2 font-mono text-sm"
            placeholder="tester@example.com"
          />
        </label>
        <label className="block">
          <span className="label-micro">Months</span>
          <input
            name="months"
            type="number"
            min={1}
            max={24}
            defaultValue={1}
            required
            className="mt-1 block w-20 border border-line bg-white px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block">
          <span className="label-micro">Max accounts</span>
          <input
            name="maxAccounts"
            type="number"
            min={1}
            max={5}
            defaultValue={1}
            required
            className="mt-1 block w-20 border border-line bg-white px-3 py-2 font-mono text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary px-5 py-2.5 text-xs disabled:opacity-50"
        >
          {pending ? "Issuing…" : "Issue license"}
        </button>
      </form>
      <div className="mt-4">
        <ResultBanner result={result} />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-fg-faint">
        New emails get a Supabase invite (sign-in link) plus the welcome email
        with the key. Existing users keep their login; the license simply
        appears in their dashboard.
      </p>
    </div>
  );
}

export function ScheduleForm({
  currentVersion,
  currentRows,
}: {
  currentVersion: number | null;
  currentRows: number | null;
}) {
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="panel p-5 md:p-6">
      <p className="label-micro mb-2">No-trade schedule</p>
      <p className="mb-4 text-xs leading-relaxed text-fg-faint">
        {currentVersion
          ? `Active: v${currentVersion}${currentRows ? ` · ${currentRows} date rows` : ""}. `
          : "No schedule published yet. "}
        Paste the calendar CSV (GAM_NoTrade format: DATE/WEEK/ISOWEEK rows)
        and publish — every licensed EA fetches the new version automatically
        on its next daily check. Customers never handle files.
      </p>
      <form
        action={(fd) => start(async () => setResult(await publishSchedule(fd)))}
        className="space-y-3"
      >
        <textarea
          name="csv"
          required
          rows={7}
          placeholder={"DATE,01-02,00:00,24:00,RED LOCKOUT\nWEEK,FRI,12:00,24:00,Structural - weekend gap\nISOWEEK,W24,00:00,00:00,RED week overlay"}
          className="w-full border border-line bg-white px-3 py-2 font-mono text-xs"
        />
        <div className="flex flex-wrap items-end gap-3">
          <label className="block grow">
            <span className="label-micro">Notes (what changed)</span>
            <input
              name="notes"
              type="text"
              maxLength={500}
              className="mt-1 block w-full border border-line bg-white px-3 py-2 font-mono text-sm"
              placeholder="e.g. 2027 refresh from the 16.5-year study"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="btn-primary px-5 py-2.5 text-xs disabled:opacity-50"
          >
            {pending ? "Publishing…" : "Publish schedule"}
          </button>
        </div>
      </form>
      <div className="mt-4">
        <ResultBanner result={result} />
      </div>
    </div>
  );
}

export function RowActions({ licenseId }: { licenseId: string }) {
  const [result, setResult] = useState<AdminActionResult | null>(null);
  const [pending, start] = useTransition();
  const btn =
    "border border-line px-2.5 py-1 font-mono text-micro uppercase tracking-[0.08em] text-fg-muted hover:border-accent hover:text-accent disabled:opacity-40";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className={btn}
          onClick={() => start(async () => setResult(await extendLicense(licenseId, 1)))}
        >
          +1 month
        </button>
        <button
          type="button"
          disabled={pending}
          className={btn}
          onClick={() => start(async () => setResult(await resendWelcome(licenseId)))}
        >
          Resend welcome
        </button>
        <button
          type="button"
          disabled={pending}
          className={`${btn} hover:border-loss hover:text-loss`}
          onClick={() => {
            if (window.confirm("Revoke this license? The EA stops opening new sequences at its next check."))
              start(async () => setResult(await revokeLicense(licenseId)));
          }}
        >
          Revoke
        </button>
      </div>
      {result && (
        <p
          role="status"
          className={`mt-2 font-mono text-micro ${result.ok ? "text-gain" : "text-loss"}`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
