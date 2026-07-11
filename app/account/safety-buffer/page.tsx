import { getDashboardContext, fmtMoney } from "@/lib/account-data";
import {
  createSkimRule,
  deleteSkimRule,
  resolveSkim,
  toggleSkimRule,
} from "./actions";

export const dynamic = "force-dynamic";

const TRIGGER_LABELS: Record<string, string> = {
  equity_above_hwm_pct: "Equity exceeds high-water mark by %",
  realized_profit_amount: "Daily realized profit exceeds amount",
  weekly: "Every Friday with a profitable day",
};

export default async function SafetyBufferPage() {
  const { supabase, link } = await getDashboardContext();
  if (!link) {
    return (
      <section>
        <h1 className="font-display text-display-md font-medium">Safety Buffer.</h1>
        <p className="mt-6 max-w-xl leading-relaxed text-fg-muted">
          Link an account to start building your reserve rules.
        </p>
      </section>
    );
  }
  const ccy = link.account_currency;

  const [{ data: rules }, { data: ledger }, { data: latest }] = await Promise.all([
    supabase
      .from("skim_rules")
      .select("id, trigger, threshold_value, skim_pct, enabled")
      .eq("account_link_id", link.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("skim_ledger")
      .select("id, created_at, recommended_amount, status, confirmed_amount, note")
      .eq("account_link_id", link.id)
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("telemetry_snapshots")
      .select("equity")
      .eq("account_link_id", link.id)
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const confirmedTotal = (ledger ?? [])
    .filter((l) => l.status === "confirmed")
    .reduce((a, l) => a + Number(l.confirmed_amount ?? 0), 0);
  const equity = latest ? Number(latest.equity) : null;
  const ratio = equity && equity > 0 ? (confirmedTotal / equity) * 100 : null;
  const pending = (ledger ?? []).filter((l) => l.status === "recommended");

  return (
    <section>
      <h1 className="font-display text-display-md font-medium">
        Safety Buffer <span className="text-fg-faint">(&ldquo;Black Swan Reserve&rdquo;)</span>.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-fg-muted">
        A recommendation engine running on <strong className="text-fg">your</strong>{" "}
        rules: when a rule triggers, it suggests an amount to withdraw at your
        broker. You make the withdrawal yourself and confirm it here — this
        platform never holds, moves, or instructs movement of funds, and
        nothing on this page is investment advice.
      </p>

      {/* headline */}
      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="term-panel p-4">
          <dt className="label-micro text-term-faint">Protected balance (confirmed)</dt>
          <dd className="mt-1 font-mono text-lg text-gain-bright">{fmtMoney(confirmedTotal, ccy)}</dd>
        </div>
        <div className="term-panel p-4">
          <dt className="label-micro text-term-faint">Buffer / current equity</dt>
          <dd className="mt-1 font-mono text-lg text-accent-bright">
            {ratio == null ? "—" : `${ratio.toFixed(1)}%`}
          </dd>
        </div>
        <div className="term-panel p-4">
          <dt className="label-micro text-term-faint">Awaiting your decision</dt>
          <dd className="mt-1 font-mono text-lg text-term-fg">{pending.length}</dd>
        </div>
      </dl>

      {/* recommendation feed */}
      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-4 text-term-faint">Recommendation feed</p>
        {ledger && ledger.length > 0 ? (
          <ul className="space-y-4">
            {ledger.map((l) => (
              <li key={l.id} className="border-b border-term-line/40 pb-4 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-mono text-xs text-term-muted">
                    <span className="text-term-fg">{fmtMoney(l.recommended_amount, ccy)}</span>{" "}
                    recommended · {new Date(l.created_at).toLocaleDateString("en-GB")}
                    {l.note ? ` · ${l.note}` : ""}
                  </div>
                  {l.status === "recommended" ? (
                    <form action={resolveSkim} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="ledgerId" value={l.id} />
                      <label htmlFor={`amt-${l.id}`} className="sr-only">
                        Amount withdrawn at broker
                      </label>
                      <input
                        id={`amt-${l.id}`}
                        name="confirmedAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        defaultValue={Number(l.recommended_amount)}
                        className="w-28 border border-term-line bg-term-bg px-2 py-1 font-mono text-xs text-term-fg"
                      />
                      <button
                        type="submit"
                        name="action"
                        value="confirm"
                        className="border border-gain-bright/50 px-2 py-1 font-mono text-micro uppercase tracking-[0.1em] text-gain-bright hover:bg-gain-bright/10"
                      >
                        I withdrew this
                      </button>
                      <button
                        type="submit"
                        name="action"
                        value="dismiss"
                        className="border border-term-line px-2 py-1 font-mono text-micro uppercase tracking-[0.1em] text-term-faint hover:text-loss-bright"
                      >
                        Dismiss
                      </button>
                    </form>
                  ) : (
                    <span className={`font-mono text-micro uppercase tracking-[0.1em] ${l.status === "confirmed" ? "text-gain-bright" : "text-term-faint"}`}>
                      {l.status === "confirmed"
                        ? `confirmed ${fmtMoney(l.confirmed_amount, ccy)}`
                        : "dismissed"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-term-faint">
            No recommendations yet — they appear after the daily rollup when a
            rule below triggers.
          </p>
        )}
      </div>

      {/* rule builder */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="term-panel p-5 md:p-6">
          <p className="label-micro mb-4 text-term-faint">Your rules</p>
          {rules && rules.length > 0 ? (
            <ul className="space-y-3">
              {rules.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-term-line/40 pb-3 last:border-0">
                  <span className="font-mono text-xs text-term-muted">
                    {TRIGGER_LABELS[r.trigger]}{" "}
                    <span className="text-term-fg">
                      {r.trigger === "weekly" ? "" : Number(r.threshold_value)}
                      {r.trigger === "equity_above_hwm_pct" ? "%" : ""}
                    </span>{" "}
                    → skim <span className="text-accent-bright">{Number(r.skim_pct)}%</span>
                  </span>
                  <span className="flex gap-2">
                    <form action={toggleSkimRule}>
                      <input type="hidden" name="ruleId" value={r.id} />
                      <input type="hidden" name="enabled" value={String(r.enabled)} />
                      <button type="submit" className={`border px-2 py-1 font-mono text-micro uppercase tracking-[0.1em] ${r.enabled ? "border-gain-bright/50 text-gain-bright" : "border-term-line text-term-faint"}`}>
                        {r.enabled ? "On" : "Off"}
                      </button>
                    </form>
                    <form action={deleteSkimRule}>
                      <input type="hidden" name="ruleId" value={r.id} />
                      <button type="submit" className="border border-term-line px-2 py-1 font-mono text-micro uppercase tracking-[0.1em] text-term-faint hover:text-loss-bright">
                        Delete
                      </button>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-xs text-term-faint">No rules yet — add your first below.</p>
          )}

          <form action={createSkimRule} className="mt-6 space-y-3 border-t border-term-line pt-5">
            <input type="hidden" name="accountLinkId" value={link.id} />
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor="sb-trigger" className="label-micro block text-term-faint">Trigger</label>
                <select id="sb-trigger" name="trigger" className="mt-1 w-full border border-term-line bg-term-bg px-2 py-1.5 font-mono text-xs text-term-fg">
                  <option value="equity_above_hwm_pct">Equity above HWM %</option>
                  <option value="realized_profit_amount">Daily profit amount</option>
                  <option value="weekly">Weekly (Fridays)</option>
                </select>
              </div>
              <div>
                <label htmlFor="sb-threshold" className="label-micro block text-term-faint">Threshold</label>
                <input id="sb-threshold" name="threshold" type="number" step="0.5" min="0" defaultValue={5} className="mt-1 w-full border border-term-line bg-term-bg px-2 py-1.5 font-mono text-xs text-term-fg" />
              </div>
              <div>
                <label htmlFor="sb-skim" className="label-micro block text-term-faint">Skim %</label>
                <input id="sb-skim" name="skimPct" type="number" step="5" min="1" max="100" defaultValue={50} className="mt-1 w-full border border-term-line bg-term-bg px-2 py-1.5 font-mono text-xs text-term-fg" />
              </div>
            </div>
            <button type="submit" className="border border-accent-bright/60 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-accent-bright hover:bg-accent-bright/10">
              Add rule
            </button>
            <p className="font-mono text-micro uppercase tracking-[0.1em] text-term-faint">
              [OWNER INPUT: default rule set to suggest at onboarding]
            </p>
          </form>
        </div>

        {/* educational panel */}
        <div className="panel p-5 md:p-6">
          <p className="label-micro mb-3">Why skim a Martingale account</p>
          <div className="space-y-3 text-sm leading-relaxed text-fg-muted">
            <p>
              A Martingale account&apos;s equity curve tends to grind upward and
              then give back a chunk in one deep sequence. Money moved off the
              account after good runs is money that worst-case sequence can
              never touch.
            </p>
            <p>
              Regular skimming converts paper progress into realised cash and
              caps your true exposure at whatever remains on the account. The
              buffer-to-exposure ratio above is the honest number: how much
              you have actually banked versus what is still at risk.
            </p>
            <p>
              These rules are yours. The engine only does arithmetic on the
              telemetry your EA reports; whether to withdraw, and how much, is
              always your decision at your broker.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
