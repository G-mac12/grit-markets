export interface GuideStep {
  name: string;
  text: string;
}

export interface Guide {
  slug: string;
  title: string;
  description: string;        // <=155 chars
  intro: string;              // one paragraph
  steps: GuideStep[];         // 5-9 steps
  notes?: string[];           // optional caveats
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
      "Grit Markets automates a Martingale-based strategy, which means its risk controls are not optional extras; they are the difference between a bounded worst case and an unbounded one. This guide walks through each control in the order you should set them, before the EA places its first live trade. The guiding principle throughout is honest: tighter caps reduce the size of drawdowns and increase how often small losses are realised, looser caps do the reverse, and no combination of settings removes the risk of losing the account balance. Decide your worst case first, then set the controls to enforce it.",
    steps: [
      {
        name: "Decide your maximum acceptable loss before touching any setting",
        text: "Write down, as an amount of money, the most you are prepared to lose on the account running Grit Markets. Not per trade and not per month: in total, in the worst case. Every subsequent setting exists to enforce this number, and if you skip this step the settings have nothing to enforce. If the honest answer is that you cannot afford to lose the balance on this account, fund a smaller account before proceeding.",
      },
      {
        name: "Set the equity stop",
        text: "The equity stop closes every open position and halts trading when floating losses reach a percentage of account equity that you define. It is the account's final safety net, so set it first and never disable it. Choose the percentage from the maximum loss you wrote down in the previous step. Be aware of its limits: in a fast or gapping market the actual closing prices can be worse than the trigger level, so the realised loss can exceed the configured one.",
      },
      {
        name: "Cap the maximum recovery levels",
        text: "The level cap limits how many times the EA may add to a losing basket. Because position size grows geometrically with each level, this single input largely determines the size of the worst-case basket. Fewer levels mean smaller and more frequent realised losses; more levels mean smoother periods punctuated by deeper drawdowns. Start at the conservative end of the documented range and resist raising it after a losing basket, which is precisely when raising it is most tempting and most dangerous.",
      },
      {
        name: "Size the base lot from the worst case backwards",
        text: "The base lot is the volume of the first trade in each cycle, and everything in the worst-case basket scales linearly with it. Do not choose it by what looks profitable; derive it by working backwards from your equity stop, multiplier and level cap so that a fully extended basket at maximum drawdown stays inside the loss you decided in step one. The simulator on gritmarkets.com does this arithmetic for you: enter your account size, multiplier and level cap, and adjust the base lot until the worst-case figure is one you have already accepted.",
      },
      {
        name: "Configure the news and session filters",
        text: "The news filter keeps the EA from opening new cycles around high-impact scheduled releases such as central bank decisions and major economic data, and the session filter restricts trading to the hours you specify. Both reduce the chance of a basket being opened directly into a violent move. Enable the news filter with a sensible buffer either side of events, and consider excluding illiquid periods such as the daily rollover. Remember their limit: filters cover scheduled events, and the most damaging moves are often unscheduled.",
      },
      {
        name: "Verify the configuration on a demo account",
        text: "Attach the EA with your chosen settings to a demo account of the same size and broker conditions as your intended live account, and let it run until you have watched at least one full recovery basket form and resolve. Confirm the equity stop triggers where you expect by checking the log, and confirm the level cap holds. A configuration you have watched fail safely on demo is worth more than any backtest.",
      },
      {
        name: "Go live, then review on a schedule and never mid-basket",
        text: "Once live, review your settings on a fixed schedule, monthly is reasonable, and after any market event that changes your view of risk. Make changes only when the EA is flat. Loosening caps while a losing basket is open converts a controlled strategy into an uncontrolled one in a single click, and it is the most common way disciplined subscribers become undisciplined ones. If you find yourself wanting to intervene mid-drawdown, the setting to change afterwards is usually the base lot, downwards.",
      },
    ],
    notes: [
      "[OWNER INPUT: confirm final EA feature list. The controls described here, equity stop, maximum recovery levels, base lot sizing, multiplier, news filter and session filter, must match the shipped input parameters exactly, including their input names.]",
      "Tighter settings reduce the size of individual drawdowns but tend to realise small losses more often; looser settings smooth the equity curve while deepening the eventual drawdowns. There is no configuration of Grit Markets that removes the risk of losing the balance on the account it trades.",
      "Where you use backtests to compare configurations, remember they are simulated results. Backtests do not predict live performance.",
      "Nothing in this guide is investment advice. It describes how the software's controls operate so you can make your own decisions.",
    ],
  },
];
