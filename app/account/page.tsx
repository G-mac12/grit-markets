import Link from "next/link";
import { getDashboardContext, fmtMoney, fmtSigned } from "@/lib/account-data";
import { EquityCurve, MarginGauge } from "@/components/dashboard/charts";
import { PositionsPanel } from "./PositionsPanel";
import { OnboardingChecklist } from "./OnboardingChecklist";

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: { range?: string };
}) {
  const { supabase, link } = await getDashboardContext();

  if (!link) {
    return (
      <section>
        <h1 className="font-display text-display-md font-medium">Overview.</h1>
        <div className="panel mt-8 max-w-2xl p-6">
          <p className="leading-relaxed text-fg-muted">
            No MT5 account is linked yet. Once your license is active and the
            EA validates from your terminal, the account binds automatically
            and telemetry starts flowing here.{" "}
            <Link href="/account/licenses" className="text-accent underline">
              Licenses &amp; Downloads
            </Link>{" "}
            has your key and the setup steps.
          </p>
        </div>
        <OnboardingChecklist />
      </section>
    );
  }

  const ranges: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, all: 3650 };
  const range = searchParams.range && ranges[searchParams.range] ? searchParams.range : "7d";
  const since = new Date(Date.now() - ranges[range] * 24 * 3600_000).toISOString();

  const [{ data: snaps }, { data: latest }, { data: todayTrades }, { data: skim }] =
    await Promise.all([
      supabase
        .from("telemetry_snapshots")
        .select("ts, equity")
        .eq("account_link_id", link.id)
        .gte("ts", since)
        .order("ts", { ascending: true })
        .limit(2000),
      supabase
        .from("telemetry_snapshots")
        .select("ts, balance, equity, margin_level_pct, floating_pl, open_positions_count")
        .eq("account_link_id", link.id)
        .order("ts", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("trades")
        .select("profit, commission, swap")
        .eq("account_link_id", link.id)
        .gte("close_time", new Date().toISOString().slice(0, 10)),
      supabase
        .from("skim_ledger")
        .select("recommended_amount, confirmed_amount, status")
        .eq("account_link_id", link.id),
    ]);

  const ccy = link.account_currency;
  const todayRealized = (todayTrades ?? []).reduce(
    (a, t) => a + Number(t.profit) + Number(t.commission) + Number(t.swap),
    0
  );
  const protectedTotal = (skim ?? [])
    .filter((s) => s.status === "confirmed")
    .reduce((a, s) => a + Number(s.confirmed_amount ?? 0), 0);
  const bufferRatio =
    latest && Number(latest.equity) > 0
      ? (protectedTotal / Number(latest.equity)) * 100
      : null;
  const online = latest
    ? Date.now() - new Date(latest.ts).getTime() < 15 * 60_000
    : false;

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-display-md font-medium">Overview.</h1>
        <div className="flex gap-3" role="group" aria-label="Equity range">
          {Object.keys(ranges).map((r) => (
            <Link
              key={r}
              href={`/account?range=${r}`}
              aria-current={range === r ? "true" : undefined}
              className={`font-mono text-xs uppercase tracking-[0.1em] ${
                range === r ? "text-accent" : "text-fg-faint hover:text-fg"
              }`}
            >
              {r}
            </Link>
          ))}
        </div>
      </div>

      <OnboardingChecklist />

      <div className="term-panel scanlines mt-8 p-5 md:p-6">
        <EquityCurve points={(snaps ?? []).map((s) => ({ ts: s.ts, equity: Number(s.equity) }))} />
        <dl className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
          <div>
            <dt className="label-micro text-term-faint">Equity</dt>
            <dd className="mt-1 font-mono text-xl text-term-fg">
              {fmtMoney(latest?.equity, ccy)}
            </dd>
          </div>
          <div>
            <dt className="label-micro text-term-faint">Today realized</dt>
            <dd className={`mt-1 font-mono text-xl ${todayRealized >= 0 ? "text-gain-bright" : "text-loss-bright"}`}>
              {fmtSigned(todayRealized, ccy)}
            </dd>
          </div>
          <div>
            <dt className="label-micro text-term-faint">Floating P/L</dt>
            <dd className={`mt-1 font-mono text-xl ${Number(latest?.floating_pl ?? 0) >= 0 ? "text-gain-bright" : "text-loss-bright"}`}>
              {fmtSigned(latest?.floating_pl, ccy)}
            </dd>
          </div>
          <div>
            <dt className="label-micro text-term-faint">EA status</dt>
            <dd className={`mt-1 font-mono text-xl ${online ? "text-gain-bright" : "text-loss-bright"}`}>
              {online ? "ONLINE" : latest ? `LAST ${new Date(latest.ts).toLocaleTimeString("en-GB", { hour12: false, timeZone: "UTC" })}Z` : "NEVER"}
            </dd>
          </div>
        </dl>
        <div className="mt-6 grid gap-6 border-t border-term-line pt-5 md:grid-cols-2">
          <MarginGauge marginLevelPct={latest?.margin_level_pct == null ? null : Number(latest.margin_level_pct)} />
          <div>
            <div className="flex justify-between font-mono text-xs text-term-faint">
              <span>safety buffer / equity</span>
              <span className="text-accent-bright">
                {bufferRatio == null ? "—" : `${bufferRatio.toFixed(1)}%`}
              </span>
            </div>
            <p className="mt-1 font-mono text-micro uppercase tracking-[0.1em] text-term-faint">
              {fmtMoney(protectedTotal, ccy)} confirmed skimmed to date ·{" "}
              <Link href="/account/safety-buffer" className="text-accent-bright underline">
                rules
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <PositionsPanel
          openCount={latest?.open_positions_count ?? 0}
          floatingPl={Number(latest?.floating_pl ?? 0)}
          ccy={ccy}
          accountLinkId={link.id}
        />
      </div>
    </section>
  );
}
