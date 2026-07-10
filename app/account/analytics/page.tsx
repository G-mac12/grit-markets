import { getDashboardContext, fmtSigned } from "@/lib/account-data";
import { Histogram, PnlHeatmap } from "@/components/dashboard/charts";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const { supabase, link } = await getDashboardContext();
  if (!link) {
    return (
      <section>
        <h1 className="font-display text-display-md font-medium">P&amp;L Analytics.</h1>
        <p className="mt-6 max-w-xl leading-relaxed text-fg-muted">
          Analytics unlock once an account is linked and reporting telemetry.
        </p>
      </section>
    );
  }
  const ccy = link.account_currency;

  const [{ data: summaries }, { data: trades }] = await Promise.all([
    supabase
      .from("daily_summaries")
      .select("date, realized_pl, max_drawdown_pct, trades_closed, win_count")
      .eq("account_link_id", link.id)
      .order("date", { ascending: false })
      .limit(370),
    supabase
      .from("trades")
      .select("symbol, profit, commission, swap, sequence_level")
      .eq("account_link_id", link.id)
      .not("close_time", "is", null)
      .limit(10000),
  ]);

  const all = trades ?? [];
  const totalTrades = all.length;
  const wins = all.filter((t) => Number(t.profit) > 0).length;
  const winRate = totalTrades ? (wins / totalTrades) * 100 : null;

  // per-symbol breakdown
  const bySymbol = new Map<string, { n: number; net: number }>();
  for (const t of all) {
    const cur = bySymbol.get(t.symbol) ?? { n: 0, net: 0 };
    cur.n++;
    cur.net += Number(t.profit) + Number(t.commission) + Number(t.swap);
    bySymbol.set(t.symbol, cur);
  }

  // sequence-depth histogram — honest exposure visibility
  const depthCounts = new Map<number, number>();
  for (const t of all) {
    if (t.sequence_level != null) {
      depthCounts.set(t.sequence_level, (depthCounts.get(t.sequence_level) ?? 0) + 1);
    }
  }
  const depthBuckets = Array.from(depthCounts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([lvl, count]) => ({ label: `level ${lvl}`, count }));

  const maxDD = Math.max(0, ...(summaries ?? []).map((s) => Number(s.max_drawdown_pct ?? 0)));
  const weeklyNet = (summaries ?? [])
    .slice(0, 7)
    .reduce((a, s) => a + Number(s.realized_pl), 0);
  const monthlyNet = (summaries ?? [])
    .slice(0, 30)
    .reduce((a, s) => a + Number(s.realized_pl), 0);

  return (
    <section>
      <h1 className="font-display text-display-md font-medium">P&amp;L Analytics.</h1>

      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l: "7-day realized", v: fmtSigned(weeklyNet, ccy), tone: weeklyNet >= 0 },
          { l: "30-day realized", v: fmtSigned(monthlyNet, ccy), tone: monthlyNet >= 0 },
          { l: "Win rate (closed)", v: winRate == null ? "—" : `${winRate.toFixed(1)}%`, tone: true },
          { l: "Max daily drawdown", v: `${maxDD.toFixed(1)}%`, tone: false },
        ].map((c) => (
          <div key={c.l} className="term-panel p-4">
            <dt className="label-micro text-term-faint">{c.l}</dt>
            <dd className={`mt-1 font-mono text-lg ${c.tone ? "text-term-fg" : "text-loss-bright"}`}>
              {c.v}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 font-mono text-micro uppercase tracking-[0.1em] text-fg-faint">
        Historical figures describe this account&apos;s past only — they do not
        predict future results.
      </p>

      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-4 text-term-faint">Daily P&amp;L — last 13 weeks</p>
        <PnlHeatmap days={(summaries ?? []).map((s) => ({ date: s.date, realized_pl: Number(s.realized_pl) }))} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="term-panel p-5 md:p-6">
          <p className="label-micro mb-4 text-term-faint">
            Sequence depth — how deep the ladder has actually gone
          </p>
          {depthBuckets.length > 0 ? (
            <Histogram buckets={depthBuckets} />
          ) : (
            <p className="font-mono text-xs text-term-faint">No sequence data yet.</p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-term-muted">
            Every closed trade tagged with its recovery level. A healthy
            distribution is heavily weighted to level 1–2; frequent deep
            levels mean your settings are being stress-tested by the market.
          </p>
        </div>
        <div className="term-panel p-5 md:p-6">
          <p className="label-micro mb-4 text-term-faint">Per-symbol net (after costs)</p>
          {bySymbol.size > 0 ? (
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="border-b border-term-line text-left text-term-faint">
                  <th className="py-2 font-normal uppercase tracking-[0.1em]">Symbol</th>
                  <th className="py-2 text-right font-normal uppercase tracking-[0.1em]">Trades</th>
                  <th className="py-2 text-right font-normal uppercase tracking-[0.1em]">Net</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(bySymbol.entries()).map(([sym, v]) => (
                  <tr key={sym} className="border-b border-term-line/40 text-term-muted">
                    <td className="py-2 text-term-fg">{sym}</td>
                    <td className="py-2 text-right">{v.n}</td>
                    <td className={`py-2 text-right ${v.net >= 0 ? "text-gain-bright" : "text-loss-bright"}`}>
                      {fmtSigned(v.net, ccy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="font-mono text-xs text-term-faint">No closed trades yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
