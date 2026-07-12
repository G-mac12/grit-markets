# Grit Markets — EA Developer Brief, Week 1

**Scope: licence validation + safer shipped defaults in `GritAgilityMartingale.mq5`.**
Telemetry and settings-sync are Week 2 — do **not** start them yet.

Everything on the platform side is already built, deployed and live at
https://gritmarkets.com. Nothing in this brief requires touching the website —
it is 100% MQL5 work against endpoints that already exist.

Estimated effort: **1–2 days** including testing.

---

## What you are building, in one paragraph

Today the EA authorises users with a hardcoded account-number whitelist
(`ALLOWED_ACCOUNTS[]`, line ~166) checked in `IsAccountAllowed()` (line ~219).
Week 1 replaces that with an online licence check: the user pastes a licence
key (format `GM-XXXXX-XXXXX-XXXXX-XXXXX`) into a new EA input; on startup the
EA POSTs it to `https://gritmarkets.com/api/license/validate` via
`WebRequest()`; the server verifies the subscription and binds the key to the
MT5 account number automatically on first use. No more recompiling to add a
customer. You also flip two shipped defaults so the compiled build matches
what the website tells customers they are getting.

Public reference documentation (written for auditors and customers, but the
MQL5 in it is your starting point):

- **https://gritmarkets.com/docs/license-validation-mql5** ← copy the code from here
- https://gritmarkets.com/docs/telemetry-and-settings-sync-mql5 (Week 2 — context only)

---

## Task 1 — Add the licence-key input and validation call

**Where:** new code near the top of the EA + a call from `OnInit()`.

1. Add the input:

   ```mql5
   input string InpLicenseKey = ""; // Your GM-XXXXX-XXXXX-XXXXX-XXXXX key
   ```

2. Copy the reference function `GM_ValidateLicense()` **verbatim** from
   https://gritmarkets.com/docs/license-validation-mql5 — it is complete and
   working MQL5 (WebRequest POST, JSON body, response parse, 4014 handling).

3. Call it from `OnInit()` **before** any trading logic initialises:

   ```mql5
   if(!GM_ValidateLicense("1.0.0"))
     {
      ExpertRemove();          // graceful shutdown: no trading without a licence
      return(INIT_FAILED);
     }
   ```

   Pass the real EA version string — keep it in one `#define` so future builds
   bump it in one place.

### Endpoint contract (already live — do not change the URL, ever)

`POST https://gritmarkets.com/api/license/validate`
Header: `Content-Type: application/json` · Timeout: 5000 ms

Request body:

```json
{ "license_key": "GM-XXXXX-XXXXX-XXXXX-XXXXX", "mt5_account": "12345678", "ea_version": "1.0.0" }
```

- `license_key` — the `InpLicenseKey` input, case-insensitive (server uppercases). Server regex: `^GM(-[A-Z2-9]{5}){4}$`.
- `mt5_account` — `AccountInfoInteger(ACCOUNT_LOGIN)` as a string, digits only.
- `ea_version` — build version string.

