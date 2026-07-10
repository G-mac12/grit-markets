import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { authConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const ACCT_COOKIE = "gm-acct";

export interface AccountLink {
  id: string;
  mt5_account: string;
  broker_label: string | null;
  account_currency: string;
  is_demo: boolean;
  status: string;
}

export interface DashboardContext {
  supabase: SupabaseClient;
  user: User;
  links: AccountLink[];
  /** currently selected account link (cookie-driven), null if none linked */
  link: AccountLink | null;
}

/** Shared entry point for every dashboard page: auth + account selection. */
export async function getDashboardContext(): Promise<DashboardContext> {
  if (!authConfigured()) redirect("/login");
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: links } = await supabase
    .from("account_links")
    .select("id, mt5_account, broker_label, account_currency, is_demo, status")
    .eq("status", "active")
    .order("linked_at", { ascending: true })
    .returns<AccountLink[]>();

  const all = links ?? [];
  const preferred = cookies().get(ACCT_COOKIE)?.value;
  const link = all.find((l) => l.id === preferred) ?? all[0] ?? null;

  return { supabase, user, links: all, link };
}

export const fmtMoney = (v: number | string | null | undefined, ccy = "USD") =>
  v == null
    ? "—"
    : new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: ccy,
        maximumFractionDigits: 2,
      }).format(Number(v));

export const fmtSigned = (v: number | string | null | undefined, ccy = "USD") => {
  if (v == null) return "—";
  const n = Number(v);
  return `${n >= 0 ? "+" : ""}${fmtMoney(n, ccy)}`;
};
