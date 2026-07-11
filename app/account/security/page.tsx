import { getDashboardContext } from "@/lib/account-data";
import {
  cancelDeletion,
  signOutOtherSessions,
  updateEmailPreferences,
  updateProfile,
} from "./actions";
import { MfaManager } from "./MfaManager";
import { DeleteAccountButton, EmailChanger } from "./DangerZone";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const { supabase, user } = await getDashboardContext();

  const [{ data: profile }, { data: prefs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, deletion_requested_at")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("email_preferences")
      .select("daily_digest, weekly_newsletter, alert_emails")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return (
    <section>
      <h1 className="font-display text-display-md font-medium">
        Account &amp; Security.
      </h1>

      {profile?.deletion_requested_at && (
        <div className="mt-6 border border-loss-bright/60 bg-paper-card p-4">
          <p className="text-sm text-fg">
            Deletion scheduled — your data is purged 14 days after{" "}
            {new Date(profile.deletion_requested_at).toLocaleDateString("en-GB")}.
          </p>
          <form action={cancelDeletion} className="mt-2">
            <button type="submit" className="btn-ghost px-3 py-1.5 text-xs">
              Cancel deletion
            </button>
          </form>
        </div>
      )}

      {/* profile + email */}
      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-4 text-term-faint">Profile</p>
        <form action={updateProfile} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="displayName" className="label-micro block text-term-faint">
              Display name (optional)
            </label>
            <input
              id="displayName"
              name="displayName"
              defaultValue={profile?.display_name ?? ""}
              maxLength={80}
              className="mt-1 w-64 border border-term-line bg-term-bg px-2 py-1.5 font-mono text-xs text-term-fg"
            />
          </div>
          <button type="submit" className="border border-term-line px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-term-muted hover:border-accent-bright hover:text-accent-bright">
            Save
          </button>
        </form>
        <div className="mt-5 border-t border-term-line pt-5">
          <EmailChanger current={user.email ?? ""} />
        </div>
      </div>

      {/* 2FA */}
      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-4 text-term-faint">Two-factor authentication</p>
        <MfaManager />
      </div>

      {/* sessions */}
      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-3 text-term-faint">Sessions</p>
        <p className="max-w-lg text-xs leading-relaxed text-term-muted">
          Sessions roll for 7 days. If you have signed in on a machine you no
          longer trust, revoke everything except this session.
        </p>
        <form action={signOutOtherSessions} className="mt-3">
          <button type="submit" className="border border-term-line px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-term-muted hover:border-loss-bright hover:text-loss-bright">
            Sign out all other sessions
          </button>
        </form>
      </div>

      {/* email preferences */}
      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-4 text-term-faint">Email preferences</p>
        <form action={updateEmailPreferences} className="space-y-3">
          {[
            {
              name: "daily_digest",
              label: "Daily results digest (07:00 UK)",
              checked: prefs?.daily_digest ?? true,
              note: "Yesterday's numbers, plainly. Service email — on by default, opt out any time.",
            },
            {
              name: "alert_emails",
              label: "Alert emails (margin, drawdown, EA offline, skim)",
              checked: prefs?.alert_emails ?? true,
              note: "Fired alerts always show in the dashboard regardless.",
            },
            {
              name: "weekly_newsletter",
              label: "Weekly FX newsletter (marketing)",
              checked: prefs?.weekly_newsletter ?? false,
              note: "Consent-based and off by default. Unsubscribe honoured within 24 hours.",
            },
          ].map((p) => (
            <label key={p.name} className="flex items-start gap-3">
              <input
                type="checkbox"
                name={p.name}
                defaultChecked={p.checked}
                className="mt-0.5 accent-[#5E71FF]"
              />
              <span>
                <span className="font-mono text-xs text-term-fg">{p.label}</span>
                <span className="block text-xs text-term-muted">{p.note}</span>
              </span>
            </label>
          ))}
          <button type="submit" className="border border-term-line px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-term-muted hover:border-accent-bright hover:text-accent-bright">
            Save preferences
          </button>
        </form>
      </div>

      {/* your data */}
      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-3 text-term-faint">Your data (UK GDPR)</p>
        <p className="max-w-lg text-xs leading-relaxed text-term-muted">
          Export everything we hold about you as JSON — profile, subscription,
          licenses, linked accounts, telemetry, trades, rules, audit history.
          Deletion schedules a full purge after a 14-day grace period.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/api/account/export"
            className="border border-accent-bright/60 px-3 py-1.5 font-mono text-micro uppercase tracking-[0.1em] text-accent-bright hover:bg-accent-bright/10"
          >
            Download my data
          </a>
          <DeleteAccountButton />
        </div>
      </div>
    </section>
  );
}
