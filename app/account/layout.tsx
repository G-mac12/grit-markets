import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardContext, fmtMoney } from "@/lib/account-data";
import { RISK_WARNING } from "@/lib/site";
import { StatusPill, SessionClock } from "@/components/dashboard/DashboardPreview";
import { selectAccount } from "./select-account";
import { SignOutButton } from "./ui";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/analytics", label: "P&L Analytics" },
  { href: "/account/safety-buffer", label: "Safety Buffer" },
  { href: "/account/strategy", label: "Strategy Settings" },
  { href: "/account/costs", label: "Costs & ROI" },
  { href: "/account/alerts", label: "Alerts" },
  { href: "/account/licenses", label: "Licenses & Downloads" },
  { href: "/account/security", label: "Account & Security" },
  { href: "/account/billing", label: "Billing" },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user, links, link } = await getDashboardContext();

  // top-strip live figures for the selected account
  let equity: number | null = null;
  let marginLevel: number | null = null;
  let lastSeen: string | null = null;
  if (link) {
    const { data: snap } = await supabase
      .from("telemetry_snapshots")
      .select("equity, margin_level_pct, ts")
      .eq("account_link_id", link.id)
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (snap) {
      equity = Number(snap.equity);
      marginLevel = snap.margin_level_pct == null ? null : Number(snap.margin_level_pct);
      lastSeen = snap.ts;
    }
  }
  const online = lastSeen
    ? Date.now() - new Date(lastSeen).getTime() < 15 * 60_000
    : false;
  const marginTone =
    marginLevel == null || marginLevel <= 0 || marginLevel >= 500;

  return (
    <div className="mx-auto max-w-site px-5 pb-24 pt-24 md:px-10">
      {/* top strip */}
      <div className="term-panel flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex flex-wrap items-center gap-4">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-term-fg">
            Grit Markets — Terminal
          </p>
          {links.length > 0 && (
            <form action={selectAccount} className="flex items-center gap-2">
              <label htmlFor="acct-select" className="sr-only">
                Account
              </label>
              <select
                id="acct-select"
                name="accountLinkId"
                defaultValue={link?.id}
                className="border border-term-line bg-term-bg px-2 py-1 font-mono text-xs text-term-fg"
              >
                {links.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.mt5_account}
                    {l.is_demo ? " · demo" : " · live"}
                    {l.broker_label ? ` · ${l.broker_label}` : ""}
                  </option>
                ))}
              </select>
              <button type="submit" className="border border-term-line px-2 py-1 font-mono text-micro uppercase tracking-[0.1em] text-term-muted hover:border-accent-bright hover:text-accent-bright">
                Switch
              </button>
            </form>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {equity != null && (
            <span className="font-mono text-sm text-term-fg">
              EQ {fmtMoney(equity, link?.account_currency)}
            </span>
          )}
          {marginLevel != null && marginLevel > 0 && (
            <span className={`font-mono text-xs ${marginTone ? "text-gain-bright" : "text-loss-bright"}`}>
              ML {marginLevel.toFixed(0)}%
            </span>
          )}
          <StatusPill
            label={online ? "EA online" : lastSeen ? "EA offline" : "No telemetry"}
            tone={online ? "active" : "warn"}
          />
          <SessionClock />
        </div>
      </div>

      {/* persistent risk strip — always visible, never dismissible */}
      <p className="border-x border-b border-line bg-paper-dark px-4 py-2 font-mono text-micro uppercase tracking-[0.08em] text-fg-faint">
        Self-directed tools on your own rules — not investment advice.
        Martingale sizing can produce large drawdowns and total loss of
        capital.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[13rem_1fr]">
        <aside>
          <nav aria-label="Dashboard" className="lg:sticky lg:top-24">
            <ul className="flex flex-wrap gap-1 lg:flex-col">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block border border-transparent px-3 py-2 font-mono text-xs uppercase tracking-[0.1em] text-fg-muted transition-colors hover:border-line hover:text-fg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line px-3 pt-4">
              <p className="mb-2 truncate font-mono text-micro text-fg-faint">{user.email}</p>
              <SignOutButton />
            </div>
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>

      <div className="mt-16 border border-line bg-paper-card p-5">
        <p className="label-micro mb-2 text-loss">Risk warning</p>
        <p className="text-sm leading-relaxed text-fg-muted">{RISK_WARNING}</p>
      </div>
    </div>
  );
}
