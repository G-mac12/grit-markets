import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, emailConfigured } from "@/lib/env";
import { cronAuthorized } from "@/lib/cron";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendDailyDigest, type DigestAccountRow } from "@/lib/email";

/**
 * Daily digest, ~07:00 UK (06:00 UTC schedule; UK summer offset accepted).
 * Numbers-first email per user: yesterday's summaries across their linked
 * accounts, any un-notified alert events (flushed here and stamped
 * notified_at), and pending skim recommendations. Opt-out via
 * email_preferences.daily_digest (default ON). Runs after daily-rollup.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ALERT_LABELS: Record<string, (v: number | null) => string> = {
  margin_level: (v) => `Margin level fell to ${v ?? "?"}% — below your alert threshold.`,
  drawdown: (v) => `Daily drawdown reached ${v == null ? "?" : Number(v).toFixed(1)}%.`,
  ea_offline: (v) => `EA silent for ${v ?? "?"} hours on an active account.`,
};

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  if (!emailConfigured()) {
    // digest is meaningless without email — succeed quietly until Resend lands
    return NextResponse.json({ ok: true, skipped: "email_not_configured" });
  }
  const admin = createSupabaseAdminClient();

  const now = new Date();
  const dayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dateStr = new Date(dayEnd.getTime() - 24 * 3600_000).toISOString().slice(0, 10);

  const { data: links } = await admin
    .from("account_links")
    .select("id, user_id, mt5_account, broker_label, account_currency, is_demo")
    .eq("status", "active");
  if (!links || links.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  const byUser = new Map<string, typeof links>();
  for (const l of links) {
    const arr = byUser.get(l.user_id) ?? [];
    arr.push(l);
    byUser.set(l.user_id, arr);
  }

  let sent = 0;
  for (const [userId, userLinks] of Array.from(byUser.entries())) {
    const { data: pref } = await admin
      .from("email_preferences")
      .select("daily_digest")
      .eq("user_id", userId)
      .maybeSingle();
    if (pref && pref.daily_digest === false) continue;

    const { data: profile } = await admin
      .from("profiles")
      .select("email, deletion_requested_at")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.email || profile.deletion_requested_at) continue;

    const rows: DigestAccountRow[] = [];
    const alerts: string[] = [];
    const notifiedIds: number[] = [];

    for (const link of userLinks) {
      const { data: summary } = await admin
        .from("daily_summaries")
        .select("realized_pl, ending_balance, max_drawdown_pct, trades_closed, skim_recommended")
        .eq("account_link_id", link.id)
        .eq("date", dateStr)
        .maybeSingle();
      if (summary) {
        rows.push({
          label: `${link.broker_label ?? "MT5"} ${link.mt5_account}${link.is_demo ? " (demo)" : ""}`,
          currency: link.account_currency,
          realized: Number(summary.realized_pl),
          endingBalance: summary.ending_balance == null ? null : Number(summary.ending_balance),
          maxDrawdownPct: summary.max_drawdown_pct == null ? null : Number(summary.max_drawdown_pct),
          tradesClosed: summary.trades_closed,
          skimRecommended: summary.skim_recommended == null ? null : Number(summary.skim_recommended),
        });
      }

      // un-notified alert events for this link's rules ride along in the
      // digest (Hobby plan has no hourly cron for immediate sends)
      const { data: events } = await admin
        .from("alert_events")
        .select("id, value, rule:alert_rules(type, account_link_id)")
        .is("notified_at", null)
        .returns<{ id: number; value: number | null; rule: { type: string; account_link_id: string } | null }[]>();
      for (const e of events ?? []) {
        const rule = e.rule;
        if (!rule || rule.account_link_id !== link.id) continue;
        const label = ALERT_LABELS[rule.type];
        if (label) {
          alerts.push(`${link.broker_label ?? "MT5"} ${link.mt5_account}: ${label(e.value)}`);
          notifiedIds.push(e.id);
        }
      }
    }

    if (rows.length === 0 && alerts.length === 0) continue;

    await sendDailyDigest(profile.email, dateStr, rows, alerts);
    if (notifiedIds.length > 0) {
      await admin
        .from("alert_events")
        .update({ notified_at: new Date().toISOString() })
        .in("id", notifiedIds);
    }
    sent++;
  }

  return NextResponse.json({ ok: true, date: dateStr, sent });
}
