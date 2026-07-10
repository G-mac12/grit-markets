"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginFormInner() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const params = useSearchParams();
  const next = params.get("next") ?? "/account";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      setState(error ? "error" : "sent");
    } catch {
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="panel p-5" role="status">
        <p className="label-micro mb-2 text-accent">Link sent</p>
        <p className="text-sm leading-relaxed text-fg-muted">
          Check your inbox for the sign-in link. It expires after one use.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label htmlFor="email" className="label-micro block">
        Email address
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-line-strong bg-white px-4 py-3 font-mono text-sm text-fg outline-none transition-colors focus:border-accent"
        placeholder="you@example.com"
      />
      <button
        type="submit"
        disabled={state === "sending"}
        className="btn-primary w-full justify-center disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Email me a sign-in link"}
      </button>
      {state === "error" && (
        <p className="text-sm text-loss" role="alert">
          Couldn&apos;t send the link. Check the address and try again.
        </p>
      )}
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={null}>
      <LoginFormInner />
    </Suspense>
  );
}