Response (always JSON, normally HTTP 200 even for rejections, so parse the body — don't gate on status code alone):

```json
{ "valid": true, "reason": "ok", "expires": "2026-08-01T00:00:00Z" }
```

| `reason` | Meaning | EA behaviour |
|---|---|---|
| `ok` | Valid, account already bound | Trade normally |
| `bound` | Valid, this account was just auto-bound (first use) | Trade normally |
| `unknown_key` | Key doesn't exist | Print reason, `ExpertRemove()` |
| `account_not_bound` | Key is at its account limit and this account isn't one of them | Print reason, `ExpertRemove()` |
| `license_suspended` / `license_revoked` | Licence disabled by admin | Print reason, `ExpertRemove()` |
| `subscription_canceled` / `subscription_past_due` / `subscription_missing` | Billing lapsed | Print reason, `ExpertRemove()` |
| `rate_limited` | Too many validation attempts | Wait and retry (see Task 3 timer); don't hammer |
| `bad_request` | Malformed key or account number | Print reason, `ExpertRemove()` |
| `service_unavailable` (HTTP 503) | Platform config issue, not user error | Treat as network failure (Task 3 grace rules) |

The only string you must check to authorise trading is `"valid":true`.
`reason` is for the Experts log so support can diagnose from a screenshot.

### WebRequest prerequisite (user-facing, but you must handle the failure)

MT5 blocks WebRequest unless the user whitelists the URL:
**Tools → Options → Expert Advisors → "Allow WebRequest for listed URL" → add
`https://gritmarkets.com`.** If missing, `WebRequest()` returns `-1` with
`GetLastError() == 4014`. The reference code already prints an actionable
message for this — keep it, it is our #1 predicted support ticket.

---

## Task 2 — Remove the account whitelist

**Where:** `ALLOWED_ACCOUNTS[]` (line ~166) and `IsAccountAllowed()` (line ~219).

- Delete the `ALLOWED_ACCOUNTS` array, the loop that checks it, and the
  "Contact Alex Wray" alert path.
- The licence server is now the single source of truth for who may run the EA
  (it enforces per-tier account limits and self-service rebinds — you don't
  implement any of that; it's server-side).
- Keep `IsAccountAllowed()`'s *other* checks if it does more than the
  whitelist (e.g. hedging-account check) — only the whitelist logic goes.

---

## Task 3 — Revalidation timer (not per-trade)

Licence checks must **never** sit in trading logic. Behaviour to implement:

- Revalidate on a timer every **12 hours** (use `EventSetTimer` /
  an hour-granularity check in `OnTimer`, not `OnTick`).
- **Network failure ≠ invalid licence.** On timeout/-1/5xx: keep trading on
  the last known-good result and retry hourly. Only a parsed
  `"valid":false` counts as a rejection.
- On persistent rejection (a real `"valid":false` on revalidation): stop
  opening **new** baskets, but manage any open recovery sequence to its
  normal close. Never abandon an open ladder because the subscription lapsed
  mid-basket.
- On `rate_limited`: back off (retry in 1 hour), don't loop.

---

## Task 4 — Safer shipped defaults

Two input defaults currently contradict what the website promises customers.
Change the **default values** (users can still override):

| Input | Line | Current | Ship as | Why |
|---|---|---|---|---|
| `UseEquityStop` | ~68 | `false` | **`true`** | The site describes the equity stop as armed by default and warns users if they disable it. The compiled build must match. |
| `MaxLegsPerBasket` | ~54 | `196` | **`21`** | 196 is effectively uncapped (a ×1.21 ladder reaches broker max-lot long before leg 196). The site documents 21 as the shipped cap. |

`EquityStopPercent = 20.0` stays as is — that matches the published default.
Update the header comment at line ~49 (the "effectively uncapped" note) to
reflect the new default.

---

## Task 5 — Test before delivering

A demo licence exists on the platform for exactly this purpose.

1. **Get a test key:** Grant will supply one from the dashboard (Licenses &
   Downloads). Format check: `GM-` + four groups of five characters.
2. **Happy path:** fresh demo account → whitelist the URL in MT5 options →
   paste key → attach EA → expect `reason:"bound"` in the log on first run,
   `"ok"` on the second. EA trades normally.
3. **Wrong key:** change one character → expect `unknown_key` log line and the
   EA removes itself without opening trades.
4. **No whitelist:** remove the URL from MT5 options → expect the 4014
   message naming `https://gritmarkets.com`, EA removes itself.
5. **Network down:** validate once successfully, then disconnect →
   confirm the EA keeps managing an open basket and retries hourly.
6. **Defaults:** attach with all-default inputs → confirm the inputs dialog
   shows `UseEquityStop=true`, `MaxLegsPerBasket=21`.

---

## Deliverables

1. Updated `GritAgilityMartingale.mq5` source (Grant keeps the source).
2. Compiled **`GritMarkets.ex5`**, version string `1.0.0`, built with the
   Task 4 defaults. Grant uploads it to the platform's `ea-builds` storage
   bucket as `1.0.0/GritMarkets.ex5` — the dashboard download button already
   points there.
3. One paragraph of release notes (what changed vs. the whitelist build) for
   the dashboard's version panel.

## Out of scope this week (do not build yet)

- Telemetry pushes, HMAC signing, `EnableTelemetry` / `TelemetrySecret`
  inputs — Week 2, spec at /docs/telemetry-and-settings-sync-mql5.
- Settings sync / remote parameter application — Week 2.
- `sequence_level` tagging on trades — Week 2.
- Any change to entry logic, ladder maths, filters, or session gates.

## Questions

Anything ambiguous: support@gritmarkets.com or straight to Grant. If the
endpoint ever seems down during development, check the response body first —
a `503 service_unavailable` means platform config, not your code.
