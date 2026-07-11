"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  accountLinkId: z.string().uuid(),
  type: z.enum(["margin_level", "drawdown", "ea_offline"]),
  threshold: z.number().min(0).max(100000).nullable(),
  enabled: z.boolean(),
});

/** alert_rules has an owner-scoped ALL policy — RLS enforces ownership. */
export async function upsertAlertRule(formData: FormData): Promise<void> {
  const type = String(formData.get("type"));
  const parsed = schema.safeParse({
    accountLinkId: String(formData.get("accountLinkId")),
    type,
    threshold:
      type === "ea_offline" ? null : Number(formData.get("threshold") ?? 0),
    enabled: String(formData.get("enabled")) === "true",
  });
  if (!parsed.success) return;
  const supabase = createSupabaseServerClient();
  await supabase.from("alert_rules").upsert(
    {
      account_link_id: parsed.data.accountLinkId,
      type: parsed.data.type,
      threshold: parsed.data.threshold,
      enabled: parsed.data.enabled,
    },
    { onConflict: "account_link_id,type" }
  );
  revalidatePath("/account/alerts");
}
