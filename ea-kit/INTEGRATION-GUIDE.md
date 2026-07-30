# Grit Markets — EA Integration Guide

For whoever compiles `GritAgilityMartingale.mq5` into the shipping
`GritMarkets.ex5`. The four `.mqh` modules in this folder are working
reference implementations of the platform integration; wire them into the
EA as described here. The platform side (both endpoints, the dashboard, the
settings channel) is live in production — nothing here depends on unbuilt
server work.

## The input surface (hard constraint)

The shipped EA exposes exactly THREE inputs:

```mql5
input string LicenseKey      = "";    // GM-XXXXX-XXXXX-XXXXX-XXXXX
input bool   EnableTelemetry = true;  // feeds the customer dashboard
input long   MagicNumber     = 20260401;
```

Every strategy parameter (`BaseLot`, `LotMultiplier`, `MaxLegsPerBasket`,
`TakeProfit_Points`, `GridStep_Points`, `UseEquityStop`, `EquityStopPercent`,
`UseNewsFilter`, …) is **removed from the inputs dialog** and driven from
`g_gm_params` (GMConfig.mqh) instead. Compiled-in defaults = the Balanced
profile (0.01 / ×1.21 / 21 legs / 34 pts TP / 21 pts grid / stop ON at 20% /
news filter ON). The always-on protections (Friday cutoff, Monday warm-up,
rollover blackout, holiday block, volatility cap, daily range gate, daily
stop limit) stay compiled in with their current values — they are engine
behaviour, not user settings.

Also remove: the `ALLOWED_ACCOUNTS[]` whitelist and its check —
licence validation replaces it entirely.

## Wiring the modules

```mql5
#include "GMLicense.mqh"
#include "GMTelemetry.mqh"   // includes GMCrypto.mqh + GMConfig.mqh
#include "GMPanel.mqh"

string TelemetrySecret = "";  // read from file — see installer spec; may
                              // also be a 4th input if the file is absent

int OnInit()
  {
   if(!GM_ValidateLicense(LicenseKey, "1.0.0"))
     {
      GM_PanelUpdate(EnableTelemetry);   // draw the FIX rows before leaving
      // graceful shutdown ONLY on a parsed rejection; on network failure
      // g_gm_license_checked_at stays 0 and the timer keeps retrying
      if(g_gm_license_hard_fail) { ExpertRemove(); return(INIT_FAILED); }
     }
   EventSetTimer(60);
   return(INIT_SUCCEEDED);
  }

void OnTimer()
  {
   GM_LicenseTimerTick(LicenseKey, "1.0.0");
   GM_TelemetryTimerTick(EnableTelemetry, LicenseKey, TelemetrySecret);
   GM_ApplyPendingIfFlat(!BasketIsOpen());   // your basket-state accessor
   GM_PanelUpdate(EnableTelemetry);
  }

void OnDeinit(const int reason) { EventKillTimer(); GM_PanelRemove(); }
```

In `OnTradeTransaction`, when a position closes, fill a `GMTradeRec`
(including `sequence_level` — the leg number the position held in its
basket, 1 = base leg) and call `GM_QueueClosedTrade`, then optionally
`GM_PushTelemetry` for the immediate push.

Gate **new basket opens** on `GM_MayOpenNewBasket()`. Never gate the
management of open positions on licensing or telemetry.

## API contract

### 1. `POST https://gritmarkets.com/api/license/validate`

Header `Content-Type: application/json`, timeout 5000 ms.

Request: `{"license_key":"GM-…","mt5_account":"12345678","ea_version":"1.0.0"}`
Response: `{"valid":bool,"reason":string,"expires":string|null}` — HTTP 200
even for rejections; parse the body, don't gate on status.

