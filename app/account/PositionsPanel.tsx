import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fmtSigned } from "@/lib/account-data";

/**
 * Recent activity panel: telemetry reports position COUNT and floating P/L
 * (per-position detail isn't pushed — data minimisation), so the table shows
 * the latest closed trades under the live headline numbers.
 */
export async function PositionsPanel({
  openCount,
  floatingPl,
  ccy,
  accountLinkId,
}: {
  openCount: number;
  floatingPl: number;
  ccy: string;
  accountLinkId: string;
}) {
  const supabase = createSupabaseServerClient();
  const { data: recent } = await supabase
    .from("trades")
    .select("mt5_ticket, symbol, direction, lots, close_time, profit, sequence_level")
    .eq("account_link_id", accountLinkId)
    .not("close_time", "is", null)
    .order("close_time", { ascending: false })
    .limit(8);

  return (
    <div className="term-panel p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-term-line pb-3">
        <p className="label-micro text-term-faint">Positions</p>
        <p className="font-mono text-xs text-term-muted">
          {openCount} open · floating{" "}
          <span className={floatingPl >= 0 ? "text-gain-bright" : "text-loss-bright"}>
            {fmtSigned(floatingPl, ccy)}
          </span>
        </p>
      </div>
      {recent && recent.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="mt-3 w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-term-line text-left text-term-faint">
                <th className="py-2 pr-4 font-normal uppercase tracking-[0.1em]">Closed</th>
                <th className="py-2 pr-4 font-normal uppercase tracking-[0.1em]">Symbol</th>
                <th className="py-2 pr-4 font-normal uppercase tracking-[0.1em]">Side</th>
                <th className="py-2 pr-4 text-right font-normal uppercase tracking-[0.1em]">Lots</th>
                <th className="py-2 pr-4 text-right font-normal uppercase tracking-[0.1em]">Level</th>
                <th className="py-2 text-right font-normal uppercase tracking-[0.1em]">P/L</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.mt5_ticket} className="border-b border-term-line/40 text-term-muted">
                  <td className="py-2 pr-4">
                    {t.close_time ? new Date(t.close_time).toLocaleString("en-GB", { hour12: false, timeZone: "UTC" }) : "—"}
                  </td>
                  <td className="py-2 pr-4 text-term-fg">{t.symbol}</td>
                  <td className={`py-2 pr-4 ${t.direction === "buy" ? "text-gain-bright" : "text-loss-bright"}`}>
                    {t.direction.toUpperCase()}
                  </td>
                  <td className="py-2 pr-4 text-right">{Number(t.lots).toFixed(2)}</td>
                  <td className="py-2 pr-4 text-right">{t.sequence_level ?? "—"}</td>
                  <td className={`py-2 text-right ${Number(t.profit) >= 0 ? "text-gain-bright" : "text-loss-bright"}`}>
                    {fmtSigned(t.profit, ccy)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 font-mono text-xs text-term-faint">
          No closed trades reported yet.
        </p>
      )}
    </div>
  );
}
