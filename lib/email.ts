import { emailConfigured, siteUrl } from "./env";
import { SITE } from "./site";

/**
 * Transactional email via the Resend HTTP API (no SDK needed).
 * Every send is best-effort: a failed email must never fail a webhook.
 */
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!emailConfigured()) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("resend error", res.status, await res.text());
    }
  } catch (err) {
    console.error("resend send failed", err);
  }
}

function shell(body: string): string {
  return `<div style="font-family:Georgia,serif;max-width:540px;margin:0 auto;padding:24px;color:#161513">
  <p style="font-size:20px;font-weight:600">Grit Markets<span style="color:#1D35E0">.</span></p>
  ${body}
  <p style="margin-top:32px;font-size:12px;color:#8F897C;border-top:1px solid #D9D3C6;padding-top:12px">
    ${SITE.companyName} · Company ${SITE.companyNumber} · <a href="${siteUrl()}" style="color:#1D35E0">gritmarkets.com</a><br/>
    Trading leveraged foreign exchange products carries a high level of risk and may not be suitable for all investors.
  </p>
</div>`;
}

export function sendWelcomeWithLicense(
  to: string,
  licenseKey: string,
  tier: string
): Promise<void> {
  return send(
    to,
    "Your Grit Markets license key",
    shell(`
  <p>Welcome — your ${tier} subscription is active.</p>
  <p>Your license key:</p>
  <p style="font-family:monospace;font-size:16px;background:#F4F1EA;border:1px solid #D9D3C6;padding:12px 16px">${licenseKey}</p>
  <p>Next steps:</p>
  <ol>
    <li>Download the EA from your <a href="${siteUrl()}/account" style="color:#1D35E0">dashboard</a>.</li>
    <li>Follow the <a href="${siteUrl()}/docs/install-grit-markets-mt5" style="color:#1D35E0">installation guide</a> — including adding <strong>https://gritmarkets.com</strong> to MT5's allowed WebRequest URLs.</li>
    <li>Configure the risk controls before trading live. The defaults are conservative on purpose.</li>
  </ol>`)
  );
}

export function sendManualLicenseWelcome(
  to: string,
  licenseKey: string,
  expiresAt: string | null
): Promise<void> {
  const expiryLine = expiresAt
    ? `<p>This trial license runs until <strong>${new Date(expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</strong>. Nothing is charged — there is no card on file.</p>`
    : "";
  return send(
    to,
    "Your Grit Markets trial license",
    shell(`
  <p>Welcome to the Grit Markets trial. Your license key:</p>
  <p style="font-family:monospace;font-size:16px;background:#F4F1EA;border:1px solid #D9D3C6;padding:12px 16px">${licenseKey}</p>
  ${expiryLine}
  <p>Getting started:</p>
  <ol>
    <li>Sign in to your <a href="${siteUrl()}/account" style="color:#1D35E0">dashboard</a> with this email address (magic link — no password needed).</li>
    <li>Download the EA from Licenses &amp; Downloads and follow the <a href="${siteUrl()}/start-here" style="color:#1D35E0">start-here guides</a>.</li>
    <li>Add <strong>https://gritmarkets.com</strong> to MT5's allowed WebRequest URLs — the on-chart panel walks you through it.</li>
    <li>We recommend running on a <strong>demo account</strong> for the first two weeks.</li>
  </ol>`)
  );
}

export interface DigestAccountRow {
  label: string;
  currency: string;
  realized: number;
  endingBalance: number | null;
  maxDrawdownPct: number | null;
  tradesClosed: number;
  skimRecommended: number | null;
}

