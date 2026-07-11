"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminConfigured } from "@/lib/env";
import { checkStepUp, STEP_UP_MESSAGES } from "@/lib/aal";
import { encryptSecret, generateTelemetrySecret } from "@/lib/crypto";

/**
 * Issue or regenerate the per-license telemetry secret. The plaintext is
 * returned exactly once for the customer to paste into the EA inputs; only
 * the AES-GCM ciphertext is stored. Step-up 2FA required — this credential
 * authenticates data flowing into the dashboard.
 */
export async function regenerateTelemetrySecret(
  licenseId: string
): Promise<{ ok: boolean; secret?: string; message: string }> {
  if (!adminConfigured() || !process.env.TELEMETRY_SECRET_KEY) {
    return { ok: false, message: "Telemetry service not configured yet." };
  }
  if (!z.string().uuid().safeParse(licenseId).success) {
    return { ok: false, message: "Bad request." };
  }
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const stepUp = await checkStepUp(supabase);
  if (stepUp !== "ok") return { ok: false, message: STEP_UP_MESSAGES[stepUp] };

  // ownership via RLS
  const { data: license } = await supabase
    .from("licenses")
    .select("id")
    .eq("id", licenseId)
    .maybeSingle();
  if (!license) return { ok: false, message: "License not found." };

  const secret = generateTelemetrySecret();
  const admin = createSupabaseAdminClient();
  await admin
    .from("licenses")
    .update({ telemetry_secret_enc: encryptSecret(secret) })
    .eq("id", licenseId);
  // security notice email would fire here once Resend is configured

  return {
    ok: true,
    secret,
    message:
      "Copy this secret into the EA's TelemetrySecret input now — it is shown once and never again.",
  };
}
