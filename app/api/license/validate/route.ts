import { NextRequest, NextResponse } from "next/server";
import { adminConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { validateLicense } from "@/lib/license";

/**
 * POST https://gritmarkets.com/api/license/validate
 * Called by the EA via MT5 WebRequest(). This exact URL is compiled into the
 * EA and documented in /docs — it must never change after launch.
 *
 * Body: { license_key, mt5_account, ea_version }
 * Returns minimal JSON fast: { valid, reason, expires }.
 */
export const dynamic = "force-dynamic";

function deny(reason: string, status = 200): NextResponse {
  // MT5 WebRequest surfaces the body regardless; keep 200 for parseability
  return NextResponse.json(
    { valid: false, reason, expires: null },
    { status }
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!adminConfigured()) return deny("service_unavailable", 503);

  let body: { license_key?: string; mt5_account?: string; ea_version?: string };
  try {
    body = await req.json();
  } catch {
    return deny("bad_request", 400);
  }

  const licenseKey = String(body.license_key ?? "").trim().toUpperCase();
  const mt5Account = String(body.mt5_account ?? "").trim();

  if (!/^GM(-[A-Z2-9]{5}){4}$/.test(licenseKey) || !/^\d{3,12}$/.test(mt5Account)) {
    return deny("bad_request");
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const result = await validateLicense(createSupabaseAdminClient(), {
    license_key: licenseKey,
    mt5_account: mt5Account,
    ip,
  });

  return NextResponse.json(result);
}