/** Numbers-first daily digest. Opt-out via email preferences (default on). */
export function sendDailyDigest(
  to: string,
  dateStr: string,
  rows: DigestAccountRow[],
  alerts: string[]
): Promise<void> {
  const money = (v: number, ccy: string) =>
    `${v < 0 ? "−" : ""}${ccy} ${Math.abs(v).toFixed(2)}`;
  const table = rows
    .map(
      (r) => `
  <tr>
    <td style="padding:8px 12px;border-bottom:1px solid #D9D3C6;font-family:monospace;font-size:13px">${r.label}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #D9D3C6;font-family:monospace;font-size:13px;color:${r.realized >= 0 ? "#1E7A46" : "#C0332B"}">${money(r.realized, r.currency)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #D9D3C6;font-family:monospace;font-size:13px">${r.endingBalance == null ? "—" : money(r.endingBalance, r.currency)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #D9D3C6;font-family:monospace;font-size:13px">${r.maxDrawdownPct == null ? "—" : r.maxDrawdownPct.toFixed(1) + "%"}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #D9D3C6;font-family:monospace;font-size:13px">${r.tradesClosed}</td>
  </tr>`
    )
    .join("");
  const skims = rows.filter((r) => (r.skimRecommended ?? 0) > 0);
  const alertBlock = alerts.length
    ? `<p style="margin-top:16px"><strong>Alerts:</strong></p><ul>${alerts.map((a) => `<li style="font-size:13px">${a}</li>`).join("")}</ul>`
    : "";
  const skimBlock = skims.length
    ? `<p style="margin-top:16px">Safety Buffer recommendation${skims.length > 1 ? "s" : ""} waiting for your decision in the <a href="${siteUrl()}/account/safety-buffer" style="color:#1D35E0">dashboard</a>.</p>`
    : "";
  return send(
    to,
    `Grit Markets digest — ${dateStr}`,
    shell(`
  <p style="font-size:13px;color:#8F897C">Broker day ${dateStr}</p>
  <table style="border-collapse:collapse;width:100%;margin-top:8px">
    <tr>
      ${["Account", "Realized", "Balance", "Max DD", "Trades"].map((h) => `<th style="text-align:left;padding:8px 12px;border-bottom:2px solid #161513;font-size:11px;text-transform:uppercase;letter-spacing:0.08em">${h}</th>`).join("")}
    </tr>
    ${table}
  </table>
  ${alertBlock}
  ${skimBlock}
  <p style="margin-top:20px;font-size:12px;color:#8F897C">Figures are your account's own telemetry, not a performance promise. Manage this digest in <a href="${siteUrl()}/account/security" style="color:#1D35E0">Account &amp; Security</a>.</p>`)
  );
}

export type NudgeKind = "stalled_validation" | "stalled_telemetry";

/** Onboarding stall nudges — max one per state, enforced by the cron. */
export function sendOnboardingNudge(to: string, kind: NudgeKind): Promise<void> {
  if (kind === "stalled_validation") {
    return send(
      to,
      "Grit Markets — the EA hasn't checked in yet",
      shell(`
  <p>Your license is ready but the EA hasn't validated from MetaTrader 5 yet. The two most common causes:</p>
  <ol>
    <li><strong>The EA isn't attached.</strong> Open a EURUSD chart and drag Grit Markets onto it from Navigator, then tick "Allow Algo Trading" on the Common tab.</li>
    <li><strong>The WebRequest whitelist is missing.</strong> Tools → Options → Expert Advisors → tick "Allow WebRequest for listed URL" → add <strong>https://gritmarkets.com</strong>. Without this MT5 blocks the EA from reaching us, and the EA removes itself.</li>
  </ol>
  <p>The on-chart panel shows exactly which step is missing. Full walkthrough with screenshots: <a href="${siteUrl()}/start-here" style="color:#1D35E0">start-here guides</a>.</p>`)
    );
  }
  return send(
    to,
    "Grit Markets — validated, but no telemetry yet",
    shell(`
  <p>Your EA validated its license — good — but no telemetry has arrived, so your dashboard is still empty. Two things to check:</p>
  <ol>
    <li><strong>The telemetry secret.</strong> In your dashboard's Licenses &amp; Downloads, issue the telemetry secret and paste it into the EA. Without it, pushes are rejected.</li>
    <li><strong>The terminal is still running.</strong> Telemetry flows every few minutes only while MT5 is open with the EA on its chart.</li>
  </ol>
  <p>The on-chart panel's Telemetry row tells you which it is. <a href="${siteUrl()}/account/licenses" style="color:#1D35E0">Open Licenses &amp; Downloads</a>.</p>`)
  );
}

export function sendPaymentFailed(to: string): Promise<void> {
  return send(
    to,
    "Grit Markets — payment failed",
    shell(`
  <p>A payment for your Grit Markets subscription failed.</p>
  <p>Your license keeps working during a 3-day grace period. Please update your card from the <a href="${siteUrl()}/account" style="color:#1D35E0">dashboard</a> (Manage billing) to avoid suspension.</p>`)
  );
}

export function sendCanceled(to: string): Promise<void> {
  return send(
    to,
    "Grit Markets — subscription ended",
    shell(`
  <p>Your Grit Markets subscription has ended and the license attached to it has been revoked. The EA will stop opening new sequences at its next license check.</p>
  <p>You can resubscribe any time from the <a href="${siteUrl()}/pricing" style="color:#1D35E0">pricing page</a>.</p>`)
  );
}
