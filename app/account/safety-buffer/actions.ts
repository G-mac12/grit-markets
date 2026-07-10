"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminConfigured } from "@/lib/env";

const ruleSchema = z.object({
  accountLinkId: z.string().uuid(),
  trigger: z.enum(["equity_above_hwm_pct", "realized_profit_amount", "weekly"]),
  threshold: z.number().min(0).max(1_000_000),
  skimPct: z.number().min(1).max(100),
});

/** Rules are the customer's own; RLS enforces ownership on every write. */
export async function createSkimRule(formData: FormData): Promise<void> {
  const parsed = ruleSchema.safeParse({
    accountLinkId: String(formData.get("accountLinkId")),
    trigger: String(formData.get("trigger")),
    threshold: Number(formData.get("threshold")),
    skimPct: Number(formData.get("skimPct")),
  });
  if (!parsed.success) return;
  const supabase = createSupabaseServerClient();
  await supabase.from("skim_rules").insert({
    account_link_id: parsed.data.accountLinkId,
    trigger: parsed.data.trigger,
    threshold_value: parsed.data.threshold,
    skim_pct: parsed.data.skimPct,
  });
  revalidatePath("/account/safety-buffer");
}

export async function toggleSkimRule(formData: FormData): Promise<void> {
  const id = String(formData.get("ruleId") ?? "");
  const enabled = String(formData.get("enabled")) === "true";
  if (!z.string().uuid().safeParse(id).success) return;
  const supabase = createSupabaseServerClient();
  await supabase.from("skim_rules").update({ enabled: !enabled }).eq("id", id);
  revalidatePath("/account/safety-buffer");
}

export async function deleteSkimRule(formData: FormData): Promise<void> {
  const id = String(formData.get("ruleId") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;
  const supabase = createSupabaseServerClient();
  await supabase.from("skim_rules").delete().eq("id", id);
  revalidatePath("/account/safety-buffer");
}

/**
 * Confirm: the customer states the amount they actually withdrew AT THEIR
 * BROKER. The platform records the fact — it never moves funds.
 */
export async function resolveSkim(formData: FormData): Promise<void> {
  if (!adminConfigured()) return;
  const id = String(formData.get("ledgerId") ?? "");
  const action = String(formData.get("action") ?? "");
  const amount = Number(formData.get("confirmedAmount") ?? 0);
  if (!z.string().uuid().safeParse(id).success) return;
  if (action !== "confirm" && action !== "dismiss") return;
  if (action === "confirm" && !(amount > 0 && amount < 10_000_000)) return;

  // ownership check under RLS, then service-role write
  const supabase = createSupabaseServerClient();
  const { data: row } = await supabase
    .from("skim_ledger")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (!row || row.status !== "recommended") return;

  const admin = createSupabaseAdminClient();
  await admin
    .from("skim_ledger")
    .update(
      action === "confirm"
        ? {
            status: "confirmed",
            confirmed_amount: amount,
            confirmed_at: new Date().toISOString(),
          }
        : { status: "dismissed" }
    )
    .eq("id", id)
    .eq("status", "recommended");
  revalidatePath("/account/safety-buffer");
}
