"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ACCT_COOKIE } from "@/lib/account-data";

export async function selectAccount(formData: FormData): Promise<void> {
  const id = String(formData.get("accountLinkId") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;
  cookies().set(ACCT_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/account",
  });
  revalidatePath("/account", "layout");
}
