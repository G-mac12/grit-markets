# gritmarkets.com

Marketing and subscription platform for **Grit Markets** — a Martingale-based
MetaTrader 5 expert advisor licensed by monthly subscription from
Grit Agility Ltd (SC837399, Scotland).

Canonical domain: `https://gritmarkets.com` (apex canonical, `www` 301s to apex
via `next.config.mjs`). Deployed on Vercel.

## Status

**Phase 1** (marketing site) — built, awaiting owner review and deploy.
**Phase 2** (accounts, Stripe billing, license provisioning, `/account`
dashboard, `/api/license/validate`) — fenced; do not start until explicit
go-ahead.

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
5. Accent decision: signal amber (committed) vs electric green — swap
   `accent.DEFAULT` with `accent.alt` in `tailwind.config.ts` to compare.
6. Legal drafts in `content/legal.ts` need a solicitor review.
