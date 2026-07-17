import Link from "next/link";
import { redirect } from "next/navigation";
import { authConfigured } from "@/lib/env";
import { requireOwner } from "@/lib/owner";
import { RISK_WARNING } from "@/lib/site";

export const metadata = { title: "Admin — Grit Markets", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * Owner-only admin shell. Role + AAL2 (TOTP step-up) enforced server-side
 * on the layout AND re-checked inside every server action.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!authConfigured()) redirect("/");
  const gate = await requireOwner();
  if (!gate.ok) {
    if (gate.reason === "unauthenticated") redirect("/login?next=/admin");
    if (gate.reason === "not_owner") redirect("/account");
    // step_up: explain rather than bounce, so the owner knows what to do
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <p className="label-micro mb-4">Admin</p>
        <h1 className="font-display text-display-md font-medium">
          Two-factor check required.
        </h1>
        <p className="mt-4 leading-relaxed text-fg-muted">
          The admin area needs a TOTP-verified session. Go to{" "}
          <Link href="/account/security" className="text-accent underline">
            Account &amp; Security
          </Link>{" "}
          and verify your authenticator code, then come back to /admin.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-site px-5 py-12 md:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="label-micro">Grit Markets — Admin</p>
          <p className="mt-1 font-mono text-xs text-fg-faint">
            Signed in as {gate.email} · owner · 2FA verified
          </p>
        </div>
        <Link
          href="/account"
          className="font-mono text-micro uppercase tracking-[0.1em] text-fg-muted hover:text-accent"
        >
          ← Back to dashboard
        </Link>
      </div>
      {children}
      <p className="mt-12 border-t border-line pt-4 font-mono text-micro uppercase tracking-[0.12em] text-fg-faint">
        {RISK_WARNING}
      </p>
    </div>
  );
}
