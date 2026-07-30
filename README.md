# gritmarkets.com

Marketing and subscription platform for **Grit Markets** — a Martingale-based
MetaTrader 5 expert advisor licensed by monthly subscription from
Grit Agility Ltd (SC837399, Scotland).

Canonical domain: `https://gritmarkets.com` (apex canonical, `www` 301s to apex
via `next.config.mjs`). Deployed on Vercel.

## Status

**Phase 1** (marketing site) — built and approved.
**Phase 2** (accounts, Stripe billing, license provisioning, `/account`
dashboard, `/api/license/validate`) — built, env-var gated: every
integration switches on when its keys are configured, and the site runs in
Phase 1 mode without them.

## Phase 2 setup (owner)

1. **Supabase** — create a NEW dedicated project. Run
   `supabase/migrations/0001_init.sql` in the SQL editor. Create a private
   Storage bucket `ea-builds` and upload builds as
   `<version>/GritMarkets.ex5`. Enable the Email (magic link) auth provider
   with redirect URL `https://gritmarkets.com/auth/callback`.
2. **Stripe** — create two recurring Prices matching `content/pricing.ts`
   and put their ids in `STRIPE_PRICE_STANDARD` / `STRIPE_PRICE_PREMIUM`. Add a
   webhook endpoint `https://gritmarkets.com/api/stripe/webhook` for:
   `checkout.session.completed`, `invoice.payment_failed`,
   `customer.subscription.updated`, `customer.subscription.deleted`.
   Enable the Customer Portal.
3. **Resend** — verify the sending domain, set `RESEND_API_KEY` and
   `EMAIL_FROM`.
4. Copy `.env.example` values into Vercel env vars (secrets are server-side
   only; nothing secret is `NEXT_PUBLIC_`).

### Phase 2b — telemetry, dashboard modules, GDPR tooling

Run `supabase/migrations/0002_telemetry_dashboard.sql` after 0001. Extra env
vars: `TELEMETRY_SECRET_KEY` (32-byte hex, `openssl rand -hex 32`) and
`CRON_SECRET` (Vercel Cron auth). `vercel.json` schedules three crons:
daily-rollup (00:05 UTC — daily summaries, skim recommendations, drawdown
alerts, retention pruning), ea-offline-check (hourly), purge-deleted
(03:30 — expired 14-day deletion grace periods).

- `/api/telemetry`: HMAC-authenticated EA pushes (per-license secret issued
  once in the dashboard, AES-GCM at rest); idempotent trade ingestion;
  settings-sync responses; margin alerts inline. MQL5 reference at
  `/docs/telemetry-and-settings-sync-mql5`.
- Dashboard modules under `/account`: Overview, P&L Analytics, Safety
  Buffer (recommendation ledger — the platform never moves funds), Strategy
  Settings (bounds-validated, pending→applied EA protocol, audit + revert,
  what-if Monte Carlo), Costs & True ROI, Alerts, Licenses & Downloads,
  Account & Security (TOTP 2FA with step-up enforcement, sessions, email
  preferences, JSON export, 14-day-grace deletion), Billing.
- Deferred until the owner sets up the accounts: Resend transactional
  templates, daily digest sending, Klaviyo newsletter + admin review queue.
- `SECURITY-BREACH-PLAYBOOK.md` documents the UK GDPR incident process.

Key flows: checkout → webhook creates subscription + license (key
`GM-XXXXX-…`, crypto-random) + welcome email; payment failure → `past_due`
with a 3-day grace before validation rejects; cancellation → license
revoked. The EA validates against
`POST https://gritmarkets.com/api/license/validate` (fixed URL, documented
in `/docs/license-validation-mql5` with the MQL5 reference); binding is
first-use up to the tier's `max_accounts`, rate-limited per key, every call
logged to `license_events`.

## Stack

Next.js 14 (App Router) · TypeScript strict · Tailwind (token system in
`tailwind.config.ts`) · React Three Fiber (hero) · GSAP ScrollTrigger (pinned
sequence) · Framer Motion (micro-interactions).

```bash
npm install
npm run dev        # local dev
npm run build      # production build (all routes static)
npm run typecheck
```

## Where things live

- `content/start-here.ts` + `app/start-here/` — the beginner hub: five
  demo-first setup guides (broker, VPS, MT5, EA install, first run) with
  HowTo/FAQPage/ItemList JSON-LD, URL-param progress state (no
  localStorage), and owner-supplied screenshot slots. Capture the shots in
  `SHOT-LIST.md`, drop them into `public/images/start-here/`, redeploy —
  placeholders swap to real images automatically.
- `lib/site.ts` — single source of truth for entity data (product name,
  company, canonical URL, the one-line description used identically in
  llms.txt / JSON-LD / meta / footer) and the footer risk warning.
- `content/` — all editable copy: FAQ, blog posts (draft), docs guides,
  legal documents, pricing tiers, EA spec cards, changelog.
- `components/hero/` — the WebGL "Tape" hero: three seeded particle
  formations (flow / structure / engine) with reduced-motion + no-WebGL
  static SVG fallback.
- `components/simulator/` + `lib/martingale.ts` — Monte Carlo Martingale
  simulator (web worker, main-thread fallback).
- `app/llms.txt/route.ts`, `app/robots.ts`, `app/sitemap.ts` — AEO surface.

## Compliance rules (non-negotiable)

- No profit guarantees, no performance figures without a verified source,
  no "passive income" / "risk-free" phrasing anywhere.
- Martingale risk is disclosed, not hidden — it is the brand.
- Every page footer carries the risk warning (template in `lib/site.ts`).
- No cross-branding with other Grit Agility ventures.
- Blog posts ship as `status: "draft"` (noindexed, excluded from sitemap)
  until the owner reviews.

## [OWNER INPUT] before launch

1. Pricing tiers & amounts — placeholders in `content/pricing.ts` and the
   `SoftwareApplication` offer in `lib/jsonld.ts`.
2. Final EA feature/risk-control list — `content/ea-features.ts`,
   `content/docs.ts` (configure-risk-settings guide).
3. Verified performance link (Myfxbook/FX Blue) — the performance section is
   currently **omitted entirely**, per the compliance rule.
4. Support email + company contact details — `lib/site.ts`
   (`support@gritmarkets.com` is a placeholder) and `content/legal.ts`.
5. Design system is "Broadsheet Terminal": warm paper ground, ink text,
   Fraunces serif display, cobalt accent; product UI artifacts render as
   dark terminal windows (`term` tokens in `tailwind.config.ts`).
6. /start-here: confirm IC Markets as the featured broker and whether an
   IB/affiliate link is used (must be disclosed on-page if so); choose the
   VPS providers to feature (same disclosure rule); capture the screenshots
   in `SHOT-LIST.md` on your own (demo) accounts.
6. Legal drafts in `content/legal.ts` need a solicitor review.
