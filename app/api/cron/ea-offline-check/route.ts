import { NextRequest, NextResponse } from "next/server";
import { adminConfigured } from "@/lib/env";
import { cronAuthorized } from "@/lib/cron";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Hourly: an active account link with an enabled ea_offline alert and no
 * telemetry for >2h fires an alert event (12h dedupe so a dead EA doesn't
 * page every hour).
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const admin = createSupabaseAdminClient();

  const { data: rules } = await admin
    .from("alert_rules")
    .select("id, account_link_id")
    .eq("type", "ea_offline")
    .eq("enabled", true);

  const twoHoursAgo = Date.now() - 2 * 3600_000;
  const twelveHoursAgo = new Date(Date.now() - 12 * 3600_000).toISOString();
  let fired = 0;

  for (const rule of rules ?? []) {
    const { data: link } = await admin
      .from("account_links")
      .select("status")
      .eq("id", rule.account_link_id)
      .maybeSingle();
    if (link?.status !== "active") continue;

    const { data: lastSnap } = await admin
      .from("telemetry_snapshots")
      .select("ts")
      .eq("account_link_id", rule.account_link_id)
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!lastSnap) continue; // never reported — nothing to compare against
    if (new Date(lastSnap.ts).getTime() >= twoHoursAgo) continue;

    const { count } = await admin
      .from("alert_events")
      .select("id", { count: "exact", head: true })
      .eq("alert_rule_id", rule.id)
      .gte("fired_at", twelveHoursAgo);
    if ((count ?? 0) > 0) continue;

    const hoursSince =
      (Date.now() - new Date(lastSnap.ts).getTime()) / 3600_000;
    await admin
      .from("alert_events")
      .insert({ alert_rule_id: rule.id, value: Math.round(hoursSince * 10) / 10 });
    fired++;
  }

  return NextResponse.json({ ok: true, fired });
}
