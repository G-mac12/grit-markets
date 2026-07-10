import type { NextRequest } from "next/server";

/** Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` automatically. */
export function cronAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}
