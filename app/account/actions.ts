"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminConfigured, authConfigured } from "@/lib/env";

const REBINDS_PER_30_DAYS = 2;

export async function signOut(): Promise<void> {
  if (authConfigured()) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

/**
 * Self-service rebind: unbind one MT5 account from the license so a new one
 * can bind on next validation. Limited to 2 rebinds per rolling 30 days.
 */
export async function rebindLicense(formData: FormData): Promise<void> {
  if (!authConfigured() || !adminConfigured()) return;

  const licenseId = String(formData.get("licenseId") ?? "");
  const account = String(formData.get("account") ?? "");
  if (!licenseId || !account) return;

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // ownership check under RLS
  const { data: license } = await supabase
    .from("licenses")
    .select("id, mt5_account_numbers")
    .eq("id", licenseId)
    .maybeSingle();
  if (!license || !license.mt5_account_numbers.includes(account)) return;

  const admin = createSupabaseAdminClient();

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  const { count } = await admin
    .from("license_events")
    .select("id", { count: "exact", head: true })
    .eq("license_id", licenseId)
    .eq("event", "rebound")
    .gte("created_at", thirtyDaysAgo);
  if ((count ?? 0) >= REBINDS_PER_30_DAYS) return;

  await admin
    .from("licenses")
    .update({
      mt5_account_numbers: license.mt5_account_numbers.filter(
        (a: string) => a !== account
      ),
    })
    .eq("id", licenseId);
  await admin.from("license_events").insert({
    license_id: licenseId,
    event: "rebound",
    mt5_account: account,
    ip: "dashboard",
    detail: "self-service unbind",
  });

  revalidatePath("/account");
}

/**
 * Issues a short-lived signed URL for an EA build in the private
 * 'ea-builds' bucket and logs the download.
 */
export async function getDownloadUrl(
  version: string
): Promise<{ url?: string; error?: string }> {
  if (!authConfigured() || !adminConfigured())
    return { error: "not_configured" };

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "auth_required" };

  // must hold a live subscription (RLS scopes to own rows)
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .in("status", ["active", "trialing", "past_due"])
    .limit(1)
    .maybeSingle();
  if (!sub) return { error: "no_subscription" };

  if (!/^[\w.-]+$/.test(version)) return { error: "bad_version" };

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage
    .from("ea-builds")
    .createSignedUrl(`${version}/GritMarkets.ex5`, 300, {
      download: `GritMarkets-${version}.ex5`,
    });
  if (error || !data) return { error: "not_available" };

  await admin
    .from("downloads")
    .insert({ user_id: user.id, ea_version: version });

  return { url: data.signedUrl };
}
