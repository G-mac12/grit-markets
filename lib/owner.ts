import { createSupabaseServerClient } from "./supabase/server";
import { checkStepUp } from "./aal";

/**
 * /admin gate: owner role + a TOTP-verified (AAL2) session, both checked
 * server-side. The role lives in profiles.role and is only ever assigned
 * manually in the Supabase SQL editor.
 */
export type OwnerGate =
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: "unauthenticated" | "not_owner" | "step_up" };

export async function requireOwner(): Promise<OwnerGate> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "unauthenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle<{ role: string; email: string }>();
  if (profile?.role !== "owner") return { ok: false, reason: "not_owner" };

  if ((await checkStepUp(supabase)) !== "ok") {
    return { ok: false, reason: "step_up" };
  }
  return { ok: true, userId: user.id, email: profile.email };
}
