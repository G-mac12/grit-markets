# Grit Markets — Windows Installer Specification

Inno Setup (or equivalent). The installer's job: get a non-technical
customer from download to a chart-ready EA with as few manual steps as
possible, and be explicit about the three steps that cannot be automated.

## What it must do

1. **Detect MT5 data folders — multi-terminal aware.** Enumerate
   `%APPDATA%\MetaQuotes\Terminal\<instance-hash>\` and offer a checklist
   of detected terminals (identified by the broker name in
   `origin.txt`/`terminal.ini` where readable). Install into every ticked
   terminal.
2. **Copy the EA** to `MQL5\Experts\GritMarkets\GritMarkets.ex5` in each
   selected terminal.
3. **Write the licence key** (asked for on an installer page, validated
   against the `GM(-[A-Z2-9]{5}){4}` shape client-side only) to
   `MQL5\Files\GritMarkets\license.txt` in each selected terminal. The EA
   reads this on first attach if its `LicenseKey` input is empty — the
   input always wins when set. The telemetry secret is pasted into the
   same page optionally and written to `MQL5\Files\GritMarkets\secret.txt`
   (plain file inside MT5's own sandbox — same trust boundary as the
   terminal itself; never write outside the data folder).
4. **Install a chart template** `GritMarkets.tpl` to `Profiles\Templates\`
   with the EA pre-attached, so setup is: open EURUSD chart → right-click →
   Template → GritMarkets.
5. **Finish screen — the three irreducible manual steps**, verbatim:
   - Log MT5 into your broker account (demo recommended for weeks 1–2).
   - Enable Algo Trading (toolbar button).
   - Tools → Options → Expert Advisors → tick "Allow WebRequest for listed
     URL" → add `https://gritmarkets.com`.
   Plus: "The EA draws a setup panel on the chart that checks each of these
   and tells you exactly what's missing."

## Non-functional

- No admin elevation needed (everything lives under `%APPDATA%`).
- Uninstaller removes the files it wrote, nothing else.
- `[OWNER ACTION: purchase a code-signing certificate]` — unsigned
  installers trip SmartScreen ("Windows protected your PC") and will torch
  trial conversion. An OV certificate is the minimum; EV skips SmartScreen
  reputation-building entirely.
- Installer download is served from the dashboard (`ea-builds` bucket,
  signed URLs) — same channel as the raw `.ex5`.
