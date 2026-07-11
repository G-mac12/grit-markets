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
 * Submit a new settings version to the EA. Requires TOTP step-up (AAL2).
 * The version goes to `pending`; the EA applies it only when flat/base-level
 * and confirms via telemetry, which flips it to `applied`.
 */
export async function submitStrategySettings(
  accountLinkId: string,
  rawParams: unknown
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
  });
  await admin.from("settings_audit").insert({
    account_link_id: accountLinkId,
    actor_user_id: user.id,
    change: { action: "submit", version, params: parsed.data },
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
  const { data: prev } = await supabase
    .from("strategy_settings")
    .select("params")
    .eq("account_link_id", accountLinkId)
    .eq("version", applied.previous_version)
    .maybeSingle();
  if (!prev) return { ok: false, message: "Previous version not found." };

  return submitStrategySettings(accountLinkId, prev.params);
}
