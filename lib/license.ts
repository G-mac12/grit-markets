import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TIERS } from "@/content/pricing";

/**
 * License key generation + the validation logic behind
 * POST /api/license/validate. The endpoint URL is compiled into the EA and
 * documented in /docs — it must never change after launch.
 */

// unambiguous alphabet (no 0/O, 1/I/L)
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateLicenseKey(): string {
  // GM- + 4 groups of 5 = 20 random chars, ~100 bits of entropy
  const bytes = randomBytes(20);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  const groups = [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join(""));
  return `GM-${groups.join("-")}`;
}

export function maxAccountsForTier(tier: string): number {
  return TIERS.find((t) => t.id === tier)?.maxAccounts ?? 1;
}

export interface ValidationResult {
  valid: boolean;
  reason: string;
  expires: string | null;
}

const PAST_DUE_GRACE_MS = 3 * 24 * 60 * 60 * 1000; // 3-day grace period
const RATE_LIMIT_PER_MINUTE = 30;

interface LicenseRow {
  id: string;
  status: "active" | "suspended" | "revoked";
  mt5_account_numbers: string[];
  max_accounts: number;
  subscription:
    | {
        status: string;
        current_period_end: string | null;
        past_due_since: string | null;
      }
    | null;
}

/**
 * Core validation. Uses the service-role client; logs every call to
 * license_events (which doubles as the per-key rate limiter).
 */
export async function validateLicense(
  admin: SupabaseClient,
  params: { license_key: string; mt5_account: string; ip: string }
): Promise<ValidationResult> {
  const { license_key, mt5_account, ip } = params;

  const { data } = await admin
    .from("licenses")
    .select(
      "id, status, mt5_account_numbers, max_accounts, subscription:subscriptions(status, current_period_end, past_due_since)"
    )
    .eq("license_key", license_key)
    .maybeSingle<LicenseRow>();

  if (!data) {
    // unknown key: nothing to log against, deny fast
    return { valid: false, reason: "unknown_key", expires: null };
  }

  const log = async (
    event: "validated" | "rejected" | "rebound",
    detail?: string
  ) => {
    await admin.from("license_events").insert({
      license_id: data.id,
      event,
      mt5_account,
      ip,
      detail: detail ?? null,
    });
  };

  // rate limit by key: count events in the trailing minute
  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count } = await admin
    .from("license_events")
    .select("id", { count: "exact", head: true })
    .eq("license_id", data.id)
    .gte("created_at", oneMinuteAgo);
  if ((count ?? 0) >= RATE_LIMIT_PER_MINUTE) {
    return { valid: false, reason: "rate_limited", expires: null };
  }

  const sub = data.subscription;
  const expires = sub?.current_period_end ?? null;

  if (data.status !== "active") {
    await log("rejected", `license_${data.status}`);
    return { valid: false, reason: `license_${data.status}`, expires };
  }

  const subActive =
    sub &&
    (sub.status === "active" ||
      sub.status === "trialing" ||
      (sub.status === "past_due" &&
        sub.past_due_since &&
        Date.now() - new Date(sub.past_due_since).getTime() <
          PAST_DUE_GRACE_MS));

  if (!subActive) {
    // lazy suspension: past_due beyond the grace period suspends the license
    // (webhook reactivation flips it back to active on recovery)
    if (sub?.status === "past_due") {
      await admin
        .from("licenses")
        .update({ status: "suspended" })
        .eq("id", data.id)
        .eq("status", "active");
    }
    await log("rejected", `subscription_${sub?.status ?? "missing"}`);
    return {
      valid: false,
      reason: `subscription_${sub?.status ?? "missing"}`,
      expires,
    };
  }

  const bound = data.mt5_account_numbers;
  if (bound.includes(mt5_account)) {
    await log("validated");
    await admin
      .from("licenses")
      .update({ last_validated_at: new Date().toISOString() })
      .eq("id", data.id);
    return { valid: true, reason: "ok", expires };
  }

  // bind on first use, up to max_accounts
  if (bound.length < data.max_accounts) {
    await admin
      .from("licenses")
      .update({
        mt5_account_numbers: [...bound, mt5_account],
        last_validated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    await log("validated", "bound_new_account");
    return { valid: true, reason: "bound", expires };
  }

  await log("rejected", "account_not_bound");
  return { valid: false, reason: "account_not_bound", expires };
}
