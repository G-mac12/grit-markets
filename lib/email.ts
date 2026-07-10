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
