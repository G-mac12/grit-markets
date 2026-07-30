"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireOwner } from "@/lib/owner";
import { generateLicenseKey } from "@/lib/license";
import { encryptSecret, generateTelemetrySecret } from "@/lib/crypto";
import { advanceOnboarding } from "@/lib/onboarding";
import { sendManualLicenseWelcome } from "@/lib/email";

/**
 * Admin manual-issue tool (milestone 2). Owner role + AAL2 enforced on
 * every action; everything audited to license_events. Licenses issued here
 * are source='manual' with an expires_at — the Stripe migration path later
 * attaches a subscription to the same license row.
 */

export interface AdminActionResult {
  ok: boolean;
  message: string;
  /** Shown ONCE on issue — never retrievable again. */
  licenseKey?: string;
  telemetrySecret?: string;
}

async function gate(): Promise<
  { denied: AdminActionResult; ownerId?: never } | { ownerId: string; denied?: never }
> {
  if (!adminConfigured()) {
    return { denied: { ok: false, message: "Supabase admin is not configured." } };
  }
  const owner = await requireOwner();
  if (!owner.ok) {
    return {
      denied: {
        ok: false,
        message:
          owner.reason === "step_up"
            ? "Two-factor re-authentication required — verify your code in Account & Security, then retry."
            : "Not authorised.",
      },
    };
  }
  return { ownerId: owner.userId };
}

const issueSchema = z.object({
  email: z.string().email(),
  months: z.coerce.number().int().min(1).max(24),
  maxAccounts: z.coerce.number().int().min(1).max(5),
});

export async function issueLicense(
  formData: FormData
): Promise<AdminActionResult> {
  const g = await gate();
  if (g.denied) return g.denied;

  const parsed = issueSchema.safeParse({
    email: formData.get("email"),
    months: formData.get("months"),
    maxAccounts: formData.get("maxAccounts"),
  });
  if (!parsed.success) return { ok: false, message: "Check the form values." };
  const { email, months, maxAccounts } = parsed.data;

  const admin = createSupabaseAdminClient();

  // find or invite the user (Supabase sends the invite email itself, so
  // this works before Resend is configured)
  let userId: string;
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", email)
    .maybeSingle<{ id: string }>();
  if (existing) {
    userId = existing.id;
  } else {
    const { data: invited, error } = await admin.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://gritmarkets.com"}/account` }
    );
    if (error || !invited.user) {
      return { ok: false, message: `Invite failed: ${error?.message}` };
    }
    userId = invited.user.id;
    // the on_auth_user_created trigger creates the profile row
  }

  const licenseKey = generateLicenseKey();
  const telemetrySecret = generateTelemetrySecret();
  let secretEnc: string | null = null;
  try {
    secretEnc = encryptSecret(telemetrySecret);
  } catch {
    // TELEMETRY_SECRET_KEY missing: issue anyway; secret can be regenerated
  }
  const expiresAt = new Date(
    Date.now() + months * 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: license, error: insertErr } = await admin
    .from("licenses")
    .insert({
      user_id: userId,
      subscription_id: null,
      license_key: licenseKey,
      status: "active",
      max_accounts: maxAccounts,
      source: "manual",
      expires_at: expiresAt,
      telemetry_secret_enc: secretEnc,
    })
    .select("id")
    .single<{ id: string }>();
  if (insertErr || !license) {
    return { ok: false, message: `Insert failed: ${insertErr?.message}` };
  }

  await admin.from("license_events").insert({
    license_id: license.id,
    event: "issued",
    detail: `manual, ${months}mo, by ${g.ownerId}`,
  });
  await advanceOnboarding(admin, userId, "license_issued");
  await sendManualLicenseWelcome(email, licenseKey, expiresAt);

  revalidatePath("/admin");
  return {
    ok: true,
    message: `License issued to ${email} (expires ${expiresAt.slice(0, 10)}). Copy the key and telemetry secret now — they are shown once.`,
    licenseKey,
    telemetrySecret: secretEnc ? telemetrySecret : undefined,
  };
}

/**
 * Publish a new no-trade schedule version. The CSV becomes the active
 * schedule served by /api/schedule to every licensed EA — customers never
 * touch files. Light shape validation; the EA also validates on parse.
 */
