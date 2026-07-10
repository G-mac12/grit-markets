import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { decryptSecret, verifyHmac } from "@/lib/crypto";

/**
 * POST /api/telemetry — the data spine. The EA pushes every 5 minutes while
 * running and immediately on trade close.
 *
 * Auth: license key in the payload + HMAC-SHA256 signature over the raw body
 * (X-GM-Signature header) using the per-license telemetry secret issued in
 * the dashboard. Never accepts broker credentials of any kind.
 *
 * Response: { ok, pending_settings, ack_ticket } — the settings-sync leg:
 * the EA applies pending settings only when flat/base-level and confirms by
 * echoing settings_version on its next push.
 */
export const dynamic = "force-dynamic";

const MIN_PUSH_INTERVAL_MS = 45_000; // rate limit per account link

const tradeSchema = z.object({
  ticket: z.number().int().positive(),
  symbol: z.string().min(1).max(20),
  direction: z.enum(["buy", "sell"]),
  lots: z.number().positive(),
  open_time: z.string().datetime().nullish(),
  close_time: z.string().datetime().nullish(),
  open_price: z.number().nullish(),
  close_price: z.number().nullish(),
  profit: z.number(),
  commission: z.number().default(0),
  swap: z.number().default(0),
  sequence_level: z.number().int().min(1).max(20).nullish(),
});

