import { getDashboardContext } from "@/lib/account-data";
import { upsertAlertRule } from "./actions";

export const dynamic = "force-dynamic";

// [OWNER INPUT: confirm default thresholds]
const ALERT_DEFS = [
  {
    type: "margin_level",
    label: "Margin level below",
    unit: "%",
    defaultThreshold: 300,
    help: "Fires when the account's margin level drops under the threshold — the earliest hard signal a recovery sequence is straining the account.",
  },
  {
    type: "drawdown",
    label: "Daily drawdown exceeds",
    unit: "%",
    defaultThreshold: 10,
    help: "Evaluated at the daily rollup against the day's peak-to-trough equity move.",
  },
  {
    type: "ea_offline",
    label: "EA offline for 2+ hours",
    unit: "",
    defaultThreshold: null,
    help: "Fires when an active account stops reporting telemetry — VPS down, terminal closed, or the EA removed.",
  },
] as const;

export default async function AlertsPage() {
  const { supabase, link } = await getDashboardContext();
  if (!link) {
    return (
      <section>
        <h1 className="font-display text-display-md font-medium">Alerts.</h1>
        <p className="mt-6 max-w-xl leading-relaxed text-fg-muted">
          Alerts unlock once an account is linked.
        </p>
      </section>
    );
  }

  const [{ data: rules }, { data: events }] = await Promise.all([
    supabase
      .from("alert_rules")
      .select("id, type, threshold, enabled")
      .eq("account_link_id", link.id),
    supabase
      .from("alert_events")
      .select("fired_at, value, alert_rule_id, alert_rules(type)")
      .order("fired_at", { ascending: false })
      .limit(15),
  ]);

  return (
    <section>
      <h1 className="font-display text-display-md font-medium">Alerts.</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-fg-muted">
        Threshold monitors on your own account&apos;s telemetry. Email delivery
        activates with the transactional email service; fired alerts always
        appear here regardless.
      </p>

      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-5 text-term-faint">Rules</p>
        <div className="space-y-6">
          {ALERT_DEFS.map((def) => {
            const rule = rules?.find((r) => r.type === def.type);
            return (
              <form
                key={def.type}
                action={upsertAlertRule}
                className="flex flex-wrap items-end gap-4 border-b border-term-line/40 pb-5 last:border-0"
              >
                <input type="hidden" name="accountLinkId" value={link.id} />
                <input type="hidden" name="type" value={def.type} />
                <div className="min-w-56 flex-1">
                  <p className="font-mono text-sm text-term-fg">{def.label}</p>
                  <p className="mt-1 max-w-md text-xs leading-relaxed text-term-muted">
                    {def.help}
                  </p>
                </div>
                {def.defaultThreshold != null && (
                  <div>
                    <label htmlFor={`al-${def.type}`} className="label-micro block text-term-faint">
                      Threshold {def.unit}
                    </label>
                    <input
                      id={`al-${def.type}`}
                      name="threshold"
                      type="number"
                      step="1"
                      min="0"
                      defaultValue={rule?.threshold != null ? Number(rule.threshold) : def.defaultThreshold}
                      className="mt-1 w-24 border border-term-line bg-term-bg px-2 py-1.5 font-mono text-xs text-term-fg"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    name="enabled"
                    value="true"
                    className={`border px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] ${rule?.enabled ? "border-gain-bright bg-gain-bright/10 text-gain-bright" : "border-term-line text-term-muted hover:text-gain-bright"}`}
                  >
                    {rule?.enabled ? "Enabled" : "Enable"}
                  </button>
                  <button
                    type="submit"
                    name="enabled"
                    value="false"
                    className={`border px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] ${rule && !rule.enabled ? "border-term-line bg-term-bg text-term-faint" : "border-term-line text-term-muted hover:text-loss-bright"}`}
                  >
                    Off
                  </button>
                </div>
              </form>
            );
          })}
        </div>
      </div>

      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-4 text-term-faint">Recent alert events</p>
        {events && events.length > 0 ? (
          <ul className="space-y-2 font-mono text-xs">
            {events.map((e, i) => (
              <li key={i} className="flex justify-between gap-4 border-b border-term-line/40 pb-2 text-term-muted last:border-0">
                <span className="text-loss-bright">
                  {((e.alert_rules as unknown as { type: string } | null)?.type ?? "alert").replace("_", " ")}
                  {e.value != null ? ` · ${Number(e.value)}` : ""}
                </span>
                <span className="text-term-faint">
                  {new Date(e.fired_at).toLocaleString("en-GB", { hour12: false })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-term-faint">Nothing fired yet.</p>
        )}
      </div>
    </section>
  );
}
