import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Step-up authentication enforcement. Sensitive actions (strategy apply,
 * rebind, email change, deletion, telemetry secret regeneration) require a
 * TOTP-verified session (AAL2). Server-side check reads the `aal` claim
 * from the session JWT — never trust the client.
 */
export type StepUpState = "ok" | "step_up_required" | "enroll_required";

export async function checkStepUp(
  supabase: SupabaseClient
): Promise<StepUpState> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return "step_up_required";

  let aal = "aal1";
  try {
    const payload = JSON.parse(
      Buffer.from(session.access_token.split(".")[1], "base64url").toString()
    ) as { aal?: string };
    aal = payload.aal ?? "aal1";
  } catch {
    return "step_up_required";
  }
  if (aal === "aal2") return "ok";

  // AAL1: does the user have a verified TOTP factor to step up with?
  const { data } = await supabase.auth.mfa.listFactors();
  const hasVerified = (data?.totp ?? []).some(
    (f) => f.status === "verified"
  );
  return hasVerified ? "step_up_required" : "enroll_required";
}

export const STEP_UP_MESSAGES: Record<Exclude<StepUpState, "ok">, string> = {
  step_up_required:
    "This action needs two-factor re-authentication. Verify your authenticator code in Account & Security, then retry.",
  enroll_required:
    "This action requires two-factor authentication. Enrol an authenticator app in Account & Security first.",
};
