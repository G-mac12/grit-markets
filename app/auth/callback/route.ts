import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { authConfigured, siteUrl } from "@/lib/env";

/** Exchanges the magic-link code for a session, then lands on /account. */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!authConfigured()) return NextResponse.redirect(`${siteUrl()}/`);

  const code = req.nextUrl.searchParams.get("code");
  const next = req.nextUrl.searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, siteUrl()));
    }
  }
  return NextResponse.redirect(new URL("/login?error=link", siteUrl()));
}
