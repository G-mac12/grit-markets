# Screenshot shot list — /start-here guides

Capture these on YOUR OWN accounts in one session (demo accounts are fine —
preferred, in fact). Rules:

- Save as **WebP**, using the exact filename given (the site picks each image
  up automatically once it exists at `public/images/start-here/<filename>`).
- 16:9-ish landscape, at least 1600px wide, UI at 100% zoom, personal details
  (names, emails, account numbers) cropped or redacted.
- Do NOT download or hot-link images from IC Markets, MetaQuotes or VPS
  providers — every image here is your own capture.
- The numbered callouts listed under each shot are rendered by the site;
  you don't need to draw arrows or markers on the screenshots themselves.


## Step 1 — How to choose a forex broker for an Expert Advisor

- [ ] `broker-account-market-diagram.webp`
      Shot: Simple diagram showing a trader's computer connecting through a broker to the foreign exchange market
      For guide step 1: Understand what a broker and a trading account are
      Callouts will point at: 1. Your computer running MT5 and the EA · 2. The broker executing your orders · 3. The currency market itself
- [ ] `ea-broker-requirements-checklist.webp`
      Shot: Checklist graphic of the four broker requirements for running an Expert Advisor
      For guide step 2: Learn what an EA actually needs from a broker
      Callouts will point at: 1. Raw or low spreads · 2. MetaTrader 5 with hedging accounts · 3. Fast, reliable execution
- [ ] `broker-regulation-footer-check.webp`
      Shot: Example broker website footer with regulatory licence details highlighted
      For guide step 3: Check the broker's regulation
      Callouts will point at: 1. Regulator names and licence numbers in the footer · 2. Link to the regulator's public register
- [ ] `broker-comparison-notes-table.webp`
      Shot: Self-made comparison table of three brokers scored on regulation, platform, account type and costs
      For guide step 4: Compare candidates with a simple notes table
      Callouts will point at: 1. One row per broker · 2. Columns for the four requirements plus costs
- [ ] `ic-markets-demo-signup-form.webp`
      Shot: Broker demo account sign-up form with the demo option selected instead of live
      For guide step 5: Start an IC Markets demo account application
      Callouts will point at: 1. Demo account option selected · 2. Live account option left for later
- [ ] `ic-markets-mt5-platform-selection.webp`
      Shot: Account setup screen showing platform choice with MetaTrader 5 selected and hedging account type highlighted
      For guide step 6: Choose MetaTrader 5, hedging and your base currency
      Callouts will point at: 1. MetaTrader 5 selected, not MT4 · 2. Hedging account type · 3. Base currency dropdown
- [ ] `ic-markets-demo-confirmation-email.webp`
      Shot: Demo account confirmation email showing the account number, password and MT5 server name
      For guide step 7: Set a realistic demo balance and save your credentials
      Callouts will point at: 1. Account (login) number · 2. Server name for MT5 login · 3. Password to store safely

## Step 2 — Do you need a VPS to run an EA on MT5?

- [ ] `vps-decision-flowchart.webp`
      Shot: Flowchart showing that demo users can use a home PC and live users should consider a VPS
      For guide step 1: Decide whether you need a VPS yet
      Callouts will point at: 1. On demo: home PC is fine · 2. Before going live: add a VPS
- [ ] `mt5-connection-status-bar.webp`
      Shot: MetaTrader 5 status bar showing the connection indicator and data transfer figures in the bottom corner
      For guide step 2: Understand why uptime matters for an EA
      Callouts will point at: 1. Connection indicator, green when connected · 2. No connection message when the link drops
- [ ] `vps-latency-region-map.webp`
      Shot: World map showing latency in milliseconds from several VPS regions to a broker data centre in London
      For guide step 3: Choose a VPS region close to your broker's server
      Callouts will point at: 1. Broker data centre location · 2. VPS in the same region, single-digit latency · 3. Distant VPS with much higher latency
- [ ] `vps-spec-minimums-table.webp`
      Shot: Table of minimum VPS specifications for a single MetaTrader 5 instance
      For guide step 4: Pick the minimum specification for one MT5 instance
      Callouts will point at: 1. 2 GB RAM minimum · 2. 1 to 2 vCPUs · 3. Windows Server operating system
