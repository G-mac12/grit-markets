"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/lib/site";

/**
 * Checkout-aware CTA: uses Stripe Checkout when billing is live, falls back
 * to the early-access mailto while it isn't, and routes signed-out visitors
 * through login first.
 */
export function PricingCTA({
  tier,
  tierName,
  featured,
}: {
  tier: string;
  tierName: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const go = async () => {
    setPending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (res.status === 401) {
        router.push("/login?next=/pricing");
        return;
      }
      const json = (await res.json()) as { url?: string };
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      // billing not configured yet → early access by email
      window.location.href = `mailto:${SITE.supportEmail}?subject=Grit Markets ${tierName} — early access`;
    } catch {
      window.location.href = `mailto:${SITE.supportEmail}?subject=Grit Markets ${tierName} — early access`;
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={go}
      disabled={pending}
      className={`${featured ? "btn-primary" : "btn-ghost"} mt-8 justify-center disabled:opacity-60`}
    >
      {pending ? "One moment…" : "Subscribe"}
    </button>
  );
}
