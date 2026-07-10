import Link from "next/link";
import { getDashboardContext, fmtMoney } from "@/lib/account-data";
import { strategyParamsSchema, type StrategyParams } from "@/lib/strategy";
import { StrategyForm } from "./StrategyForm";
import { RevertButton } from "./RevertButton";

export const dynamic = "force-dynamic";

export default async function StrategyPage() {
  const { supabase, link } = await getDashboardContext();
  if (!link) {
    return (
      <section>
        <h1 className="font-display text-display-md font-medium">Strategy Settings.</h1>
        <p className="mt-6 max-w-xl leading-relaxed text-fg-muted">
          Settings sync unlocks once an account is linked and reporting.
        </p>
      </section>
    );
  }

  const [{ data: versions }, { data: latestSnap }, { data: audit }] =
    await Promise.all([
      supabase
        .from("strategy_settings")
        .select("version, params, status, created_at, applied_at, previous_version")
        .eq("account_link_id", link.id)
        .order("version", { ascending: false })
        .limit(12),
      supabase
        .from("telemetry_snapshots")
        .select("balance")
        .eq("account_link_id", link.id)
        .order("ts", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("settings_audit")
        .select("created_at, change")
        .eq("account_link_id", link.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const applied = versions?.find((v) => v.status === "applied");
  const pending = versions?.find((v) => v.status === "pending");
  const pendingStale =
    pending &&
    Date.now() - new Date(pending.created_at).getTime() > 48 * 3600_000;

  let currentParams: StrategyParams | null = null;
  if (applied) {
    const parsed = strategyParamsSchema.safeParse(applied.params);
    if (parsed.success) currentParams = parsed.data;
  }

  return (
    <section>
      <h1 className="font-display text-display-md font-medium">Strategy Settings.</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-fg-muted">
        Changes queue for the EA and are applied only when no recovery
        sequence is open — never mid-ladder. Every change is bounds-checked
        server-side, audited, and requires two-factor re-authentication.
        These are your own configuration choices for your own software, not
        advice.
      </p>

      {/* status timeline */}
      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-4 text-term-faint">Status</p>
        <div className="flex flex-wrap items-center gap-6 font-mono text-xs">
          <span className="text-term-muted">
            Applied:{" "}
            <span className="text-gain-bright">
              {applied ? `v${applied.version}` : "EA defaults (no synced version)"}
            </span>
          </span>
          <span className="text-term-muted">
            Pending:{" "}
            {pending ? (
              <span className="text-accent-bright">
                v{pending.version} — waiting for flat state
                {pendingStale ? " (48h+ — the EA hasn't reached a flat state yet; it will apply when it does)" : ""}
              </span>
            ) : (
              <span className="text-term-faint">none</span>
            )}
          </span>
          {applied?.previous_version && <RevertButton accountLinkId={link.id} />}
        </div>
      </div>

      {/* editor */}
      <div className="term-panel scanlines mt-8 p-5 md:p-6">
        <p className="label-micro mb-5 text-term-faint">
          Propose new version {`v${(versions?.[0]?.version ?? 0) + 1}`} · balance{" "}
          {fmtMoney(latestSnap?.balance, link.account_currency)}
        </p>
        <StrategyForm
          accountLinkId={link.id}
          current={currentParams}
          accountBalance={latestSnap ? Number(latestSnap.balance) : null}
        />
        <p className="mt-5 border-t border-term-line pt-4 font-mono text-micro uppercase tracking-[0.1em] text-term-faint">
          [OWNER INPUT: confirm parameter bounds and remotely editable set] ·
          2FA enrolment lives in{" "}
          <Link href="/account/security" className="text-accent-bright underline">
            Account &amp; Security
          </Link>
        </p>
      </div>

      {/* history + audit */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="term-panel p-5 md:p-6">
          <p className="label-micro mb-4 text-term-faint">Version history</p>
          {versions && versions.length > 0 ? (
            <ul className="space-y-2 font-mono text-xs">
              {versions.map((v) => (
                <li key={v.version} className="flex justify-between gap-3 border-b border-term-line/40 pb-2 text-term-muted last:border-0">
                  <span>
                    v{v.version} ·{" "}
                    <span className={v.status === "applied" ? "text-gain-bright" : v.status === "pending" ? "text-accent-bright" : "text-term-faint"}>
                      {v.status}
                    </span>
                  </span>
                  <span className="text-term-faint">
                    {new Date(v.applied_at ?? v.created_at).toLocaleString("en-GB", { hour12: false })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-xs text-term-faint">
              No synced versions yet — the EA runs its local inputs until you
              submit one.
            </p>
          )}
        </div>
        <div className="term-panel p-5 md:p-6">
          <p className="label-micro mb-4 text-term-faint">Audit trail</p>
          {audit && audit.length > 0 ? (
            <ul className="space-y-2 font-mono text-xs">
              {audit.map((a, i) => (
                <li key={i} className="border-b border-term-line/40 pb-2 text-term-muted last:border-0">
                  {new Date(a.created_at).toLocaleString("en-GB", { hour12: false })} —{" "}
                  {(a.change as { action?: string }).action ?? "change"} v
                  {(a.change as { version?: number }).version ?? "?"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-xs text-term-faint">Empty.</p>
          )}
        </div>
      </div>
    </section>
  );
}