- [ ] `vps-provider-types-comparison.webp`
      Shot: Comparison chart of forex-specialist VPS, general cloud providers and broker-provided VPS options
      For guide step 5: Compare the three types of VPS provider
      Callouts will point at: 1. Specialist host: pre-configured, dearer · 2. General cloud: cheap, more setup · 3. Broker VPS: convenient, fixed spec
- [ ] `windows-update-restart-settings.webp`
      Shot: Windows settings screen showing active hours configuration and sleep disabled in power options
      For guide step 6: Weigh the honest alternative of your own always-on PC
      Callouts will point at: 1. Active hours set to limit automatic restarts · 2. Sleep set to never in power settings
- [ ] `windows-remote-desktop-connection.webp`
      Shot: Remote Desktop Connection dialog with the VPS address entered and the remote Windows desktop opening
      For guide step 7: Connect to a VPS with Remote Desktop
      Callouts will point at: 1. VPS address in the Computer field · 2. Remote Windows desktop in its own window

## Step 3 — How to set up MetaTrader 5 for automated trading

- [ ] `broker-mt5-download-page.webp`
      Shot: Broker client portal downloads page with the MetaTrader 5 desktop installer for Windows highlighted
      For guide step 1: Download MT5 from your broker's website
      Callouts will point at: 1. MetaTrader 5 desktop download button · 2. Mobile and web versions to ignore for EA use
- [ ] `mt5-windows-installer-wizard.webp`
      Shot: MetaTrader 5 setup wizard on Windows with the install button and licence agreement checkbox visible
      For guide step 2: Run the installer and open the terminal
      Callouts will point at: 1. Licence agreement acceptance · 2. Install button with default settings
- [ ] `mt5-login-demo-account-dialog.webp`
      Shot: MetaTrader 5 login dialog with account number, password and broker demo server selected
      For guide step 3: Log in with your demo credentials
      Callouts will point at: 1. Account number from the broker email · 2. Exact demo server name in the dropdown · 3. Green connection indicator after login
- [ ] `mt5-terminal-layout-overview.webp`
      Shot: Full MetaTrader 5 terminal with Market Watch, chart window, Navigator and Toolbox panels labelled
      For guide step 4: Take a two-minute tour of the terminal
      Callouts will point at: 1. Market Watch with live prices · 2. Navigator listing Expert Advisors · 3. Toolbox with Experts and Journal tabs
- [ ] `mt5-algo-trading-button-enabled.webp`
      Shot: MetaTrader 5 toolbar with the Algo Trading button switched on and showing green
      For guide step 5: Enable the Algo Trading button
      Callouts will point at: 1. Algo Trading button in the green, enabled state · 2. Toolbar position for quick access
- [ ] `mt5-enable-webrequest-whitelist.webp`
      Shot: MetaTrader 5 options dialog on the Expert Advisors tab with the WebRequest whitelist containing https://gritmarkets.com
      For guide step 6: Add https://gritmarkets.com to the WebRequest whitelist
      Callouts will point at: 1. Allow WebRequest for listed URL ticked · 2. https://gritmarkets.com entered exactly · 3. OK button to save the settings
- [ ] `mt5-journal-connection-log.webp`
      Shot: MetaTrader 5 Toolbox Journal tab showing successful login entries to the demo server
      For guide step 7: Confirm the setup in the Journal tab
      Callouts will point at: 1. Journal tab selected in the Toolbox · 2. Successful authorisation line for the demo account

## Step 4 — How to install an Expert Advisor on MT5 (step-by-step)

- [ ] `grit-dashboard-ex5-download.webp`
      Shot: Grit Markets subscriber dashboard downloads section with the .ex5 file download button highlighted
      For guide step 1: Download the .ex5 file from your account dashboard
      Callouts will point at: 1. Downloads section of the dashboard · 2. GritMarkets.ex5 download button
- [ ] `mt5-open-data-folder-menu.webp`
      Shot: MetaTrader 5 File menu open with the Open Data Folder item highlighted
      For guide step 2: Open the MT5 data folder
      Callouts will point at: 1. File menu expanded · 2. Open Data Folder menu item
- [ ] `mql5-experts-folder-ex5-file.webp`
      Shot: Windows Explorer showing the MQL5 Experts folder with the GritMarkets.ex5 file copied in
      For guide step 3: Copy the file into MQL5/Experts
      Callouts will point at: 1. Folder path ending in MQL5\Experts · 2. The copied .ex5 file
