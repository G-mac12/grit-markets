import { adminConfigured } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { IssueForm, RowActions, ScheduleForm } from "./AdminPanels";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  license_key: string;
  status: string;
  source: string;
  expires_at: string | null;
  max_accounts: number;
  mt5_account_numbers: string[];
  last_validated_at: string | null;
  created_at: string;
  profile: { email: string } | null;
  user_id: string;
}

/** License list + onboarding state per user + the issue form. */
export default async function AdminPage() {
  if (!adminConfigured()) {
    return <p className="text-fg-muted">Supabase admin is not configured.</p>;
  }
  const admin = createSupabaseAdminClient();
  const [{ data: licenses }, { data: onboarding }, { data: schedule }] = await Promise.all([
    admin
      .from("licenses")
      .select(
        "id, license_key, status, source, expires_at, max_accounts, mt5_account_numbers, last_validated_at, created_at, user_id, profile:profiles(email)"
      )
      .order("created_at", { ascending: false })
      .returns<Row[]>(),
    admin
      .from("onboarding_state")
      .select("user_id, state")
      .returns<{ user_id: string; state: string }[]>(),
    admin
      .from("schedule_versions")
      .select("version, csv")
      .eq("active", true)
      .limit(1)
      .maybeSingle<{ version: number; csv: string }>(),
  ]);
  const stateByUser = new Map(
    (onboarding ?? []).map((o) => [o.user_id, o.state])
  );

  const mask = (k: string) => `${k.slice(0, 8)}…${k.slice(-5)}`;

  const scheduleRows = schedule
    ? schedule.csv.split("\n").filter((l) => l.startsWith("DATE,")).length
    : null;

  return (
    <div className="space-y-10">
      <IssueForm />

      <ScheduleForm
        currentVersion={schedule?.version ?? null}
        currentRows={scheduleRows}
      />

      <div>
        <p className="label-micro mb-4">
          Licenses ({licenses?.length ?? 0})
        </p>
        <div className="overflow-x-auto border border-line">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-line bg-paper-dim text-left text-fg-faint">
                {["Email", "Key", "Status", "Source", "Expires", "Accounts", "Onboarding", "Last validated", "Actions"].map((h) => (
                  <th key={h} className="px-3 py-2 font-normal uppercase tracking-[0.08em]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(licenses ?? []).map((l) => (
                <tr key={l.id} className="border-b border-line/60 align-top text-fg-muted">
                  <td className="px-3 py-2.5 text-fg">{l.profile?.email ?? "—"}</td>
                  <td className="px-3 py-2.5">{mask(l.license_key)}</td>
                  <td className={`px-3 py-2.5 ${l.status === "active" ? "text-gain" : "text-loss"}`}>
                    {l.status}
                  </td>
                  <td className="px-3 py-2.5">{l.source}</td>
                  <td className="px-3 py-2.5">
                    {l.expires_at ? l.expires_at.slice(0, 10) : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    {l.mt5_account_numbers.length}/{l.max_accounts}
                  </td>
                  <td className="px-3 py-2.5">
                    {stateByUser.get(l.user_id) ?? "created"}
                  </td>
                  <td className="px-3 py-2.5">
                    {l.last_validated_at
                      ? l.last_validated_at.slice(0, 16).replace("T", " ")
                      : "never"}
                  </td>
                  <td className="px-3 py-2.5">
                    <RowActions licenseId={l.id} />
                  </td>
                </tr>
              ))}
              {(licenses ?? []).length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-fg-faint">
                    No licenses yet — issue the first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
