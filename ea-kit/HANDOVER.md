# Grit Markets — EA Developer Handover (for Alex)

**From:** Grant MacMillan, Grit Agility Ltd
**Project:** Connect the GritAgilityMartingale EA to the Grit Markets platform (gritmarkets.com)

## The one-paragraph brief

The commercial platform around the EA is **built and live in production**:
customers subscribe on gritmarkets.com, get a licence key, and see a full
dashboard (equity, ladder analytics, alerts, remote risk profiles) fed by
the EA. What's missing is the EA side of the bridge — your part. Today the
EA has no internet capability: it authorises users against a hardcoded
account whitelist and never reports anything. This handover replaces that
with online licence validation, signed telemetry, and server-delivered
strategy configuration. Everything on the server already exists and is
live — you are integrating against working endpoints, not a spec.

## What you're building (four changes)

1. **Licence validation** replaces `ALLOWED_ACCOUNTS[]`. The EA validates
   a licence key over HTTPS on startup and every 12h. Working reference
   module: `GMLicense.mqh`.
2. **Telemetry** — a signed heartbeat every 5 minutes plus an immediate
   push when a trade closes, feeding the customer dashboard. Reference:
   `GMTelemetry.mqh` + `GMCrypto.mqh`.
3. **Server-delivered configuration** — the EA's strategy inputs
   (BaseLot, LotMultiplier, MaxLegsPerBasket, TakeProfit_Points,
   GridStep_Points, UseEquityStop, EquityStopPercent, UseNewsFilter) are
   **removed from the inputs dialog** and arrive from the platform
   instead, applied only when the basket is flat. The shipped EA exposes
   exactly three inputs: `LicenseKey`, `EnableTelemetry`, `MagicNumber`.
   Reference: `GMConfig.mqh`. This is deliberate IP protection — treat it
   as a hard requirement.
4. **On-chart setup panel** — five OK/FIX rows (EA running, Algo Trading,
   WebRequest whitelist, licence, telemetry) so customers self-diagnose
   instead of emailing support. Reference: `GMPanel.mqh`.

Plus a **Windows installer** (spec: `INSTALLER-SPEC.md`) — can follow as a
second phase after the EA itself works.

## Where everything is

Everything technical lives in this repo folder — **`ea-kit/`**:

| File | What it is |
|---|---|
| `INTEGRATION-GUIDE.md` | **Start here.** Wiring, both API contracts, reason-code behaviour table, settings lifecycle, HMAC test vector, pre-ship test checklist |
| `GMLicense.mqh` `GMTelemetry.mqh` `GMConfig.mqh` `GMCrypto.mqh` `GMPanel.mqh` | Working reference MQL5 — copy in and adapt |
| `INSTALLER-SPEC.md` | Installer + chart-template requirements |

Public transparency docs (same contracts, customer-facing wording):
gritmarkets.com/docs/license-validation-mql5 and
gritmarkets.com/docs/telemetry-and-settings-sync-mql5.

The EA source (`GritAgilityMartingale.mq5`) is not in this repo — Grant
holds it and you have your own copy.

## What Grant gives you

1. **Read access to this repo** (GitHub invite — accept the email).
2. **A test licence key + telemetry secret** (issued from the platform's
   admin panel) — validate against production with these; there is no
   staging environment and none is needed, the endpoints are idempotent
   and the test licence is yours.
3. That's all. You do **not** need Supabase, Vercel, or any server access
   — if you find yourself wanting it, something's off-spec; call Grant.

## Deliverables

1. Updated `.mq5` source back to Grant (he keeps the source).
2. Compiled **`GritMarkets.ex5`**, version `1.0.0`, three inputs only,
   compiled-in defaults = the shipped "Balanced" profile (0.01 / ×1.21 /
   21 legs / TP 34 / grid 21 / equity stop ON at 20% / news filter ON).
3. Evidence the test checklist in `INTEGRATION-GUIDE.md` passed (a short
   screen recording of the panel going all-green and the dashboard
   updating is ideal).
4. One paragraph of release notes.
5. (Phase 2) the installer per spec.

## Suggested order

- **Week 1:** licence validation + whitelist removal + panel. Smallest
  change, makes the EA sellable.
- **Week 2:** telemetry + settings channel + `sequence_level` tagging on
  closed trades. Lights up the whole dashboard.
- **Then:** installer, once the .ex5 is proven.

## Ground rules (from the platform's compliance constraints)

- Never transmit broker credentials — the telemetry payload is the
  contract, nothing more.
- Strategy parameters live in EA memory only: never written to disk,
  never printed to logs, never on-chart.
- Telemetry is reporting only — no trading decision may depend on it, and
  network failure must never interrupt an open recovery sequence.
- The two endpoint URLs are permanent. Never point the EA anywhere else.

Questions → Grant, or support@gritmarkets.com.
