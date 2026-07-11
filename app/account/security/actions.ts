"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminConfigured } from "@/lib/env";
import { checkStepUp, STEP_UP_MESSAGES } from "@/lib/aal";

export async function updateProfile(formData: FormData): Promise<void> {
  const name = String(formData.get("displayName") ?? "").slice(0, 80);
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("profiles")
    .update({ display_name: name || null })
    .eq("id", user.id);
  revalidatePath("/account/security");
}

const prefsSchema = z.object({
  daily_digest: z.boolean(),
  weekly_newsletter: z.boolean(),
  alert_emails: z.boolean(),
});

export async function updateEmailPreferences(formData: FormData): Promise<void> {
  const parsed = prefsSchema.parse({
    daily_digest: formData.get("daily_digest") === "on",
    weekly_newsletter: formData.get("weekly_newsletter") === "on",
    alert_emails: formData.get("alert_emails") === "on",
  });
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("email_preferences").upsert({
    user_id: user.id,
    ...parsed,
    updated_at: new Date().toISOString(),
  });
  revalidatePath("/account/security");
}

/** Change login email — step-up gated; Supabase sends confirmation links. */
export async function changeEmail(
  newEmail: string
): Promise<{ ok: boolean; message: string }> {
  const parsed = z.string().email().safeParse(newEmail);
  if (!parsed.success) return { ok: false, message: "Invalid email address." };
  const supabase = createSupabaseServerClient();
  const stepUp = await checkStepUp(supabase);
  if (stepUp !== "ok") return { ok: false, message: STEP_UP_MESSAGES[stepUp] };
  const { error } = await supabase.auth.updateUser({ email: parsed.data });
  if (error) return { ok: false, message: "Could not start the change." };
  return {
    ok: true,
    message: "Confirmation links sent to both addresses — the change completes when confirmed.",
  };
}

/** Revoke every session except this one. */
export async function signOutOtherSessions(): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "others" });
  revalidatePath("/account/security");
}

/** Mirror MFA enrolment state onto the profile (called after enrol/unenrol). */
export async function syncTotpFlag(): Promise<void> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data } = await supabase.auth.mfa.listFactors();
  const enabled = (data?.totp ?? []).some((f) => f.status === "verified");
  await supabase.from("profiles").update({ totp_enabled: enabled }).eq("id", user.id);
  revalidatePath("/account", "layout");
}

/**
 * Request account deletion: 14-day grace period, then the purge cron cancels
 * billing and hard-deletes the auth user (all rows cascade). Step-up gated.
 */
export async function requestDeletion(): Promise<{ ok: boolean; message: string }> {
  if (!adminConfigured()) return { ok: false, message: "Service not configured." };
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };
  const stepUp = await checkStepUp(supabase);
  if (stepUp !== "ok") return { ok: false, message: STEP_UP_MESSAGES[stepUp] };

  const admin = createSupabaseAdminClient();
  await admin
    .from("profiles")
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq("id", user.id);
  await admin.from("licenses").update({ status: "suspended" }).eq("user_id", user.id);

  await supabase.auth.signOut();
  redirect("/?account=deletion-scheduled");
}

export async function cancelDeletion(): Promise<void> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").update({ deletion_requested_at: null }).eq("id", user.id);
  revalidatePath("/account/security");
}
