# Grit Markets — EA Developer Brief (SUPERSEDED — see ea-kit/)

This brief has been replaced by the full **EA Integration Kit** in
[`ea-kit/`](./ea-kit/), which reflects the revised Phase 2 build:

- **`ea-kit/INTEGRATION-GUIDE.md`** — the hand-off document. Input surface
  (exactly three inputs: `LicenseKey`, `EnableTelemetry`, `MagicNumber` —
  all strategy parameters are server-delivered and removed from the inputs
  dialog), module wiring, both API contracts, the settings lifecycle, the
  HMAC test vector, and the pre-ship test harness.
- **`ea-kit/GMLicense.mqh`** — licence validation + 12h revalidation with
  network-failure grace (replaces the `ALLOWED_ACCOUNTS` whitelist).
- **`ea-kit/GMTelemetry.mqh`** — HMAC-signed 5-minute heartbeat, immediate
  push on trade close, in-memory retry buffer, ack-based trade queue.
- **`ea-kit/GMConfig.mqh`** — server-delivered risk profiles: memory only,
  never logged, applied only when flat, version echoed to confirm.
- **`ea-kit/GMCrypto.mqh`** — HMAC-SHA256 via the terminal's built-in
  SHA-256.
- **`ea-kit/GMPanel.mqh`** — the on-chart setup assistant (five checks,
  each failure shows its exact fix).
- **`ea-kit/INSTALLER-SPEC.md`** — Windows installer + chart template spec.

Key changes from the original Week 1 brief: strategy inputs are no longer
exposed (previously "flip `UseEquityStop`/`MaxLegsPerBasket` defaults");
the compiled-in defaults are the Balanced profile with the equity stop ON,
and profile changes arrive from the platform. The whitelist removal, the
licence endpoint contract, and the reason-code behaviour table carry over
unchanged into the integration guide.
