"use client";

import { useState, useTransition } from "react";
import { getDownloadUrl, rebindLicense, signOut } from "./actions";

export function CopyKey({ licenseKey }: { licenseKey: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="border border-term-line bg-term-bg px-3 py-2 font-mono text-sm text-term-fg">
        {licenseKey}
      </code>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(licenseKey);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
        className="border border-term-line px-3 py-2 font-mono text-micro uppercase tracking-[0.12em] text-term-muted transition-colors hover:border-accent-bright hover:text-accent-bright"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function RebindButton({
  licenseId,
  account,
}: {
  licenseId: string;
  account: string;
}) {
  const [pending, start] = useTransition();
  return (
    <form
      action={(fd) => start(() => rebindLicense(fd))}
      className="inline"
    >
      <input type="hidden" name="licenseId" value={licenseId} />
      <input type="hidden" name="account" value={account} />
      <button
        type="submit"
        disabled={pending}
        className="font-mono text-micro uppercase tracking-[0.12em] text-term-faint underline-offset-4 hover:text-loss-bright hover:underline disabled:opacity-50"
      >
        {pending ? "Unbinding…" : "Unbind"}
      </button>
    </form>
  );
}

export function DownloadButton({ version }: { version: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await getDownloadUrl(version);
            if (res.url) window.location.href = res.url;
            else setError(res.error ?? "failed");
          })
        }
        className="border border-term-line px-3 py-1.5 font-mono text-micro uppercase tracking-[0.12em] text-term-fg transition-colors hover:border-accent-bright hover:text-accent-bright disabled:opacity-50"
      >
        {pending ? "Preparing…" : `Download v${version}`}
      </button>
      {error && (
        <span className="font-mono text-micro uppercase text-loss-bright">
          {error === "not_available" ? "build not uploaded yet" : error}
        </span>
      )}
    </span>
  );
}

export function PortalButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await fetch("/api/portal", { method: "POST" });
          const json = (await res.json()) as { url?: string };
          if (json.url) window.location.href = json.url;
        })
      }
      className="btn-primary px-4 py-2 text-xs disabled:opacity-50"
    >
      {pending ? "Opening…" : "Manage billing"}
    </button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="font-mono text-micro uppercase tracking-[0.12em] text-fg-faint hover:text-accent"
      >
        Sign out
      </button>
    </form>
  );
}
