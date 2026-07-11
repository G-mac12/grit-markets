import { NextResponse } from "next/server";
import { authConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * UK GDPR data portability: self-service JSON export of every row we hold
 * for the signed-in user. All reads run under the user's own RLS-scoped
 * session — the export can only ever contain their data.
 */
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  if (!authConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const [
    profile,
    preferences,
    subscriptions,
    licenses,
    accountLinks,
    snapshots,
    trades,
    summaries,
    skimRules,
    skimLedger,
    strategySettings,
    settingsAudit,
    alertRules,
    downloads,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("email_preferences").select("*").maybeSingle(),
    supabase.from("subscriptions").select("*"),
    supabase.from("licenses").select("id, license_key, status, max_accounts, mt5_account_numbers, last_validated_at, created_at"),
    supabase.from("account_links").select("*"),
    supabase.from("telemetry_snapshots").select("*").order("ts", { ascending: false }).limit(50000),
    supabase.from("trades").select("*").limit(50000),
    supabase.from("daily_summaries").select("*"),
    supabase.from("skim_rules").select("*"),
    supabase.from("skim_ledger").select("*"),
    supabase.from("strategy_settings").select("*"),
    supabase.from("settings_audit").select("*"),
    supabase.from("alert_rules").select("*"),
    supabase.from("downloads").select("*"),
  ]);

  const body = {
    exported_at: new Date().toISOString(),
    controller: "Grit Agility Ltd (SC837399, Scotland, UK)",
    user: { id: user.id, email: user.email },
    profile: profile.data,
    email_preferences: preferences.data,
    subscriptions: subscriptions.data,
    licenses: licenses.data,
    account_links: accountLinks.data,
    telemetry_snapshots: snapshots.data,
    trades: trades.data,
    daily_summaries: summaries.data,
    skim_rules: skimRules.data,
    skim_ledger: skimLedger.data,
    strategy_settings: strategySettings.data,
    settings_audit: settingsAudit.data,
    alert_rules: alertRules.data,
    downloads: downloads.data,
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="grit-markets-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