export async function publishSchedule(
  formData: FormData
): Promise<AdminActionResult> {
  const g = await gate();
  if (g.denied) return g.denied;

  const csv = String(formData.get("csv") ?? "").replace(/\r\n/g, "\n").trim();
  const notes = String(formData.get("notes") ?? "").slice(0, 500) || null;
  if (csv.length < 50 || csv.length > 200_000) {
    return { ok: false, message: "CSV looks empty or too large." };
  }
  const dataLines = csv
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"));
  const wellFormed = dataLines.every((l) =>
    /^(DATE|WEEK|ISOWEEK),/.test(l.trim())
  );
  const dateRows = dataLines.filter((l) => l.startsWith("DATE,")).length;
  if (!wellFormed || dateRows === 0) {
    return {
      ok: false,
      message:
        "Rejected: every non-comment line must start with DATE,/WEEK,/ISOWEEK, and at least one DATE row is required.",
    };
  }

  const { createHash } = await import("crypto");
  const sha256 = createHash("sha256").update(csv).digest("hex");

  const admin = createSupabaseAdminClient();
  const { data: latest } = await admin
    .from("schedule_versions")
    .select("version, sha256")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle<{ version: number; sha256: string }>();
  if (latest?.sha256 === sha256) {
    return { ok: false, message: "Identical to the current version — nothing published." };
  }

  await admin
    .from("schedule_versions")
    .update({ active: false })
    .eq("active", true);
  const version = (latest?.version ?? 0) + 1;
  const { error } = await admin.from("schedule_versions").insert({
    version,
    csv,
    sha256,
    notes,
    active: true,
  });
  if (error) return { ok: false, message: `Publish failed: ${error.message}` };

  revalidatePath("/admin");
  return {
    ok: true,
    message: `Schedule v${version} published (${dateRows} date rows). Licensed EAs pick it up on their next daily check.`,
  };
}

export async function extendLicense(
  licenseId: string,
  months: number
): Promise<AdminActionResult> {
  const g = await gate();
  if (g.denied) return g.denied;
  if (!Number.isInteger(months) || months < 1 || months > 24) {
    return { ok: false, message: "Months must be 1–24." };
  }

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("licenses")
    .select("expires_at, source")
    .eq("id", licenseId)
    .maybeSingle<{ expires_at: string | null; source: string }>();
  if (!data || data.source !== "manual") {
    return { ok: false, message: "Only manual licenses can be extended here." };
  }
  const base = Math.max(
    Date.now(),
    data.expires_at ? new Date(data.expires_at).getTime() : 0
  );
  const next = new Date(base + months * 30 * 24 * 60 * 60 * 1000).toISOString();
  await admin
    .from("licenses")
    .update({ expires_at: next, status: "active" })
    .eq("id", licenseId);
  await admin.from("license_events").insert({
    license_id: licenseId,
    event: "extended",
    detail: `+${months}mo → ${next.slice(0, 10)}`,
  });
  revalidatePath("/admin");
  return { ok: true, message: `Extended to ${next.slice(0, 10)}.` };
}

export async function revokeLicense(
  licenseId: string
): Promise<AdminActionResult> {
  const g = await gate();
  if (g.denied) return g.denied;

  const admin = createSupabaseAdminClient();
  await admin
    .from("licenses")
    .update({ status: "revoked" })
    .eq("id", licenseId);
  await admin.from("license_events").insert({
    license_id: licenseId,
    event: "revoked",
    detail: "admin",
  });
  revalidatePath("/admin");
  return { ok: true, message: "License revoked. The EA stops opening new sequences at its next check." };
}

export async function resendWelcome(
  licenseId: string
): Promise<AdminActionResult> {
  const g = await gate();
  if (g.denied) return g.denied;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("licenses")
    .select("license_key, expires_at, profile:profiles(email)")
    .eq("id", licenseId)
    .maybeSingle<{
      license_key: string;
      expires_at: string | null;
      profile: { email: string } | null;
    }>();
  if (!data?.profile) return { ok: false, message: "License not found." };

  await sendManualLicenseWelcome(
    data.profile.email,
    data.license_key,
    data.expires_at
  );
  await admin.from("license_events").insert({
    license_id: licenseId,
    event: "welcome_resent",
    detail: "admin",
  });
  return { ok: true, message: `Welcome email re-sent to ${data.profile.email}.` };
}