const payloadSchema = z.object({
  license_key: z.string().regex(/^GM(-[A-Z2-9]{5}){4}$/),
  mt5_account: z.string().regex(/^\d{3,12}$/),
  is_demo: z.boolean(),
  broker_label: z.string().max(60).nullish(),
  account_currency: z.string().length(3).nullish(),
  settings_version: z.number().int().nullish(),
  snapshot: z.object({
    balance: z.number(),
    equity: z.number(),
    margin: z.number().min(0),
    free_margin: z.number(),
    margin_level_pct: z.number().nullable(),
    open_positions_count: z.number().int().min(0),
    floating_pl: z.number(),
  }),
  trades: z.array(tradeSchema).max(200).default([]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!adminConfigured()) {
    return NextResponse.json({ ok: false, reason: "service_unavailable" }, { status: 503 });
  }

  const raw = await req.text();
  if (raw.length > 256_000) {
    return NextResponse.json({ ok: false, reason: "payload_too_large" }, { status: 413 });
  }

  let parsed: z.infer<typeof payloadSchema>;
  try {
    parsed = payloadSchema.parse(JSON.parse(raw));
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // license + secret
  const { data: license } = await admin
    .from("licenses")
    .select("id, user_id, status, mt5_account_numbers, telemetry_secret_enc")
    .eq("license_key", parsed.license_key)
    .maybeSingle();
  if (!license || license.status !== "active") {
    return NextResponse.json({ ok: false, reason: "license_invalid" }, { status: 401 });
  }
  if (!license.telemetry_secret_enc) {
    return NextResponse.json({ ok: false, reason: "telemetry_secret_not_issued" }, { status: 401 });
  }
  const signature = req.headers.get("x-gm-signature") ?? "";
  let secret: string;
  try {
    secret = decryptSecret(license.telemetry_secret_enc);
  } catch {
    return NextResponse.json({ ok: false, reason: "server_error" }, { status: 500 });
  }
  if (!verifyHmac(raw, signature, secret)) {
    return NextResponse.json({ ok: false, reason: "bad_signature" }, { status: 401 });
  }

  // account must be bound to this license (binding happens via /api/license/validate)
  if (!license.mt5_account_numbers.includes(parsed.mt5_account)) {
    return NextResponse.json({ ok: false, reason: "account_not_bound" }, { status: 403 });
  }

  // account_link: create on first telemetry, then enforce demo/live consistency
  let { data: link } = await admin
    .from("account_links")
    .select("id, is_demo, status")
    .eq("license_id", license.id)
    .eq("mt5_account", parsed.mt5_account)
    .maybeSingle();
  if (!link) {
    const { data: created, error } = await admin
      .from("account_links")
      .insert({
        user_id: license.user_id,
        license_id: license.id,
        mt5_account: parsed.mt5_account,
        broker_label: parsed.broker_label ?? null,
        account_currency: parsed.account_currency ?? "USD",
        is_demo: parsed.is_demo,
      })
      .select("id, is_demo, status")
      .single();
    if (error || !created) {
      return NextResponse.json({ ok: false, reason: "link_failed" }, { status: 500 });
    }
    link = created;
  }
  if (link.status !== "active") {
    return NextResponse.json({ ok: false, reason: "account_unlinked" }, { status: 403 });
  }
  if (link.is_demo !== parsed.is_demo) {
    return NextResponse.json({ ok: false, reason: "demo_live_mismatch" }, { status: 409 });
  }

  // rate limit per account link
  const { data: lastSnap } = await admin
    .from("telemetry_snapshots")
    .select("ts")
    .eq("account_link_id", link.id)
    .order("ts", { ascending: false })
    .limit(1)
    .maybeSingle();
  const hasTrades = parsed.trades.length > 0;
  if (
    lastSnap &&
    !hasTrades && // trade-close pushes are always accepted
    Date.now() - new Date(lastSnap.ts).getTime() < MIN_PUSH_INTERVAL_MS
  ) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  const s = parsed.snapshot;
  await admin.from("telemetry_snapshots").insert({
    account_link_id: link.id,
    balance: s.balance,
    equity: s.equity,
    margin: s.margin,
    free_margin: s.free_margin,
    margin_level_pct: s.margin_level_pct,
    open_positions_count: s.open_positions_count,
    floating_pl: s.floating_pl,
  });

  // idempotent trade ingestion by (account_link_id, mt5_ticket)
  if (hasTrades) {
    await admin.from("trades").upsert(
      parsed.trades.map((t) => ({
        account_link_id: link.id,
        mt5_ticket: t.ticket,
        symbol: t.symbol,
        direction: t.direction,
        lots: t.lots,
        open_time: t.open_time ?? null,
        close_time: t.close_time ?? null,
        open_price: t.open_price ?? null,
        close_price: t.close_price ?? null,
        profit: t.profit,
        commission: t.commission,
        swap: t.swap,
        sequence_level: t.sequence_level ?? null,
      })),
      { onConflict: "account_link_id,mt5_ticket", ignoreDuplicates: true }
    );
  }
  const { data: maxTicketRow } = await admin
    .from("trades")
    .select("mt5_ticket")
    .eq("account_link_id", link.id)
    .order("mt5_ticket", { ascending: false })
    .limit(1)
    .maybeSingle();

  // settings sync: confirm application, then report anything still pending
  if (parsed.settings_version != null) {
    await admin
      .from("strategy_settings")
      .update({ status: "applied", applied_at: new Date().toISOString() })
      .eq("account_link_id", link.id)
      .eq("version", parsed.settings_version)
      .eq("status", "pending");
  }
  const { data: pending } = await admin
    .from("strategy_settings")
    .select("version, params")
    .eq("account_link_id", link.id)
    .eq("status", "pending")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  // margin-level alert evaluated inline (6h dedupe window)
  if (s.margin_level_pct != null) {
    const { data: rule } = await admin
      .from("alert_rules")
      .select("id, threshold")
      .eq("account_link_id", link.id)
      .eq("type", "margin_level")
      .eq("enabled", true)
      .maybeSingle();
    if (rule && rule.threshold != null && s.margin_level_pct < rule.threshold) {
      const sixHoursAgo = new Date(Date.now() - 6 * 3600_000).toISOString();
      const { count } = await admin
        .from("alert_events")
        .select("id", { count: "exact", head: true })
        .eq("alert_rule_id", rule.id)
        .gte("fired_at", sixHoursAgo);
      if ((count ?? 0) === 0) {
        await admin
          .from("alert_events")
          .insert({ alert_rule_id: rule.id, value: s.margin_level_pct });
      }
    }
  }

  await admin.from("license_events").insert({
    license_id: license.id,
    event: "telemetry",
    mt5_account: parsed.mt5_account,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
  });

  return NextResponse.json({
    ok: true,
    pending_settings: pending
      ? { version: pending.version, params: pending.params }
      : null,
    ack_ticket: maxTicketRow?.mt5_ticket ?? 0,
  });
}
