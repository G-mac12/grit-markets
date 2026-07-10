"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "gm-cookie-consent";

/**
 * Privacy-preserving defaults: no non-essential cookies or analytics load
 * unless the visitor explicitly opts in. Declining (or ignoring) the banner
 * keeps the site fully functional with zero tracking.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const decide = (value: "accepted" | "declined") => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
    // Analytics, if ever added, must check this key before loading.
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-[60] mx-auto max-w-xl border border-line-strong bg-paper-card p-5 shadow-2xl md:left-auto md:right-6"
    >
      <p className="label-micro mb-2">Cookies</p>
      <p className="text-sm leading-relaxed text-fg-muted">
        This site uses no tracking cookies by default. Optional analytics
        cookies load only if you accept. See the{" "}
        <Link href="/legal/privacy" className="text-accent underline">
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => decide("declined")}
          className="btn-ghost px-4 py-2 text-xs"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => decide("accepted")}
          className="btn-primary px-4 py-2 text-xs"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
