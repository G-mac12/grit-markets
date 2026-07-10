import Link from "next/link";
import { getDashboardContext } from "@/lib/account-data";
import { StatusPill } from "@/components/dashboard/DashboardPreview";
import { CHANGELOG } from "@/content/changelog";
import { CopyKey, DownloadButton, RebindButton } from "../ui";
import { TelemetrySecretButton } from "./TelemetrySecretButton";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });

export default async function LicensesPage() {
  const { supabase } = await getDashboardContext();

  const [{ data: licenses }, { data: sub }] = await Promise.all([
    supabase
      .from("licenses")
      .select(
        "id, license_key, status, mt5_account_numbers, max_accounts, last_validated_at, telemetry_secret_enc"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("subscriptions")
      .select("status")
      .in("status", ["active", "trialing", "past_due"])
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <section>
      <h1 className="font-display text-display-md font-medium">
        Licenses &amp; Downloads.
      </h1>

      {licenses && licenses.length > 0 ? (
        <ul className="mt-8 space-y-6">
          {licenses.map((lic) => (
            <li key={lic.id} className="term-panel p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CopyKey licenseKey={lic.license_key} />
                <StatusPill
                  label={lic.status}
                  tone={lic.status === "active" ? "active" : "warn"}
                />
              </div>

              <div className="mt-5 grid gap-6 md:grid-cols-2">
                <div className="font-mono text-xs text-term-muted">
                  <p className="label-micro mb-2 text-term-faint">
                    Bound MT5 accounts ({lic.mt5_account_numbers.length}/{lic.max_accounts})
                  </p>
                  {lic.mt5_account_numbers.length > 0 ? (
                    <ul className="space-y-1.5">
                      {lic.mt5_account_numbers.map((acc: string) => (
                        <li key={acc} className="flex items-center justify-between gap-4">
                          <span className="text-term-fg">{acc}</span>
                          <RebindButton licenseId={lic.id} account={acc} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Binds on first validation from your terminal.</p>
                  )}
                  <p className="mt-3 text-term-faint">
                    Last validated:{" "}
                    {lic.last_validated_at
                      ? dateFmt.format(new Date(lic.last_validated_at))
                      : "never"}{" "}
                    · rebinds limited to 2 per 30 days · unbinding requires 2FA
                  </p>
                </div>

                <div>
                  <p className="label-micro mb-2 text-term-faint">Telemetry secret</p>
                  <p className="mb-3 max-w-sm text-xs leading-relaxed text-term-muted">
                    Authenticates the EA&apos;s dashboard telemetry (HMAC). Paste
                    it into the EA&apos;s TelemetrySecret input. Regenerating
                    invalidates the old secret immediately.
                  </p>
                  <TelemetrySecretButton
                    licenseId={lic.id}
                    hasSecret={Boolean(lic.telemetry_secret_enc)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 max-w-xl leading-relaxed text-fg-muted">
          Your license is generated automatically when checkout completes.
        </p>
      )}

      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-3 text-term-faint">EA downloads</p>
        {sub ? (
          <ul className="space-y-3">
            {CHANGELOG.slice(0, 2).map((entry) => (
              <li key={entry.version} className="flex flex-wrap items-center gap-4 font-mono text-xs text-term-muted">
                <DownloadButton version={entry.version} />
                <span>{entry.date}</span>
                <Link href="/changelog" className="text-term-faint underline-offset-4 hover:text-accent-bright hover:underline">
                  changelog
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-term-faint">
            Downloads unlock with an active subscription.
          </p>
        )}
        <p className="mt-4 border-t border-term-line pt-3 text-xs leading-relaxed text-term-muted">
          Setup reference:{" "}
          <Link href="/docs/install-grit-markets-mt5" className="text-accent-bright underline">
            installation
          </Link>{" "}
          ·{" "}
          <Link href="/docs/license-validation-mql5" className="text-accent-bright underline">
            license validation
          </Link>{" "}
          ·{" "}
          <Link href="/docs/telemetry-and-settings-sync-mql5" className="text-accent-bright underline">
            telemetry &amp; settings sync
          </Link>
        </p>
      </div>
    </section>
  );
}
