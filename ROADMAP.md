# Grit Markets — Revised Plan (post v4.00 build + 16.5-year study)

Updated 2026-07 after the finalised JamesGridScalper v4.00 build and the
16.5-year stop-out study (1,372 stop-out events / 3,037 test windows,
2010–2026) arrived. This supersedes earlier sequencing notes; the milestone
list from the Phase 2 (revised) spec still applies underneath.

## 1. What the two new artefacts are — and how we use them honestly

**The study (365-day no-trade calendar).** Genuine safety engineering: it
identifies the calendar dates, weekday windows and ISO weeks where the
strategy historically blew up, and encodes them as RED/AMBER/WATCH tiers
the EA enforces. This is our evidence of diligence — "we studied 16.5
years of failures and the software refuses to trade through the worst of
them." That claim is factual, defensible, and good marketing.

**What the study's backtests actually show (recorded in VM_HANDOFF §3 and
binding on all copy):** without the new filter layers, the raw engine
backtests to ZERO over the long run in both tested configurations, and the
filter layers themselves are not yet backtestable (the tester cannot
replay the economic calendar). Therefore:

- We NEVER publish backtest performance figures (already policy — backtests
  are not a verified source and these ones argue against the product).
- We NEVER claim the calendar "makes the strategy profitable." The claim
  is only ever: it removes historically dangerous periods.
- The ONLY performance evidence we will ever publish is a live,
  third-party-verified track record (Myfxbook/FX Blue) once the filtered
  build has produced one. Until then the site's honest-risk posture is the
  product's credibility, not its performance.

**Customer build ≠ house build.** The shipping customer EA runs
UseEquityStop=true, a capped ladder (server risk profiles), and the
schedule layers ON. The stop-off/uncapped v4.00 configuration is a private
own-account choice and is never shipped or referenced in marketing.

## 2. Calendar distribution — automated, no customer uploads (BUILT)

Customers never handle the CSV. The platform is the source of truth:

- `/admin` → "No-trade schedule" panel: owner pastes the new calendar,
  publishes; versioned + sha256'd (`schedule_versions`, migration 0007).
- `GET /api/schedule?license_key=…` serves the active version to licensed
  EAs; the EA refreshes daily, holds it in memory, falls back to
  last-good. Contract: `ea-kit/INTEGRATION-GUIDE.md` §3.
- Annual study refreshes therefore reach every customer at once — this is
  a genuine subscription justification ("the calendar is maintained"),
  and it is honest.

## 3. Broker + VPS integration (IC Markets, VMs)

Realistic sequence, cheapest first:

1. **IC Markets partner link (now).** Join the IC Markets
   affiliate/introducing-broker programme and replace the plain broker
   links in /start-here and onboarding with partner links. REQUIRED:
   update the current "no affiliate relationship" disclosures site-wide to
   an explicit "we may earn a commission" disclosure the moment this
   happens — the honesty posture is worth more than hiding it. (Broker
   choice guidance stays factual; FCA/ASIC-regulated entity choice stays
   with the customer.)
2. **VPS partner link (now).** Same for ForexVPS/FXVM, and keep MT5's
   built-in Virtual Hosting documented as the near-zero-friction default.
3. **Guided setup, not API magic (near term).** Brokers do not offer
   retail account-opening APIs; the winning move is a frictionless guided
   flow: onboarding checklist step → partner link → "paste your MT5
   account number" → licence binds on first validate (already built).
4. **Managed VPS tier (later, optional).** A premium plan where we
   pre-provision a Windows VPS with MT5 + installer preloaded. Real
   revenue, real ops burden — only after the trial cohort proves demand.
   Not before Stripe (M12).

## 4. What viability requires (the honest checklist)

Product/tech (short): Alex ships the integrated EA (licence, telemetry,
schedule, capped-risk build) → dogfood gate (2–4 weeks on our own account)
→ trial cohort → Stripe → launch. All platform-side work for this exists
today except Stripe.

Business (the real list):

1. **A live verified track record of the filtered build.** Without it we
   are selling risk-management software on honesty alone; with it the
   funnel has proof. Start the Myfxbook/FX Blue-verified account the day
   the integrated EA exists, because the clock on "12 months verified"
   starts then.
2. **Unit economics.** Commission+swap ran ~25% of gross on the live demo
   — the Costs & ROI module already surfaces this per customer; pricing
   must be set against realistic customer account sizes (a £49/mo fee is
   26%/yr of a £2,200 account — be deliberate about the minimum sensible
   account size and say it out loud in onboarding).
3. **Legal confirmation** that the offering stays on the software side of
   the FCA perimeter (self-directed tools, no advice, no managed money) —
   solicitor review of the site + T&Cs before external trials; ICO
   registration.
4. **Support capacity.** The setup panel + start-here + nudges are built
   to deflect tickets; support@gritmarkets.com must still be answered.
5. **Churn realism.** Martingale customers churn after the first deep
   drawdown. The honest-risk positioning, the equity-stop-always-on build,
   the Safety Buffer skim habit and the daily digest exist precisely to
   make outcomes survivable and expectations correct. Retention IS risk
   management here.
6. **Trial → paid conversion mechanics** (M12, model confirmed
   2026-07-30): **no-card free first month** on every plan, demo or live.
   Trial = a manual-style licence with a 30-day expires_at (already
   built). From day ~14 a polite billing-setup email sequence begins
   (day 14 value recap, day 21, day 26, day 29 final) linking to Stripe
   Checkout; paying attaches a subscription to the existing licence (the
   migration path already in the schema). No payment → licence expires,
   EA stands down gracefully, 7-day win-back email. Abuse control: one
   free month per email AND per MT5 account number (the licence binding
   is the fingerprint). Card-required trials and signup-time dunning are
   dropped from the plan.

## 5. Sequence from today

1. Owner: migrations 0005–0007, owner role, /admin licence + schedule
   publish (paste GAM_NoTrade_v2.csv as v1).
2. Alex: weeks 1–3 per `ea-kit/HANDOVER.md`.
3. Dogfood on our own account; start the verified-tracking account.
4. Trial cohort (manual licences, ICO + solicitor sign-off first).
5. IC Markets + VPS partner programmes; swap links + disclosures.
6. Stripe milestone; public launch.
