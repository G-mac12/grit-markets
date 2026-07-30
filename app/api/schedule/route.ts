import { NextRequest, NextResponse } from "next/server";
import { adminConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/schedule?license_key=GM-…
 *
 * Serves the active no-trade schedule (CSV) to licensed EAs. The platform
 * is the single source of truth: the owner publishes a new version in
 * /admin and every EA picks it up on its next daily check — customers
 * never upload or manage files.
 *
 * Auth: an active licence key (read-only data, so key-gated rather than
 * HMAC-signed). Response headers carry the version + sha256 so the EA can
 * skip unchanged downloads; the EA holds the schedule in memory and falls
 * back to its last-good copy on any failure.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
  }
  const key = (req.nextUrl.searchParams.get("license_key") ?? "")
    .trim()
    .toUpperCase();
  if (!/^GM(-[A-Z2-9]{5}){4}$/.test(key)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: license } = await admin
    .from("licenses")
    .select("id, status, source, expires_at")
    .eq("license_key", key)
    .maybeSingle<{
      id: string;
      status: string;
      source: string;
      expires_at: string | null;
    }>();
  const live =
    license &&
    license.status === "active" &&
    (license.source !== "manual" ||
      !license.expires_at ||
      new Date(license.expires_at).getTime() > Date.now());
  if (!live) {
    return NextResponse.json({ error: "license_invalid" }, { status: 401 });
  }

  const { data: schedule } = await admin
    .from("schedule_versions")
    .select("version, csv, sha256")
    .eq("active", true)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle<{ version: number; csv: string; sha256: string }>();
  if (!schedule) {
    return NextResponse.json({ error: "no_schedule" }, { status: 404 });
  }

  // If-None-Match-style short-circuit on the sha the EA already holds
  if (req.nextUrl.searchParams.get("have") === schedule.sha256) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        "X-GM-Schedule-Version": String(schedule.version),
        "X-GM-Schedule-Sha256": schedule.sha256,
      },
    });
  }

  return new NextResponse(schedule.csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "X-GM-Schedule-Version": String(schedule.version),
      "X-GM-Schedule-Sha256": schedule.sha256,
    },
  });
}
