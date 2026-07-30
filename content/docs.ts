export interface GuideStep {
  name: string;
  text: string;
}

export interface GuideCodeBlock {
  title: string;
  language: string;
  code: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;        // <=155 chars
  intro: string;              // one paragraph
  steps: GuideStep[];         // 5-9 steps
  notes?: string[];           // optional caveats
  codeBlocks?: GuideCodeBlock[];
}

export const GUIDES: Guide[] = [
  {
    slug: "install-grit-markets-mt5",
    title: "How to install Grit Markets in MetaTrader 5",
    description:
      "Step-by-step guide to installing the Grit Markets expert advisor in MetaTrader 5, authorising licence validation and attaching it to a chart.",
    intro:
      "This guide takes you from a fresh subscription to Grit Markets running on a MetaTrader 5 chart. It assumes you already have MT5 installed and connected to a broker account of the hedging type. The whole process takes around ten minutes, and no programming knowledge is required. If anything behaves differently from what is described here, stop and contact support rather than improvising, particularly on a live account.",
    steps: [
      {
        name: "Download the EA from your account dashboard",
        text: "Sign in to your account dashboard at gritmarkets.com and open the downloads section. Download the Grit Markets EA file, which has the .ex5 extension, and save it somewhere you can find it, such as your Downloads folder. Your licence key is shown in the same dashboard; keep that page open, as you will need the key in a later step.",
      },
      {
        name: "Open the MT5 data folder",
        text: "Start MetaTrader 5 and log in to the account you intend to license. In the menu, choose File and then Open Data Folder. A Windows Explorer window opens showing the terminal's data directory. This is where MT5 keeps its expert advisors, and it is often not where the programme itself is installed, which is why you should always reach it through this menu rather than browsing manually.",
      },
      {
        name: "Copy the EA into MQL5/Experts",
        text: "In the data folder window, open the MQL5 folder, then the Experts folder inside it. Copy the downloaded Grit Markets .ex5 file into this Experts folder. Return to MetaTrader 5 and refresh the Navigator panel by right-clicking Expert Advisors and choosing Refresh, or simply restart the terminal. Grit Markets should now appear in the Navigator under Expert Advisors.",
      },
      {
        name: "Allow WebRequest to https://gritmarkets.com",
        text: "In MT5, open Tools and then Options, and select the Expert Advisors tab. Tick the box labelled Allow WebRequest for listed URL, click Add, and enter https://gritmarkets.com exactly, including the https prefix and with no trailing slash or extra characters. Click OK. This step is essential: Grit Markets validates your licence by contacting this address, and if the URL is missing or mistyped the EA cannot activate and will not trade.",
      },
      {
        name: "Enable Algo Trading",
        text: "Still in the Expert Advisors tab of the Options window, confirm that Allow Algo Trading is ticked, then close the dialogue. On the main toolbar, check that the Algo Trading button is switched on; it shows green when trading is enabled. If this button is off, expert advisors are loaded but cannot place orders, which is a common cause of an EA that appears to run but never trades.",
      },
      {
        name: "Attach Grit Markets to a chart",
        text: "Open a chart for the symbol you intend to trade, on the timeframe recommended in the documentation. Drag Grit Markets from the Navigator onto the chart, or right-click it and choose Attach to Chart. In the dialogue that appears, open the Common tab and confirm that Allow Algo Trading is ticked for this instance.",
      },
      {
        name: "Enter your licence key in the EA inputs",
        text: "Switch to the Inputs tab of the same dialogue. Find the licence key field and paste the key from your account dashboard, taking care not to include leading or trailing spaces. Review the remaining inputs against the risk configuration guide before proceeding; the defaults are a starting point, not a recommendation. Click OK to attach the EA.",
      },
      {
        name: "Confirm the EA is active and licensed",
        text: "Look at the top-right corner of the chart: the EA's name should appear with an icon indicating it is running. Open the Experts tab in the Toolbox at the bottom of the terminal and check the log for a message confirming successful licence validation. If you see a WebRequest error, return to the earlier step and re-check the URL entry. Once validation is confirmed, the installation is complete; consider running on a demo account first to observe a full trade cycle.",
      },
    ],
    notes: [
      "Grit Markets requires a hedging-type MT5 account. On a netting account the terminal merges positions in one symbol, which breaks the strategy's basket management. Check your account type in the terminal before going live.",
      "Your licence is bound to one MT5 account number. If you attach the EA to a different account, validation will fail. See the licensing section of the documentation for how to rebind a licence.",
      "For unattended operation through the trading week, we recommend running the terminal on a Windows VPS. See our VPS setup guide.",
      "Installing and running the EA involves real trading risk once attached to a live account. The Martingale strategy it implements can produce large drawdowns up to and including the loss of the account balance; configure the risk controls before the first live trade.",
    ],
  },
  {
    slug: "vps-setup-mt5",
    title: "How to set up a Windows VPS for MetaTrader 5",
    description:
      "How to choose and configure a Windows VPS so MetaTrader 5 and your expert advisor run reliably 24 hours a day, five days a week.",
    intro:
      "An expert advisor only manages trades while its terminal is running and connected, so anything that interrupts your computer, including sleep, updates, reboots or a broadband drop, interrupts your risk management too. A virtual private server, a rented Windows machine in a data centre, removes those failure points and is the standard way to run an EA twenty-four hours a day through the trading week. This guide covers choosing a provider and configuring the server so MetaTrader 5 survives unattended.",
    steps: [
      {
        name: "Choose a suitable VPS provider and plan",
        text: "You need a Windows Server VPS with at least 2 GB of RAM, two CPU cores and 40 GB of storage for a single MT5 terminal; more RAM helps if you plan to run several terminals. Prefer an established provider with an uptime commitment of 99.9 percent or better. Forex-specialist VPS hosts and general providers both work; what matters is reliability, not branding. Expect to pay a modest monthly fee, and treat it as part of your trading costs.",
      },
      {
        name: "Pick a data centre near your broker's servers",
        text: "Choose a VPS location close to where your broker hosts its trade servers, which brokers will state on request; London is a common choice for UK and European brokers. Proximity reduces order latency. For a strategy like Grit Markets, uptime and stability matter far more than shaving milliseconds, so never trade a reliable data centre for a marginally closer one.",
      },
      {
        name: "Connect to the VPS by Remote Desktop",
        text: "Your provider will supply an IP address, username and password. On your own computer, open Remote Desktop Connection on Windows, or Windows App on Mac, enter the IP address and log in. You will see a full Windows desktop running in the data centre. Change the initial password immediately to a strong, unique one, since remote desktop servers are constantly probed by automated attacks.",
      },
      {
        name: "Secure the server",
        text: "Before installing anything, take basic hardening steps: create a strong password, enable Network Level Authentication for remote desktop if the provider has not already, apply pending Windows security updates once, and do not install any software beyond what trading requires. If the provider offers two-factor authentication for its control panel, enable it. The server will hold your broker credentials, so treat it with the same care as online banking.",
      },
      {
        name: "Install MetaTrader 5 and log in to your broker account",
        text: "Inside the remote desktop session, download the MT5 installer from your broker's website, not from a third-party link, and install it. Log in with your account credentials and confirm the connection indicator at the bottom right of the terminal shows an active connection to the trade server. Then install Grit Markets by following our installation guide from within the VPS session, including the WebRequest authorisation for https://gritmarkets.com.",
      },
      {
        name: "Configure Windows so the terminal survives unattended",
        text: "Set the Windows power plan to High performance and disable sleep and hibernation, which some VPS images leave enabled. In Windows Update settings, set active hours so automatic restarts fall in the weekend market closure rather than mid-session. Place a shortcut to the MT5 terminal in the Windows Startup folder so the platform relaunches automatically if the server reboots. Note that after an unexpected reboot MT5 reopens, but you should still verify the EA reattached and the Algo Trading button is on.",
      },
      {
        name: "Test the full setup on a demo account",
        text: "Run the complete arrangement, VPS, terminal and EA, on a demo account for at least a week. Disconnect your home computer entirely and confirm trades continue to be managed, which proves the setup does not depend on your local machine. Deliberately restart the VPS once and watch what recovers automatically and what needs a manual step, so you learn this on a demo rather than during a live drawdown.",
      },
      {
        name: "Set up a monitoring routine",
        text: "Decide how you will know if something goes wrong. At minimum, log in by remote desktop once a day during the trading week to confirm the terminal is connected and the EA is running, and enable the MT5 mobile app's push notifications for trade activity on the account. Some VPS providers offer uptime alerts; switch them on. An unmonitored VPS is better than an unmonitored laptop, but it is not a substitute for checking in.",
      },
    ],
    notes: [
      "MT5's built-in Virtual Hosting, rented from inside the terminal, is a reasonable alternative to a self-managed VPS: it is cheap and near your broker, but it gives you no Windows desktop and less control. This guide assumes a full Windows VPS.",
      "A VPS keeps the software running; it does not reduce the risk of the strategy itself. A Martingale EA on perfect infrastructure can still lose the account it trades. Configure the risk controls first.",
      "Never store your dashboard licence key or broker passwords in plain text files on the server.",
    ],
  },
  {
    slug: "configure-risk-settings",
    title: "How to configure Grit Markets risk controls",
    description:
      "How to set the Grit Markets equity stop, recovery level cap, base lot sizing and trading filters, and what these controls can and cannot protect you from.",
    intro:
      "Grit Markets automates a Martingale-based strategy, which means its risk controls are not optional extras; they are the difference between a bounded worst case and an unbounded one. Risk is configured from your dashboard, not in MT5: the EA itself exposes only your licence key, a telemetry switch and a magic number, and receives its strategy configuration from the platform as one of three risk profiles. Every profile keeps the equity stop armed — there is no configuration of Grit Markets without a hard stop. The guiding principle is honest: a tighter profile reduces the size of drawdowns and realises small losses more often, a looser profile does the reverse, and no profile removes the risk of losing the account balance. Decide your worst case first, then pick the profile that enforces it.",
    steps: [
      {
        name: "Decide your maximum acceptable loss before touching any setting",
        text: "Write down, as an amount of money, the most you are prepared to lose on the account running Grit Markets. Not per trade and not per month: in total, in the worst case. Every subsequent choice exists to enforce this number, and if you skip this step the choices have nothing to enforce. If the honest answer is that you cannot afford to lose the balance on this account, fund a smaller account before proceeding.",
      },
      {
        name: "Understand what a risk profile controls",
        text: "A profile bundles the engine's sizing and protection parameters — first-leg size, ladder depth and spacing, and the equity stop level — into one audited choice. Conservative runs a shallower ladder with the tightest stop; Balanced is the shipped configuration; Aggressive runs a deeper ladder and tolerates a deeper drawdown before flattening. The dashboard shows each profile's equity stop and its worst-case exposure relative to Balanced, so you can compare them against the number you wrote down. The raw parameter values are managed server-side and delivered to the EA directly — they are the strategy's engineering, not user settings.",
      },
      {
        name: "Know your equity stop",
        text: "Every profile keeps the equity stop armed: when floating losses reach the profile's percentage of your balance, the whole basket closes and trading halts for the day. Pick the profile whose stop percentage, applied to your balance, stays inside the maximum loss from step one. Be aware of its limits: in a fast or gapping market the closing prices can be worse than the trigger level, so the realised loss can exceed the configured one.",
      },
      {
        name: "Size the account, not the lot",
        text: "First-leg sizing is fixed within each profile, so the variable you control is the account balance behind it. The engine was engineered against a 2,500 baseline per 0.01 of first-leg volume — an underfunded account reaches its equity stop on shallower, more ordinary ladders. Fund the account to at least that baseline, and use the simulator on gritmarkets.com to see what drawdowns the ladder geometry produces at your balance before committing real money.",
      },
      {
        name: "Trust the always-on protections",
        text: "Independent of profile choice, the engine pauses around high-impact USD and EUR calendar events, classified by what they are rather than the calendar's own star rating: rate decisions, NFP and central-bank press conferences carry the widest window (24 hours before to 2 hours after), CPI and GDP the next (60 minutes before to 90 after), other high-impact releases the base tier (30 before to 60 after), with the calendar's rating as a fallback so nothing goes unclassified. On top of that sits the maintained no-trade calendar — built from a 16.5-year study of this strategy class's stop-out events and delivered to the EA automatically — plus a Friday cutoff before the weekend close, a Monday warm-up, a rollover blackout around broker midnight, and a holiday block over Christmas and New Year. These are part of the engine, not options to configure away. Remember their limit: filters cover scheduled events and studied history; the most damaging moves are often unscheduled and unprecedented.",
      },
      {
        name: "Verify the configuration on a demo account",
        text: "Attach the EA to a demo account of the same size and broker conditions as your intended live account, apply your chosen profile from the dashboard, and let it run until you have watched at least one full recovery basket form and resolve. Confirm the equity stop and ladder behaviour in the dashboard's analytics. A configuration you have watched fail safely on demo is worth more than any backtest.",
      },
      {
        name: "Go live, then review on a schedule and never mid-basket",
        text: "Once live, review your profile on a fixed schedule, monthly is reasonable, and after any market event that changes your view of risk. Profile changes require two-factor re-authentication, are audited, and are applied by the EA only when no recovery sequence is open — never mid-ladder — so a change submitted during a drawdown simply waits. If you find yourself wanting a looser profile mid-drawdown, that is precisely the moment not to switch.",
      },
    ],
    notes: [
      "The EA's own inputs are deliberately minimal: LicenseKey, EnableTelemetry and MagicNumber. Strategy parameters are delivered server-side per your chosen risk profile, held in the EA's memory only, and never appear in MT5's inputs dialog.",
      "Tighter settings reduce the size of individual drawdowns but tend to realise small losses more often; looser settings smooth the equity curve while deepening the eventual drawdowns. There is no configuration of Grit Markets that removes the risk of losing the balance on the account it trades.",
      "Where you use backtests to compare configurations, remember they are simulated results. Backtests do not predict live performance.",
      "Nothing in this guide is investment advice. It describes how the software's controls operate so you can make your own decisions.",
    ],
  },
  {
    slug: "license-validation-mql5",
    title: "How Grit Markets license validation works (with MQL5 reference)",
    description:
      "How the Grit Markets EA validates its licence over HTTPS from MetaTrader 5, what each response means, and the MQL5 reference implementation.",
    intro:
      "Grit Markets activates by calling the licence endpoint at https://gritmarkets.com/api/license/validate over HTTPS from inside MetaTrader 5. This page documents exactly what the EA sends, what comes back and how the EA behaves in each case, so you know precisely what the software does on your machine. The reference MQL5 implementation below is the same pattern compiled into the EA; it is published for transparency and for anyone auditing the product before subscribing.",
    steps: [
      {
        name: "The EA sends a validation request on startup",
        text: "When Grit Markets initialises on a chart, it sends a single HTTPS POST to https://gritmarkets.com/api/license/validate containing three values: your licence key, the MT5 account number the terminal is logged into, and the EA version. Nothing else is transmitted — no trade history, no balance, no personal data beyond the account number the licence binds to.",
      },
      {
        name: "MT5 must allow the WebRequest URL",
        text: "MetaTrader 5 blocks all outbound web requests unless the destination is whitelisted. Add https://gritmarkets.com under Tools, Options, Expert Advisors, Allow WebRequest for listed URL. If the URL is missing, WebRequest returns error 4014 and the EA shuts down gracefully without trading.",
      },
      {
        name: "The server answers in under a second",
        text: "The endpoint returns a small JSON document: valid (true or false), reason (a short machine-readable code such as ok, bound, license_suspended or subscription_canceled) and expires (the end of the current billing period). The EA parses this and either arms itself or reports the reason in the Experts log and removes itself from the chart.",
      },
      {
        name: "First use binds your account automatically",
        text: "The first time a licence validates from a new MT5 account, the account number binds to the licence automatically, up to your tier's account limit. After that, validation from a bound account returns valid immediately. To move the EA to a different account, unbind the old account from your dashboard — self-service rebinds are limited to two per rolling thirty days.",
      },
      {
        name: "Revalidation is periodic, not per-trade",
        text: "The EA revalidates on a timer measured in hours, never inside trading logic, so a temporary network problem cannot interfere with an open recovery sequence. If validation fails persistently, the EA stops opening new sequences but manages any open positions to their configured close.",
      },
    ],
    notes: [
      "The endpoint URL never changes. If a future EA version ever asked you to whitelist a different domain, treat it as suspect and contact support.",
      "Validation telemetry (licence key, MT5 account number, IP address) is logged for licence enforcement, as described in the Privacy Policy.",
    ],
    codeBlocks: [
      {
        title: "Reference MQL5 validation call",
        language: "mql5",
        code: `// Grit Markets — licence validation reference (MQL5)
// The endpoint below is fixed for the lifetime of the product and must be
// whitelisted in MT5: Tools > Options > Expert Advisors > Allow WebRequest.
#define GM_LICENSE_ENDPOINT "https://gritmarkets.com/api/license/validate"

input string InpLicenseKey = ""; // Your GM-XXXXX-XXXXX-XXXXX-XXXXX key

bool GM_ValidateLicense(const string ea_version)
  {
   string account = IntegerToString(AccountInfoInteger(ACCOUNT_LOGIN));
   string body = StringFormat(
      "{\\"license_key\\":\\"%s\\",\\"mt5_account\\":\\"%s\\",\\"ea_version\\":\\"%s\\"}",
      InpLicenseKey, account, ea_version);

   char request[];
   StringToCharArray(body, request, 0, StringLen(body), CP_UTF8);

   char response[];
   string response_headers;
   ResetLastError();
   int status = WebRequest("POST", GM_LICENSE_ENDPOINT,
                           "Content-Type: application/json\\r\\n",
                           5000, request, response, response_headers);

   if(status == -1)
     {
      // 4014 => URL not whitelisted in Tools > Options > Expert Advisors
      PrintFormat("Grit Markets: WebRequest failed, error %d. "
                  "Whitelist %s in MT5 options.",
                  GetLastError(), GM_LICENSE_ENDPOINT);
      return(false);
     }

   string json = CharArrayToString(response, 0, WHOLE_ARRAY, CP_UTF8);
   bool   valid = (StringFind(json, "\\"valid\\":true") >= 0);

   if(!valid)
      PrintFormat("Grit Markets: licence rejected — %s", json);

   return(valid);
  }

int OnInit()
  {
   if(!GM_ValidateLicense("1.0.0"))
     {
      // graceful shutdown: no trading without a valid licence
      ExpertRemove();
      return(INIT_FAILED);
     }
   return(INIT_SUCCEEDED);
  }`,
      },
    ],
  },
  {
    slug: "telemetry-and-settings-sync-mql5",
    title: "How Grit Markets telemetry and settings sync work (with MQL5 reference)",
    description:
      "What the EA sends to the dashboard, how the HMAC-signed telemetry channel works, the settings-sync protocol, and the MQL5 reference implementation.",
    intro:
      "Alongside licence validation, the EA can push telemetry to your dashboard: an account snapshot every five minutes plus closed trades as they happen. This page documents exactly what is transmitted, how the channel is authenticated, and how remote settings changes are applied safely. Telemetry never includes broker credentials of any kind, and it is optional: the EnableTelemetry input defaults to true, and turning it off disables the dashboard while licensing keeps working.",
    steps: [
      {
        name: "Understand what is transmitted",
        text: "Each push contains a snapshot (balance, equity, margin, free margin, margin level, floating profit and open-position count), any trades closed since the last acknowledged ticket, and the version number of the settings the EA is currently running. Nothing else leaves your terminal: no passwords, no investor logins, no personal data beyond the MT5 account number the licence is bound to.",
      },
      {
        name: "Issue your telemetry secret in the dashboard",
        text: "In Licenses and Downloads, issue the telemetry secret and paste it into the EA's TelemetrySecret input. The secret is shown once; every telemetry request is signed with it (HMAC-SHA256 over the payload) so nobody can push fake data into your dashboard. Regenerating the secret invalidates the old one immediately.",
      },
      {
        name: "How settings sync applies changes safely",
        text: "When you submit a settings version from the dashboard, it is queued as pending. The EA sees it in the response to a telemetry push, but applies it only when no recovery sequence is open — flat or base level only — never mid-ladder. On its next push the EA reports the new version and the dashboard marks it applied. If the account never reaches a flat state, the change simply waits; the dashboard shows this honestly.",
      },
      {
        name: "Cadence and failure behaviour",
        text: "The EA pushes every five minutes while running and immediately when a trade closes. If the platform is unreachable, the EA keeps trading on its current settings and retries later; telemetry is a reporting channel, and no trading decision ever depends on it. The ea-offline alert in the dashboard fires when an active account has been silent for more than two hours.",
      },
    ],
    notes: [
      "The endpoint is https://gritmarkets.com/api/telemetry - covered by the same https://gritmarkets.com WebRequest whitelist entry used for licence validation.",
      "Telemetry contents, retention (24 months rolling) and lawful basis are documented in the Privacy Policy.",
    ],
    codeBlocks: [
      {
        title: "Reference MQL5 telemetry push",
        language: "mql5",
        code: `// Grit Markets - telemetry reference (MQL5). Same WebRequest whitelist
// entry as licence validation: https://gritmarkets.com
#define GM_TELEMETRY_ENDPOINT "https://gritmarkets.com/api/telemetry"

input bool   EnableTelemetry  = true;
input string TelemetrySecret  = ""; // issued once in the dashboard

// Requires an HMAC-SHA256 implementation (see MQL5 standard examples).
string GM_HmacSha256Hex(const string body, const string secret_key);

bool GM_PushTelemetry(const string license_key, const int settings_version)
  {
   if(!EnableTelemetry || TelemetrySecret == "")
      return(false);

   string body = StringFormat(
      "{\"license_key\":\"%s\",\"mt5_account\":\"%I64d\",\"is_demo\":%s,"
      "\"account_currency\":\"%s\",\"settings_version\":%d,"
      "\"snapshot\":{\"balance\":%.2f,\"equity\":%.2f,\"margin\":%.2f,"
      "\"free_margin\":%.2f,\"margin_level_pct\":%.2f,"
      "\"open_positions_count\":%d,\"floating_pl\":%.2f},"
      "\"trades\":[]}",
      license_key,
      AccountInfoInteger(ACCOUNT_LOGIN),
      AccountInfoInteger(ACCOUNT_TRADE_MODE) == ACCOUNT_TRADE_MODE_DEMO ? "true" : "false",
      AccountInfoString(ACCOUNT_CURRENCY),
      settings_version,
      AccountInfoDouble(ACCOUNT_BALANCE),
      AccountInfoDouble(ACCOUNT_EQUITY),
      AccountInfoDouble(ACCOUNT_MARGIN),
      AccountInfoDouble(ACCOUNT_MARGIN_FREE),
      AccountInfoDouble(ACCOUNT_MARGIN_LEVEL),
      PositionsTotal(),
      AccountInfoDouble(ACCOUNT_PROFIT));

   string sig = GM_HmacSha256Hex(body, TelemetrySecret);
   string headers = "Content-Type: application/json\r\nX-GM-Signature: " + sig + "\r\n";

   char request[]; char response[]; string response_headers;
   StringToCharArray(body, request, 0, StringLen(body), CP_UTF8);
   int status = WebRequest("POST", GM_TELEMETRY_ENDPOINT, headers,
                           5000, request, response, response_headers);
   if(status != 200)
      return(false); // keep trading; retry on the next timer tick

   string json = CharArrayToString(response, 0, WHOLE_ARRAY, CP_UTF8);
   // If json contains \"pending_settings\":{...}: store it and apply ONLY
   // when flat (no open sequence), then echo the new settings_version on
   // the next push so the dashboard marks it applied.
   return(true);
  }`,
      },
    ],
  },
];
