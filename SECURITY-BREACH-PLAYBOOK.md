# Personal Data Breach Playbook — Grit Agility Ltd (gritmarkets.com)

Controller: Grit Agility Ltd, SC837399, Scotland, UK.
Scope: any actual or suspected breach of personal data processed by the
gritmarkets.com platform (Supabase, Vercel, Stripe, Resend, Klaviyo).

`[OWNER ACTION — not code: confirm Grit Agility Ltd's ICO registration /
data protection fee is current before launch.]`

## 1. Detect

Signals to treat as potential breaches:
- Supabase auth anomalies (mass failed logins, sign-ins from unexpected regions)
- Service-role key or `TELEMETRY_SECRET_KEY` / `CRON_SECRET` / Stripe key exposure
  (git history, logs, screenshots, third-party breach)
- Unexpected rows or RLS bypass patterns in `license_events` / `settings_audit`
- Vercel/Supabase/Stripe security notifications
- Customer reports of account access they don't recognise

## 2. Contain (first hour)

1. Rotate the exposed credential immediately:
   - Supabase: Settings → API → rotate service role + anon keys; redeploy with new env vars
   - Stripe: roll the secret key + webhook secret in the Stripe dashboard
   - `TELEMETRY_SECRET_KEY` / `CRON_SECRET`: replace in Vercel env, redeploy;
     regenerate per-license telemetry secrets (customers re-issue from dashboard)
2. Revoke sessions if auth is implicated: Supabase → Authentication → Sessions
   (global sign-out), and require re-login.
3. If an RLS defect is implicated, disable the affected route (Vercel instant
   rollback to a previous deployment) before fixing forward.
4. Preserve evidence: export relevant `license_events`, `settings_audit`,
   Vercel logs BEFORE they age out. Do not delete anything.

## 3. Assess (within 24h)

Record in an incident note (date-stamped, kept in the company drive):
- What data categories were exposed (see the privacy policy's data table)
- Whose data, how many data subjects, over what window
- Whether data was exfiltrated or only exposed
- Likelihood and severity of harm (fraud risk, account compromise, distress)

The data held is deliberately minimal (email, MT5 account numbers, trading
telemetry, IPs ≤90 days; no passwords beyond hashed auth, no cards, no ID
documents) — assess against exactly this, not assumptions.

## 4. Notify

- **ICO**: if the breach is likely to result in a risk to individuals'
  rights and freedoms, report to the ICO **within 72 hours of becoming
  aware** — https://ico.org.uk/for-organisations/report-a-breach/ — including
  nature, categories, approximate numbers, consequences and measures taken.
  If not reportable, record in the incident note why not.
- **Data subjects**: if the risk is HIGH (e.g. auth compromise enabling
  account takeover), notify affected users without undue delay by email:
  what happened, what data, what we did, what they should do (rotate
  passwords/2FA, watch for phishing referencing their MT5 account numbers).
- **Processors**: if the breach originated at Supabase/Stripe/Vercel/Resend/
  Klaviyo, coordinate with their security teams and reference their DPA
  breach-notification clauses.

## 5. Recover & learn

- Fix the root cause; add a regression test or RLS test where applicable
- Post-incident review within 14 days: timeline, what worked, what to change
- Update this playbook with anything learned

## Quick reference

| Item | Where |
|---|---|
| ICO breach reporting | https://ico.org.uk/for-organisations/report-a-breach/ |
| Supabase key rotation | Supabase dashboard → Settings → API |
| Stripe key roll | Stripe dashboard → Developers → API keys |
| Deployment rollback | Vercel → Deployments → Promote previous |
| Session revocation | Supabase → Authentication (global sign-out) |