| `reason` | EA behaviour |
|---|---|
| `ok` / `bound` | trade normally (`bound` = account auto-bound on first use) |
| `unknown_key`, `bad_request` | log + `ExpertRemove()` on init; stop new baskets if on revalidation |
| `account_not_bound` | ditto — key at its account limit |
| `license_suspended` / `license_revoked` / `license_expired` | ditto |
| `subscription_*` | ditto — billing lapsed |
| `rate_limited` | back off; the module retries hourly |
| `service_unavailable` (503) | treat as network failure — keep last-known-good |

### 2. `POST https://gritmarkets.com/api/telemetry`

Headers `Content-Type: application/json` and
`X-GM-Signature: hex(HMAC-SHA256(raw_body, telemetry_secret))`.
The secret is issued once in the dashboard (Licenses & Downloads), prefix
`gmts_`. Payload shape: see `GM_BuildPayload` — snapshot + closed-trade
delta + `settings_version` (the version currently RUNNING, which is how a
pending version gets confirmed).

Response: `{"ok":true,"pending_settings":{"version":N,"params":{…}}|null,"ack_ticket":N}`.
Rate limit: ≥45s between snapshot-only pushes (trade pushes always accepted).
Rejections you may see: `bad_signature` (wrong secret), `account_not_bound`
(validate first), `demo_live_mismatch` (account flipped demo/live),
`telemetry_secret_not_issued`.

### Settings lifecycle

dashboard submit (2FA) → `pending` → EA sees it in a telemetry response →
`GM_ReadPendingSettings` parks it → `GM_ApplyPendingIfFlat` applies at the
next flat state → next push echoes the new `settings_version` → dashboard
marks `applied`. If the account never goes flat the change waits, and the
dashboard says so honestly at 48h.

### 3. `GET https://gritmarkets.com/api/schedule?license_key=GM-…`

The no-trade schedule (the tiered calendar derived from the 16.5-year
stop-out study — same `GAM_NoTrade_v2.csv` format the v4.00 build already
parses: `DATE`/`WEEK`/`ISOWEEK` rows, broker-server time). The platform is
the single source of truth: the owner publishes new versions in /admin and
every licensed EA picks them up automatically. Customers never handle files.

- Auth: an active licence key in the query string (read-only data).
- Response: `200 text/csv` with headers `X-GM-Schedule-Version` and
  `X-GM-Schedule-Sha256`. Pass `&have=<sha256>` to get `304` when your
  cached copy is already current.
- Fetch on init and once per day. Hold the schedule **in memory** (not the
  Files sandbox in the customer build). On any failure keep the last-good
  copy; if the EA has never fetched successfully, behave per your
  fail-closed setting exactly as with the CSV file today.
- Wire-in is mechanical: the v4.00 parser stays as is — replace "read
  MQL5\Files\GAM_NoTrade_v2.csv" with "read the response body", same
  line format.

## HMAC test vector

Before shipping, verify `GM_HmacSha256Hex`:

```
GM_HmacSha256Hex("The quick brown fox jumps over the lazy dog", "key")
= f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
```

## Test harness (before any customer)

1. Get a **demo licence** from the owner (issued in /admin) plus its
   telemetry secret.
2. MT5 demo account → whitelist `https://gritmarkets.com` → attach EA.
3. Walk the panel: all five rows must reach OK. Break each one on purpose
   (remove the whitelist entry, mangle the key, clear the secret) and
   confirm the FIX text matches reality.
4. Dashboard check: account appears in the owner's dashboard, equity chart
   ticks, a closed trade shows within seconds of closing with the right
   `sequence_level`.
5. Settings round-trip: owner submits a profile change from the dashboard;
   confirm it applies only after the basket is flat and the dashboard
   flips to applied.
6. Kill the network for 10 minutes mid-run: EA keeps trading, queue
   flushes on reconnect, no duplicate trades in the dashboard (idempotent
   by ticket).

## Deliverables

1. Updated source (owner keeps it), compiled **`GritMarkets.ex5`** versioned
   `1.0.0` — owner uploads to the `ea-builds` bucket as
   `1.0.0/GritMarkets.ex5`.
2. The installer per `INSTALLER-SPEC.md`.
3. One paragraph of release notes for the dashboard version panel.
