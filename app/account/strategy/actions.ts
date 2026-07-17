"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminConfigured } from "@/lib/env";
import { checkStepUp, STEP_UP_MESSAGES } from "@/lib/aal";
import { strategyParamsSchema } from "@/lib/strategy";

export interface StrategyActionResult {
  ok: boolean;
  message: string;
}

/**
 * Submit the raw params of a chosen risk profile as a new settings version.
 * This is the ONLY client-triggerable path (constraint 6): the client sends
 * a profile key; raw params are resolved server-side and never returned.
 * Requires TOTP step-up (AAL2). The version goes to `pending`; the EA
 * applies it only when flat/base-level and confirms via telemetry.
 */
export async function submitRiskProfile(
  accountLinkId: string,
  profileKey: string
): Promise<StrategyActionResult> {
  if (!adminConfigured()) return { ok: false, message: "Service not configured." };
  if (!/^[a-z_]{3,30}$/.test(profileKey)) {
    return { ok: false, message: "Bad request." };
  }
  const admin = createSupabaseAdminClient();
  const { data: profile } = await admin
    .from("risk_profiles")
    .select("key, params")
    .eq("key", profileKey)
    .maybeSingle<{ key: string; params: unknown }>();
  if (!profile) return { ok: false, message: "Unknown risk profile." };

  return submitStrategySettings(accountLinkId, profile.params, profile.key);
}

/**
 * Server-internal: queue a validated parameter set. Not exported to the
 * client UI with raw params — reached via submitRiskProfile and revert.
 */
export async function submitStrategySettings(
  accountLinkId: string,
  rawParams: unknown,
  riskProfile?: string
): Promise<StrategyActionResult> {
  if (!adminConfigured()) return { ok: false, message: "Service not configured." };
  if (!z.string().uuid().safeParse(accountLinkId).success) {
    return { ok: false, message: "Bad request." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };

  const stepUp = await checkStepUp(supabase);
  if (stepUp !== "ok") return { ok: false, message: STEP_UP_MESSAGES[stepUp] };

  const parsed = strategyParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return {
      ok: false,
      message: `Rejected by server-side bounds: ${parsed.error.issues
        .map((i) => i.path.join("."))
        .join(", ")}`,
    };
  }

  // ownership via RLS
  const { data: link } = await supabase
    .from("account_links")
    .select("id")
    .eq("id", accountLinkId)
    .maybeSingle();
  if (!link) return { ok: false, message: "Account not found." };

  const admin = createSupabaseAdminClient();
  const { data: latest } = await admin
    .from("strategy_settings")
    .select("version, status")
    .eq("account_link_id", accountLinkId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest?.status === "pending") {
    return {
      ok: false,
      message:
        "A version is already pending — the EA applies it at the next flat state. Wait for confirmation or revert first.",
    };
  }
  const version = (latest?.version ?? 0) + 1;

  await admin.from("strategy_settings").insert({
    account_link_id: accountLinkId,
    version,
    params: parsed.data,
    status: "pending",
    previous_version: latest?.version ?? null,
    risk_profile: riskProfile ?? null,
  });
  // audit records the action + profile, never raw params (customer-readable
  // via RLS — raw values must not be exposed client-side)
  await admin.from("settings_audit").insert({
    account_link_id: accountLinkId,
    actor_user_id: user.id,
    change: { action: "submit", version, profile: riskProfile ?? "custom" },
    ip: headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
  });

  revalidatePath("/account/strategy");
  return {
    ok: true,
    message: `Version ${version} queued. The EA applies it when no recovery sequence is open and confirms on its next telemetry push.`,
  };
}

/** One-click revert: queues the previous applied version's params as new pending. */
export async function revertStrategySettings(
  accountLinkId: string
): Promise<StrategyActionResult> {
  if (!adminConfigured()) return { ok: false, message: "Service not configured." };
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Not signed in." };
  const stepUp = await checkStepUp(supabase);
  if (stepUp !== "ok") return { ok: false, message: STEP_UP_MESSAGES[stepUp] };

  // ownership check via RLS (no params column in the customer grant)
  const { data: applied } = await supabase
    .from("strategy_settings")
    .select("version, previous_version")
    .eq("account_link_id", accountLinkId)
    .eq("status", "applied")
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!applied?.previous_version) {
    return { ok: false, message: "No previous version to revert to." };
  }
  // raw params are read with the service role, server-side only
  const admin = createSupabaseAdminClient();
  const { data: prev } = await admin
    .from("strategy_settings")
    .select("params, risk_profile")
    .eq("account_link_id", accountLinkId)
    .eq("version", applied.previous_version)
    .maybeSingle<{ params: unknown; risk_profile: string | null }>();
  if (!prev) return { ok: false, message: "Previous version not found." };

  return submitStrategySettings(
    accountLinkId,
    prev.params,
    prev.risk_profile ?? undefined
  );
}
