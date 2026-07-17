import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Onboarding state machine. States are derived ONLY from server-observed
 * signals (invite created, download logged, first validate call, first
 * telemetry push, account bound, 7 days of telemetry) — never self-reported.
 * The dashboard checklist auto-ticks from this; nudge crons set stalled_*.
 */

export type OnboardingState =
  | "created"
  | "license_issued"
  | "downloaded"
  | "validated"
  | "telemetry_live"
  | "demo_bound"
  | "live_bound"
  | "healthy"
  | "stalled_validation"
  | "stalled_telemetry";

const RANK: Record<OnboardingState, number> = {
  created: 0,
  license_issued: 1,
  downloaded: 2,
  validated: 3,
  stalled_validation: 3, // stall variants sit at their base rank so any
  stalled_telemetry: 4, // real forward signal overrides them
  telemetry_live: 4,
  demo_bound: 5,
  live_bound: 5,
  healthy: 6,
};

/**
 * Move a user forward. Never moves backwards; a real signal at the same
 * rank replaces a stalled_* marker. Service-role writes only.
 */
export async function advanceOnboarding(
  admin: SupabaseClient,
  userId: string,
  next: OnboardingState
): Promise<void> {
  const { data } = await admin
    .from("onboarding_state")
    .select("state")
    .eq("user_id", userId)
    .maybeSingle<{ state: OnboardingState }>();

  const current = data?.state;
  const shouldWrite =
    !current ||
    RANK[next] > RANK[current] ||
    (RANK[next] === RANK[current] && current.startsWith("stalled_"));
  if (!shouldWrite) return;

  await admin.from("onboarding_state").upsert({
    user_id: userId,
    state: next,
    entered_at: new Date().toISOString(),
  });
}

/** Dashboard checklist: label + the fix shown while it's the blocker. */
export const ONBOARDING_STEPS: {
  reachedAt: OnboardingState[];
  label: string;
  fix: string;
}[] = [
  {
    reachedAt: [
      "license_issued", "downloaded", "validated", "telemetry_live",
      "demo_bound", "live_bound", "healthy",
      "stalled_validation", "stalled_telemetry",
    ],
    label: "License issued",
    fix: "Your license key arrives by email when issued. Not received? Contact support.",
  },
  {
    reachedAt: [
      "downloaded", "validated", "telemetry_live",
      "demo_bound", "live_bound", "healthy", "stalled_telemetry",
    ],
    label: "EA downloaded",
    fix: "Download the EA from Licenses & Downloads below.",
  },
  {
    reachedAt: [
      "validated", "telemetry_live", "demo_bound", "live_bound",
      "healthy", "stalled_telemetry",
    ],
    label: "License validated from MT5",
    fix: "Attach the EA to a EURUSD chart. If it removes itself, check Tools → Options → Expert Advisors → Allow WebRequest lists https://gritmarkets.com, and that Algo Trading is enabled.",
  },
  {
    reachedAt: ["telemetry_live", "demo_bound", "live_bound", "healthy"],
    label: "Telemetry flowing",
    fix: "The EA reports in every few minutes once running. If validated but silent, the WebRequest whitelist is the usual culprit — the on-chart panel shows exactly what's missing.",
  },
  {
    reachedAt: ["demo_bound", "live_bound", "healthy"],
    label: "Account bound (demo or live)",
    fix: "Your first telemetry push binds the account automatically. We recommend starting on demo for the first two weeks.",
  },
  {
    reachedAt: ["healthy"],
    label: "7 days of healthy telemetry",
    fix: "Keep the terminal (or VPS) running — this ticks itself after a week of continuous reporting.",
  },
];

export function isStepDone(
  state: OnboardingState | undefined,
  step: (typeof ONBOARDING_STEPS)[number]
): boolean {
  return Boolean(state && step.reachedAt.includes(state));
}