- [ ] `mt5-navigator-refresh-expert-list.webp`
      Shot: MetaTrader 5 Navigator panel with the right-click menu open on Expert Advisors and Refresh highlighted
      For guide step 4: Refresh the Navigator panel
      Callouts will point at: 1. Expert Advisors section in Navigator · 2. Refresh option in the right-click menu · 3. The EA listed after refreshing
- [ ] `mt5-drag-ea-onto-chart.webp`
      Shot: Expert Advisor being dragged from the Navigator panel onto an open currency pair chart in MetaTrader 5
      For guide step 5: Open a chart and drag the EA onto it
      Callouts will point at: 1. EA name in Navigator · 2. Target chart for the correct pair
- [ ] `ea-inputs-dialog-settings.webp`
      Shot: Expert Advisor Inputs tab showing licence key, base lot, max recovery levels and equity stop fields
      For guide step 6: Fill in the Inputs tab field by field
      Callouts will point at: 1. Licence key field · 2. Base lot and max recovery levels · 3. Equity stop value
- [ ] `ea-common-tab-allow-algo-trading.webp`
      Shot: Expert Advisor settings dialog on the Common tab with the Allow Algo Trading checkbox ticked
      For guide step 7: Tick Allow Algo Trading in the Common tab
      Callouts will point at: 1. Common tab selected · 2. Allow Algo Trading checkbox ticked
- [ ] `mt5-chart-corner-ea-status.webp`
      Shot: Chart top-right corner showing the EA name with an active status icon and the Experts log confirming initialisation
      For guide step 8: Confirm the EA is actually running
      Callouts will point at: 1. EA name and active icon on the chart corner · 2. Initialisation line in the Experts tab

## Step 5 — Running an EA safely: first run and daily use

- [ ] `mt5-quiet-chart-ea-waiting.webp`
      Shot: MetaTrader 5 chart with the EA active in the corner and no open positions, showing a normal waiting state
      For guide step 1: Expect a quiet first day and leave it alone
      Callouts will point at: 1. EA status icon showing active · 2. Empty Trade tab, no positions yet
- [ ] `grit-dashboard-equity-positions-overview.webp`
      Shot: Grit Markets subscriber dashboard showing equity, open positions, recovery level and licence status panels
      For guide step 2: Learn to read the subscriber dashboard
      Callouts will point at: 1. Equity figure updating live · 2. Current recovery level indicator · 3. Licence status showing valid
- [ ] `dashboard-recovery-level-warning.webp`
      Shot: Dashboard chart showing recovery level rising towards its cap and equity nearing the equity stop line
      For guide step 3: Distinguish normal drawdown from warning signs
      Callouts will point at: 1. Recovery level near the configured cap · 2. Equity approaching the equity stop line · 3. Normal shallow drawdown earlier for comparison
- [ ] `worst-case-intervention-checklist.webp`
      Shot: Written intervention rule card stating do not interfere mid-sequence, but stop the EA if the worst case is no longer acceptable
      For guide step 4: Set your intervention rule before you need it
      Callouts will point at: 1. Default rule: do not touch mid-sequence · 2. Override: stop if you no longer accept the worst case
- [ ] `mt5-remove-expert-from-chart.webp`
      Shot: MetaTrader 5 chart context menu showing Expert List for removal, with the Algo Trading button and Trade tab also marked
      For guide step 5: Know the three ways to stop the EA, in order
      Callouts will point at: 1. Expert List option to remove the EA · 2. Algo Trading button as the master pause · 3. Trade tab where positions are closed manually
- [ ] `daily-check-routine-checklist.webp`
      Shot: Four-point daily checklist covering EA status, terminal logs, dashboard figures and licence validity
      For guide step 6: Build a two-minute daily routine
      Callouts will point at: 1. Chart status and logs · 2. Dashboard figures against yesterday
- [ ] `live-account-smallest-base-lot-settings.webp`
      Shot: EA inputs dialog on a live account showing the base lot set to the smallest available value
      For guide step 7: Move from demo to live only when you qualify yourself
      Callouts will point at: 1. Base lot at the minimum value · 2. Equity stop set before the first live trade

---

Total shots: 36. When done, drop the files into `public/images/start-here/` and redeploy — no code changes needed.
