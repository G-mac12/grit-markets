import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, emailConfigured } from "@/lib/env";
import { cronAuthorized } from "@/lib/cron";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendOnboardingNudge, type NudgeKind } from "@/lib/email";
import type { OnboardingState } from "@/lib/onboarding";

/**
 * Onboarding stall detection + the healthy promotion. Daily.
 *
 *  - license_issued/downloaded >24h  → stalled_validation (+ one nudge)
 *  - validated >24h with no telemetry → stalled_telemetry (+ one nudge)
 *  - demo_bound/live_bound >7d with telemetry still flowing → healthy
 *
 * Nudges: max one per state (last_nudged_state), respect the alert_emails
 * preference, and are derived only from server-observed signals.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const DAY_MS = 24 * 3600_000;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!cronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const admin = createSupabaseAdminClient();

  const { data: states } = await admin
    .from("onboarding_state")
    .select("user_id, state, entered_at, last_nudged_state")
    .returns<{
      user_id: string;
      state: OnboardingState;
      entered_at: string;
      last_nudged_state: string | null;
    }[]>();

  let stalled = 0;
  let promoted = 0;
  let nudged = 0;

  for (const row of states ?? []) {
    const age = Date.now() - new Date(row.entered_at).getTime();

    // ---- healthy promotion
    if (
      (row.state === "demo_bound" || row.state === "live_bound") &&
      age >= 7 * DAY_MS
    ) {
      const { data: link } = await admin
        .from("account_links")
        .select("id")
        .eq("user_id", row.user_id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      if (link) {
        const { data: lastSnap } = await admin
          .from("telemetry_snapshots")
          .select("ts")
          .eq("account_link_id", link.id)
          .order("ts", { ascending: false })
          .limit(1)
          .maybeSingle();
        // "still flowing": a snapshot within the last day
        if (lastSnap && Date.now() - new Date(lastSnap.ts).getTime() < DAY_MS) {
          await admin
            .from("onboarding_state")
            .update({ state: "healthy", entered_at: new Date().toISOString() })
            .eq("user_id", row.user_id);
          promoted++;
        }
      }
      continue;
    }

    // ---- stall detection
    let stallState: OnboardingState | null = null;
    let nudgeKind: NudgeKind | null = null;
    // already-stalled states re-enter their branch so a nudge skipped one
    // run (e.g. email not configured yet) still goes out later
    if (
      (row.state === "license_issued" ||
        row.state === "downloaded" ||
        row.state === "stalled_validation") &&
      age >= DAY_MS
    ) {
      stallState = "stalled_validation";
      nudgeKind = "stalled_validation";
    } else if (
      (row.state === "validated" || row.state === "stalled_telemetry") &&
      age >= DAY_MS
    ) {
      stallState = "stalled_telemetry";
      nudgeKind = "stalled_telemetry";
    }
    if (!stallState || !nudgeKind) continue;

    if (row.state !== stallState) {
      // entered_at intentionally NOT reset: it keeps measuring from the
      // last real forward signal, and advanceOnboarding still overrides
      await admin
        .from("onboarding_state")
        .update({ state: stallState })
        .eq("user_id", row.user_id);
      stalled++;
    }

    // one nudge per state, ever
    if (row.last_nudged_state === stallState || !emailConfigured()) continue;

    const { data: pref } = await admin
      .from("email_preferences")
      .select("alert_emails")
      .eq("user_id", row.user_id)
      .maybeSingle();
    if (pref && pref.alert_emails === false) continue;

    const { data: profile } = await admin
      .from("profiles")
      .select("email, deletion_requested_at")
      .eq("id", row.user_id)
      .maybeSingle();
    if (!profile?.email || profile.deletion_requested_at) continue;

    await sendOnboardingNudge(profile.email, nudgeKind);
    await admin
      .from("onboarding_state")
      .update({ last_nudged_state: stallState })
      .eq("user_id", row.user_id);
    nudged++;
  }

  return NextResponse.json({ ok: true, stalled, promoted, nudged });
}
