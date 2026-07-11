import { NextRequest, NextResponse } from "next/server";
import { adminConfigured } from "@/lib/env";
import { cronAuthorized } from "@/lib/cron";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Daily rollup (runs shortly after UTC day close):
 *  - compute daily_summaries per active account link for yesterday
 *  - evaluate skim rules → skim_ledger recommendations
 *  - evaluate drawdown alert rules against the day's max drawdown
 *  - retention pruning: telemetry >24 months, license_events >90 days
 *
 * The skim engine is a RECOMMENDATION ledger only — the platform never
 * holds, moves, or instructs movement of funds.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const admin = createSupabaseAdminClient();

  const now = new Date();
  const dayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayStart = new Date(dayEnd.getTime() - 24 * 3600_000);
  const dateStr = dayStart.toISOString().slice(0, 10);

  const { data: links } = await admin
    .from("account_links")
    .select("id")
    .eq("status", "active");

  let processed = 0;
  for (const link of links ?? []) {
    const { data: snaps } = await admin
      .from("telemetry_snapshots")
      .select("ts, balance, equity, margin_level_pct, floating_pl, margin")
      .eq("account_link_id", link.id)
      .gte("ts", dayStart.toISOString())
      .lt("ts", dayEnd.toISOString())
      .order("ts", { ascending: true });
    if (!snaps || snaps.length === 0) continue;

    const { data: dayTrades } = await admin
      .from("trades")
      .select("profit, commission, swap")
      .eq("account_link_id", link.id)
      .gte("close_time", dayStart.toISOString())
      .lt("close_time", dayEnd.toISOString());

    const first = snaps[0];
    const last = snaps[snaps.length - 1];
    let peak = -Infinity;
    let maxDD = 0;
    let maxMarginUsed = 0;
    for (const s of snaps) {
      peak = Math.max(peak, Number(s.equity));
      if (peak > 0) maxDD = Math.max(maxDD, ((peak - Number(s.equity)) / peak) * 100);
      if (s.margin_level_pct != null && Number(s.margin_level_pct) > 0) {
        maxMarginUsed = Math.max(maxMarginUsed, 10000 / Number(s.margin_level_pct));
      }
    }
    const realized = (dayTrades ?? []).reduce(
      (a, t) => a + Number(t.profit) + Number(t.commission) + Number(t.swap),
      0
    );
    const wins = (dayTrades ?? []).filter((t) => Number(t.profit) > 0).length;

    // ---- skim engine
    let skimRecommended: number | null = null;
    const { data: rules } = await admin
      .from("skim_rules")
      .select("id, trigger, threshold_value, skim_pct")
      .eq("account_link_id", link.id)
      .eq("enabled", true);
    for (const rule of rules ?? []) {
      let base = 0;
      if (rule.trigger === "realized_profit_amount") {
        if (realized >= Number(rule.threshold_value)) base = realized;
      } else if (rule.trigger === "equity_above_hwm_pct") {
        const { data: hwmRow } = await admin
          .from("daily_summaries")
          .select("ending_balance")
          .eq("account_link_id", link.id)
          .order("ending_balance", { ascending: false })
          .limit(1)
          .maybeSingle();
        const hwm = Number(hwmRow?.ending_balance ?? first.balance);
        if (Number(last.equity) >= hwm * (1 + Number(rule.threshold_value) / 100)) {
          base = Number(last.equity) - hwm;
        }
      } else if (rule.trigger === "weekly") {
        if (dayStart.getUTCDay() === 5 && realized > 0) base = realized; // Fridays
      }
      if (base > 0) {
        const amount = Math.round(base * (Number(rule.skim_pct) / 100) * 100) / 100;
        if (amount >= 1) {
          skimRecommended = (skimRecommended ?? 0) + amount;
          await admin.from("skim_ledger").insert({
            account_link_id: link.id,
            recommended_amount: amount,
            note: `rule:${rule.trigger} on ${dateStr}`,
          });
        }
      }
    }

    await admin.from("daily_summaries").upsert(
      {
        account_link_id: link.id,
        date: dateStr,
        starting_balance: first.balance,
        ending_balance: last.balance,
        realized_pl: realized,
        floating_pl_eod: last.floating_pl,
        max_drawdown_pct: maxDD,
        max_margin_used_pct: maxMarginUsed || null,
        trades_closed: dayTrades?.length ?? 0,
        win_count: wins,
        skim_recommended: skimRecommended,
      },
      { onConflict: "account_link_id,date" }
    );

    // ---- drawdown alert
    const { data: ddRule } = await admin
      .from("alert_rules")
      .select("id, threshold")
      .eq("account_link_id", link.id)
      .eq("type", "drawdown")
      .eq("enabled", true)
      .maybeSingle();
    if (ddRule?.threshold != null && maxDD >= Number(ddRule.threshold)) {
      await admin
        .from("alert_events")
        .insert({ alert_rule_id: ddRule.id, value: maxDD });
    }

    processed++;
  }

  // ---- retention pruning
  const telemetryCutoff = new Date(now.getTime() - 24 * 30.44 * 24 * 3600_000).toISOString();
  await admin.from("telemetry_snapshots").delete().lt("ts", telemetryCutoff);
  const eventsCutoff = new Date(now.getTime() - 90 * 24 * 3600_000).toISOString();
  await admin.from("license_events").delete().lt("created_at", eventsCutoff);

  return NextResponse.json({ ok: true, date: dateStr, accounts: processed });
}
