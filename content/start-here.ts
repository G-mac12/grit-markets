export interface GuideScreenshot {
  file: string;          // e.g. "mt5-enable-webrequest-whitelist.webp"
  alt: string;           // meaningful alt text
  annotations: string[]; // 1-3 short callout labels (numbered markers on the frame)
}

export interface GuideHowStep {
  name: string;          // imperative, one action
  text: string;          // 2-4 sentences, beginner language
  screenshot: GuideScreenshot;
}

export interface GuideProblem {
  question: string;      // phrased as the user would search it
  answer: string;        // 40-80 words, direct
}

export interface StartGuide {
  slug: string;
  step: number;              // 1-5
  navLabel: string;          // short card label, e.g. "Choose a broker"
  title: string;             // H1 long-tail query form
  metaDescription: string;   // <=155 chars
  timeMinutes: number;       // realistic estimate for the step
  answerFirst: string;       // 40-60 words
  intro: string;             // one paragraph setting context
  steps: GuideHowStep[];     // 5-8 steps
  problems: GuideProblem[];  // 3-5 "common problems" entries
}

export const START_GUIDES: StartGuide[] = [
  {
    slug: "choose-a-forex-broker-for-ea",
    step: 1,
    navLabel: "Choose a broker",
    title: "How to choose a forex broker for an Expert Advisor",
    metaDescription:
      "What matters when choosing a forex broker for an Expert Advisor: MT5 support, hedging accounts, spreads and regulation. Open a demo account first.",
    timeMinutes: 20,
    answerFirst:
      "Choose a broker that is regulated by a recognised authority, supports MetaTrader 5 with a hedging account type, and offers low spreads and fast execution. Open a free demo account first so you can practise with virtual money. IC Markets is our worked example, but the comparison framework here works for any broker.",
    intro:
      "Before any automated trading software can run, it needs two things: a broker and a trading account. A broker is a regulated company that connects your orders to the currency market; a trading account is your named record with that broker, holding your balance and your trades. An Expert Advisor, usually shortened to EA, is a piece of software that places and manages trades inside the MetaTrader 5 platform automatically. Not every broker is equally suitable for running one, so this guide gives you a simple framework for judging any broker, then walks through opening a demo account with IC Markets as the worked example. We feature IC Markets because it fits the EA checklist below well — raw-spread MT5 accounts of the hedging type, fast execution from Equinix data centres, and regulation under ASIC, CySEC and the FSA — not because we are paid to: Grit Agility Ltd has no affiliate or introducing-broker relationship with IC Markets, and every principle in this guide applies to any comparable regulated broker. A demo account uses virtual money on real market prices, so everything in this path can be completed without risking a penny. A live account, funded with real money, is a final and entirely optional step for later.",
    steps: [
      {
        name: "Understand what a broker and a trading account are",
        text: "A broker sits between you and the foreign exchange market: you send an order, the broker executes it and updates your account. Your trading account records your balance, your open trades and your history. When you run an EA, the software sends those orders for you, but the broker relationship works exactly the same way. Nothing about automation changes who holds your money, which is why broker choice matters.",
        screenshot: {
          file: "broker-account-market-diagram.webp",
          alt: "Simple diagram showing a trader's computer connecting through a broker to the foreign exchange market",
          annotations: [
            "1. Your computer running MT5 and the EA",
            "2. The broker executing your orders",
            "3. The currency market itself",
          ],
        },
      },
      {
        name: "Learn what an EA actually needs from a broker",
        text: "Four things matter most. First, low spreads: the spread is the small difference between the buying price and the selling price of a currency pair, and it is a cost you pay on every trade, so an EA that trades often needs it small. Second, fast and reliable execution, meaning orders are filled quickly at the price requested. Third, full MetaTrader 5 support, because Grit Markets runs on MT5, not the older MT4. Fourth, a hedging account type, which simply means the account is allowed to hold buy and sell positions on the same currency pair at the same time; some EAs, including ours, need this.",
        screenshot: {
          file: "ea-broker-requirements-checklist.webp",
          alt: "Checklist graphic of the four broker requirements for running an Expert Advisor",
          annotations: [
            "1. Raw or low spreads",
            "2. MetaTrader 5 with hedging accounts",
            "3. Fast, reliable execution",
          ],
        },
      },
      {
        name: "Check the broker's regulation",
        text: "Regulation means an official financial authority supervises the broker and sets rules about how it must handle client money. Look for oversight by well-known regulators such as the FCA in the United Kingdom, ASIC in Australia or CySEC in Cyprus. A broker's regulators are normally listed in its website footer, and you can verify a licence number on the regulator's own public register. Avoid any broker that does not clearly state who regulates it.",
        screenshot: {
          file: "broker-regulation-footer-check.webp",
          alt: "Example broker website footer with regulatory licence details highlighted",
          annotations: [
            "1. Regulator names and licence numbers in the footer",
            "2. Link to the regulator's public register",
          ],
        },
      },
      {
        name: "Compare candidates with a simple notes table",
        text: "Open a blank document and make a table with one row per broker and one column each for regulation, MT5 support, hedging accounts, typical spread on EUR/USD, and any commission per trade. Fill it in from each broker's own website rather than from review sites, which are often paid for placement. Ten minutes of this turns a confusing choice into a short, factual comparison. Keep the notes; they are also useful later if you ever want to switch.",
        screenshot: {
          file: "broker-comparison-notes-table.webp",
          alt: "Self-made comparison table of three brokers scored on regulation, platform, account type and costs",
          annotations: [
            "1. One row per broker",
            "2. Columns for the four requirements plus costs",
          ],
        },
      },
      {
        name: "Start an IC Markets demo account application",
        text: "As the worked example, go to the IC Markets website and choose the option to open a demo account, not a live one. A demo account trades virtual money on real prices, so you can complete this entire five-step path without depositing anything. The form asks for your name, email address and country, then sends a confirmation link to your inbox. IC Markets and other broker names are used here simply to identify their services.",
        screenshot: {
          file: "ic-markets-demo-signup-form.webp",
          alt: "Broker demo account sign-up form with the demo option selected instead of live",
          annotations: [
            "1. Demo account option selected",
            "2. Live account option left for later",
          ],
        },
      },
      {
        name: "Choose MetaTrader 5, hedging and your base currency",
        text: "During the application you will be asked which platform you want: choose MetaTrader 5, not MetaTrader 4, because the EA only runs on MT5. If an account type question appears, pick the hedging option rather than netting. Set the base currency to the currency you think in day to day, such as GBP or EUR, because your balance and profit or loss will be shown in it.",
        screenshot: {
          file: "ic-markets-mt5-platform-selection.webp",
          alt: "Account setup screen showing platform choice with MetaTrader 5 selected and hedging account type highlighted",
          annotations: [
            "1. MetaTrader 5 selected, not MT4",
            "2. Hedging account type",
            "3. Base currency dropdown",
          ],
        },
      },
      {
        name: "Set a realistic demo balance and save your credentials",
        text: "Choose a demo balance close to what you might genuinely trade one day, not the default million; a realistic number makes everything you observe later meaningful. Submit the form and check your email for the confirmation message containing your account number, password and server name. Save all three somewhere safe, because you will need them to log in to MetaTrader 5 in step three of this path.",
        screenshot: {
          file: "ic-markets-demo-confirmation-email.webp",
          alt: "Demo account confirmation email showing the account number, password and MT5 server name",
          annotations: [
            "1. Account (login) number",
            "2. Server name for MT5 login",
            "3. Password to store safely",
          ],
        },
      },
    ],
    problems: [
      {
        question: "What is the difference between a demo account and a live account?",
        answer: "A demo account trades virtual money on real market prices, so nothing you do can cost you anything. A live account uses real money you have deposited, and losses are real. The two behave almost identically inside MetaTrader 5, which is why this whole path is built on demo first: you learn every screen, setting and risk with zero money at stake, and only consider going live once you fully understand the worst case.",
      },
      {
        question: "Do I need MT5 or is MT4 okay for this EA?",
        answer: "You need MetaTrader 5. MT4 is an older platform and EAs are not compatible between the two: a file built for MT5 will not load in MT4 at all. When a broker's sign-up form asks which platform you want, choose MetaTrader 5. If you already have an MT4 account, most brokers will let you open an additional MT5 account under the same profile in a few minutes.",
      },
      {
        question: "What does a hedging account mean and why does the EA need it?",
        answer: "A hedging account can hold a buy position and a sell position on the same currency pair at the same time. The alternative, a netting account, merges them into one net position. Some EAs, including Grit Markets, manage sequences of positions that may point in both directions, so a netting account would silently break the logic. Choosing hedging at sign-up takes one click and avoids the problem entirely.",
      },
      {
        question: "My demo confirmation email has not arrived. What do I do?",
        answer: "First check your spam or junk folder, because broker emails are often filtered. If it is not there after ten minutes, log in to the broker's client portal with the email and password you registered; most brokers show demo credentials there even if the email failed. As a last resort, open a fresh demo application with the same details, or contact the broker's live chat, which typically resolves this in minutes.",
      },
      {
        question: "Should I open the live account at the same time to save effort?",
        answer: "There is no need, and we recommend against it. Everything in this five-step path works on the demo account, and a live account can be opened in about ten minutes whenever you choose. Deferring it removes any temptation to trade real money before you have watched the EA behave over several weeks and understood how its risk controls work. Going live is the final, optional step, not a prerequisite.",
      },
    ],
  },
  {
    slug: "best-vps-for-mt5",
    step: 2,
    navLabel: "Decide on a VPS",
    title: "Do you need a VPS to run an EA on MT5?",
    metaDescription:
      "Whether you need a VPS to run an MT5 Expert Advisor, the minimum specs, how latency works, and the honest case for your own always-on PC.",
    timeMinutes: 15,
    answerFirst:
      "No, not to start. You can complete this entire path, and weeks of demo observation, on your own computer. A VPS, a small rented computer that stays on around the clock, becomes worth adding before you go live, because an EA can only trade while MetaTrader 5 is actually running and connected.",
    intro:
      "An Expert Advisor is ordinary software: it only works while the computer running MetaTrader 5 is switched on and online. The currency market trades continuously from Sunday evening to Friday night, so serious EA users usually run the platform on a VPS, short for virtual private server, which is a small computer you rent inside a professional data centre and control remotely. This guide explains what a VPS gives you, what specification you actually need, and, honestly, when your own PC is good enough. Because you are starting on a demo account, the answer for now is simple: your home computer is fine, and a VPS is a decision to make later, before real money is involved.",
    steps: [
      {
        name: "Decide whether you need a VPS yet",
        text: "While you are on a demo account, a missed trade costs nothing, so run everything on your normal computer and skip the expense. The time to add a VPS is before you switch to a live account, when a disconnection during an open trade sequence could genuinely matter. Read the rest of this guide now so the decision is easy later, then carry on to step three of the path.",
        screenshot: {
          file: "vps-decision-flowchart.webp",
          alt: "Flowchart showing that demo users can use a home PC and live users should consider a VPS",
          annotations: [
            "1. On demo: home PC is fine",
            "2. Before going live: add a VPS",
          ],
        },
      },
      {
        name: "Understand why uptime matters for an EA",
        text: "If MetaTrader 5 closes, loses internet, or the computer sleeps, the EA stops managing its positions until the connection returns. Any trades already open remain open at the broker, unmanaged, which is the risk a VPS removes. A data centre has redundant power and internet, so the platform simply stays running for the whole trading week. This is what people mean when they say an EA benefits from 24/5 uptime.",
        screenshot: {
          file: "mt5-connection-status-bar.webp",
          alt: "MetaTrader 5 status bar showing the connection indicator and data transfer figures in the bottom corner",
          annotations: [
            "1. Connection indicator, green when connected",
            "2. No connection message when the link drops",
          ],
        },
      },
      {
        name: "Choose a VPS region close to your broker's server",
        text: "Latency is the time an order takes to travel from your platform to the broker's server, and distance is the main cause: the further apart, the slower. Find out which city hosts your broker's trade servers, commonly London or New York, and rent your VPS in the same region. Cutting latency from hundreds of milliseconds to a handful means orders fill closer to the price the EA asked for. It will not make a strategy profitable, but it removes an avoidable cost.",
        screenshot: {
          file: "vps-latency-region-map.webp",
          alt: "World map showing latency in milliseconds from several VPS regions to a broker data centre in London",
          annotations: [
            "1. Broker data centre location",
            "2. VPS in the same region, single-digit latency",
            "3. Distant VPS with much higher latency",
          ],
        },
      },
      {
        name: "Pick the minimum specification for one MT5 instance",
        text: "One copy of MetaTrader 5 running one EA is a light workload. Look for at least 2 GB of RAM, one or two vCPUs, which are shares of a processor, around 40 GB of storage, and a Windows Server operating system, because MT5 is a Windows program. Paying for more than this only makes sense if you plan to run several platforms at once. Cheaper Linux-only plans will not run MT5 without awkward workarounds, so avoid them as a beginner.",
        screenshot: {
          file: "vps-spec-minimums-table.webp",
          alt: "Table of minimum VPS specifications for a single MetaTrader 5 instance",
          annotations: [
            "1. 2 GB RAM minimum",
            "2. 1 to 2 vCPUs",
            "3. Windows Server operating system",
          ],
        },
      },
      {
        name: "Compare the three types of VPS provider",
        text: "There are broadly three options. Forex-specialist VPS hosts come pre-configured for MT5 and sit in the right data centres, but cost more per month. General cloud providers are cheaper and very reliable, but you set up Windows and MT5 yourself. Broker-provided VPS services are the most convenient and are sometimes free above a trading volume threshold, though you accept whatever specification the broker offers. Concretely: the simplest route for a beginner is the built-in MetaTrader 5 VPS from MetaQuotes, rented in a couple of clicks from inside the terminal itself and automatically placed near your broker's server; forex specialists such as ForexVPS.net and FXVM come pre-configured for MT5 in London and New York; and general providers such as Contabo or Vultr offer cheap Windows servers if you are comfortable doing the setup yourself. We have no affiliate relationship with any provider named here.",
        screenshot: {
          file: "vps-provider-types-comparison.webp",
          alt: "Comparison chart of forex-specialist VPS, general cloud providers and broker-provided VPS options",
          annotations: [
            "1. Specialist host: pre-configured, dearer",
            "2. General cloud: cheap, more setup",
            "3. Broker VPS: convenient, fixed spec",
          ],
        },
      },
      {
        name: "Weigh the honest alternative of your own always-on PC",
        text: "Running the EA on a computer you already own costs nothing, and for demo trading it is the sensible default. Be realistic about the risks for live trading, though: power cuts, broadband outages, and Windows updates that restart the machine overnight without asking. If you go this route, disable sleep and hibernation, set Windows Update active hours so restarts are less likely during the trading week, and accept that you are your own data centre.",
        screenshot: {
          file: "windows-update-restart-settings.webp",
          alt: "Windows settings screen showing active hours configuration and sleep disabled in power options",
          annotations: [
            "1. Active hours set to limit automatic restarts",
            "2. Sleep set to never in power settings",
          ],
        },
      },
      {
        name: "Connect to a VPS with Remote Desktop",
        text: "When you do rent a VPS, the provider emails you an address, a username and a password. On your own computer, open the Remote Desktop Connection app that is built into Windows, or a free equivalent on Mac, enter those details, and a window opens showing the VPS's own Windows desktop. Everything you do inside that window, such as installing MT5 in the next guide, keeps running after you close it. Change the password on first login.",
        screenshot: {
          file: "windows-remote-desktop-connection.webp",
          alt: "Remote Desktop Connection dialog with the VPS address entered and the remote Windows desktop opening",
          annotations: [
            "1. VPS address in the Computer field",
            "2. Remote Windows desktop in its own window",
          ],
        },
      },
    ],
    problems: [
      {
        question: "Can I run an MT5 EA on my laptop overnight instead of a VPS?",
        answer: "Yes, provided the laptop stays powered, awake and online. Plug it in, disable sleep and hibernation in the power settings, and set Windows Update active hours to reduce surprise restarts. On a demo account this is completely fine and costs nothing. For a live account, treat it as a stopgap: one power cut or forced update during an open trade sequence and the EA is offline while positions sit unmanaged at the broker.",
      },
      {
        question: "Does closing the Remote Desktop window stop the EA?",
        answer: "No. Remote Desktop is only a viewing window onto the VPS; the server itself keeps running when you disconnect, and so do MetaTrader 5 and the EA. The one thing that does stop everything is shutting down or restarting the VPS from inside the session, so use disconnect, not shut down. After a provider-side reboot, log back in and check MT5 reopened; setting it to start automatically with Windows is a sensible precaution.",
      },
      {
        question: "What latency is good enough for an EA on MT5?",
        answer: "For a strategy like this one, anything under roughly 50 milliseconds to the broker's server is comfortable, and a VPS in the same city as the broker's data centre often achieves under 5. This is not a high-frequency system, so chasing single-digit numbers buys very little. What actually hurts is instability: a home connection that drops for minutes at a time is far worse than a steady connection that is 100 milliseconds away.",
      },
      {
        question: "Do I need a separate VPS for a demo account?",
        answer: "No. The entire demo phase of this path can run on your everyday computer, and if the machine happens to be off overnight, the only cost is a gap in your observations. Some people rent the VPS during the final weeks of demo anyway, to rehearse the exact setup they will use live, and that is a reasonable choice, but it is a convenience rather than a requirement.",
      },
    ],
  },
  {
    slug: "set-up-metatrader-5",
    step: 3,
    navLabel: "Set up MT5",
    title: "How to set up MetaTrader 5 for automated trading",
    metaDescription:
      "Install MetaTrader 5 from your broker, log in to your demo account, enable Algo Trading and whitelist the WebRequest URL for automated trading.",
    timeMinutes: 15,
    answerFirst:
      "Download MetaTrader 5 from your broker's website, install it and log in with your demo account credentials. Then enable the Algo Trading button on the toolbar and add https://gritmarkets.com under Tools, Options, Expert Advisors, Allow WebRequest. Those two settings are what let an Expert Advisor trade and verify its licence.",
    intro:
      "MetaTrader 5 is the trading platform, often called the terminal, where charts are drawn, orders are sent and Expert Advisors run. It is made by a company called MetaQuotes, but you should download it from your own broker rather than from an app store, because the mobile and store builds are limited versions that cannot run EAs at all. This guide takes you from download to a fully prepared terminal on your demo account from step one, including the two settings that beginners most often miss: the Algo Trading switch and the WebRequest whitelist. Do all of this on the computer, or the VPS, where the EA will actually live.",
    steps: [
      {
        name: "Download MT5 from your broker's website",
        text: "Log in to your broker's client portal, find the downloads or platforms section, and download the MetaTrader 5 desktop installer for Windows. The broker's build comes pre-loaded with its server names, which makes logging in easier. Avoid the Microsoft Store, Apple, and Google Play versions: they are cut-down builds that cannot load Expert Advisors, and this is a nominative mention of those stores only, not a recommendation.",
        screenshot: {
          file: "broker-mt5-download-page.webp",
          alt: "Broker client portal downloads page with the MetaTrader 5 desktop installer for Windows highlighted",
          annotations: [
            "1. MetaTrader 5 desktop download button",
            "2. Mobile and web versions to ignore for EA use",
          ],
        },
      },
      {
        name: "Run the installer and open the terminal",
        text: "Open the downloaded file, accept the licence agreement and let the installer run; the default settings are fine. When it finishes, MetaTrader 5 opens by itself, usually showing a demo chart and a sign-up prompt from MetaQuotes, which you can close. If you are setting up on a VPS, do this inside the Remote Desktop window so the platform lives on the machine that stays switched on.",
        screenshot: {
          file: "mt5-windows-installer-wizard.webp",
          alt: "MetaTrader 5 setup wizard on Windows with the install button and licence agreement checkbox visible",
          annotations: [
            "1. Licence agreement acceptance",
            "2. Install button with default settings",
          ],
        },
      },
      {
        name: "Log in with your demo credentials",
        text: "Go to File, then Login to Trade Account, and enter the account number and password from the confirmation email you saved in step one. Pick the exact server name from that email in the dropdown; brokers run many servers and demo accounts only exist on their own one. When the connection bars in the bottom-right corner turn green and show numbers, you are connected to your demo account.",
        screenshot: {
          file: "mt5-login-demo-account-dialog.webp",
          alt: "MetaTrader 5 login dialog with account number, password and broker demo server selected",
          annotations: [
            "1. Account number from the broker email",
            "2. Exact demo server name in the dropdown",
            "3. Green connection indicator after login",
          ],
        },
      },
      {
        name: "Take a two-minute tour of the terminal",
        text: "Four panels matter. Market Watch, on the left, lists currency pairs and their live prices. The chart window in the centre shows price history for one pair. The Navigator panel lists your accounts and, importantly, your installed Expert Advisors. The Toolbox along the bottom shows your open trades, account history, and two tabs you will use constantly: Experts, where EAs write their messages, and Journal, where the terminal logs everything it does.",
        screenshot: {
          file: "mt5-terminal-layout-overview.webp",
          alt: "Full MetaTrader 5 terminal with Market Watch, chart window, Navigator and Toolbox panels labelled",
          annotations: [
            "1. Market Watch with live prices",
            "2. Navigator listing Expert Advisors",
            "3. Toolbox with Experts and Journal tabs",
          ],
        },
      },
      {
        name: "Enable the Algo Trading button",
        text: "On the main toolbar is a button labelled Algo Trading. This is the master switch for all automated trading in the terminal: when its icon is red, no EA anywhere in the platform is allowed to trade, no matter how it is configured. Click it once so the icon turns green. Remember where it is, because clicking it again is also the fastest way to pause every EA at once.",
        screenshot: {
          file: "mt5-algo-trading-button-enabled.webp",
          alt: "MetaTrader 5 toolbar with the Algo Trading button switched on and showing green",
          annotations: [
            "1. Algo Trading button in the green, enabled state",
            "2. Toolbar position for quick access",
          ],
        },
      },
      {
        name: "Add https://gritmarkets.com to the WebRequest whitelist",
        text: "Go to Tools, then Options, then the Expert Advisors tab. Tick Allow WebRequest for listed URL, click the add line and type https://gritmarkets.com exactly, character for character, with the https and no trailing slash or extra spaces. MT5 blocks EAs from contacting the internet unless the address is on this list, and the Grit Markets EA contacts that address to validate your licence. If the URL is missing or mistyped, the EA will load but refuse to run.",
        screenshot: {
          file: "mt5-enable-webrequest-whitelist.webp",
          alt: "MetaTrader 5 options dialog on the Expert Advisors tab with the WebRequest whitelist containing https://gritmarkets.com",
          annotations: [
            "1. Allow WebRequest for listed URL ticked",
            "2. https://gritmarkets.com entered exactly",
            "3. OK button to save the settings",
          ],
        },
      },
      {
        name: "Confirm the setup in the Journal tab",
        text: "Open the Toolbox at the bottom of the terminal and click the Journal tab. You should see lines confirming a successful login to your demo server and no red error messages. This tab and its neighbour, Experts, are where you will look first whenever anything seems wrong, so it is worth knowing they exist before you install anything. Your terminal is now ready for step four.",
        screenshot: {
          file: "mt5-journal-connection-log.webp",
          alt: "MetaTrader 5 Toolbox Journal tab showing successful login entries to the demo server",
          annotations: [
            "1. Journal tab selected in the Toolbox",
            "2. Successful authorisation line for the demo account",
          ],
        },
      },
    ],
    problems: [
      {
        question: "Why does MT5 say invalid account or no connection when I log in?",
        answer: "Nine times out of ten the server name is wrong. Brokers run separate servers for demo and live accounts, and your demo login only works on the exact server named in your confirmation email. Reopen File, Login to Trade Account, retype the account number and password by hand rather than pasting, and select that precise server from the dropdown. If it still fails, the demo may have expired; brokers close inactive demos after a few weeks and a new one takes minutes to open.",
      },
      {
        question: "I downloaded MT5 from the Microsoft Store and cannot find Expert Advisor options. Why?",
        answer: "The app store builds of MetaTrader 5 are limited versions that cannot run Expert Advisors, so the settings genuinely are not there. Uninstall that copy, log in to your broker's client portal and download the full desktop installer from its platforms page instead. After installing the broker's build, the Expert Advisors tab appears under Tools, Options, and the Algo Trading button appears on the toolbar as this guide describes.",
      },
      {
        question: "The Algo Trading button keeps turning red or will not stay enabled. What is wrong?",
        answer: "First check nothing is disabling it for you: some brokers' investor passwords, read-only logins meant for viewing, cannot trade, so make sure you logged in with the main password. Next open Tools, Options, Expert Advisors and confirm Allow algorithmic trading is ticked there too, because that setting overrides the toolbar button. Finally, restarting the terminal after changing options clears most oddities. The button should stay green until you click it yourself.",
      },
      {
        question: "Do I have to add the WebRequest URL exactly, or is the domain enough?",
        answer: "Add it exactly as written: https://gritmarkets.com. MetaTrader 5 matches whitelist entries very literally, so a version without https, with a www prefix the EA does not use, with a trailing slash or with a stray space counts as a different address and the request is blocked. If the EA later reports that it cannot validate its licence, this list is the first place to check. Retype the entry rather than trusting a paste.",
      },
    ],
  },
  {
    slug: "install-ea-on-mt5",
    step: 4,
    navLabel: "Install the EA",
    title: "How to install an Expert Advisor on MT5 (step-by-step)",
    metaDescription:
      "Install any Expert Advisor on MetaTrader 5: copy the .ex5 into MQL5/Experts, refresh Navigator, drag it onto a chart and set the inputs safely.",
    timeMinutes: 10,
    answerFirst:
      "Copy the EA's .ex5 file into the MQL5/Experts folder inside your MetaTrader 5 data folder, refresh the Navigator panel, then drag the EA onto a chart. Fill in the inputs dialog, tick Allow Algo Trading in the Common tab, and confirm the EA's name shows as active in the chart's top-right corner.",
    intro:
      "Installing an Expert Advisor is the same for every EA on the market: the platform looks for compiled program files, which end in .ex5, inside one specific folder, and anything it finds there appears in the Navigator panel ready to attach to a chart. This guide shows the generic process and uses Grit Markets as the worked example, so you can follow along with any .ex5 file you own. You should still be on your demo account from step one; nothing in this guide, or the next, requires real money, and the whole point of demo-first is that your first installation mistakes cost nothing.",
    steps: [
      {
        name: "Download the .ex5 file from your account dashboard",
        text: "Log in to your Grit Markets account dashboard and download the EA file from the downloads section; it will be named something like GritMarkets.ex5. An .ex5 file is a compiled program for MetaTrader 5, which means it is ready to run and never needs unzipping or installing on its own. Save it somewhere easy to find, such as your Downloads folder. If you are using a VPS, do this inside the Remote Desktop session.",
        screenshot: {
          file: "grit-dashboard-ex5-download.webp",
          alt: "Grit Markets subscriber dashboard downloads section with the .ex5 file download button highlighted",
          annotations: [
            "1. Downloads section of the dashboard",
            "2. GritMarkets.ex5 download button",
          ],
        },
      },
      {
        name: "Open the MT5 data folder",
        text: "In MetaTrader 5, click File, then Open Data Folder. A Windows Explorer window appears showing the terminal's private storage area, which is deliberately kept separate from the program itself. This is where all your EAs, indicators and settings live. Keep this window open alongside the folder containing your downloaded file.",
        screenshot: {
          file: "mt5-open-data-folder-menu.webp",
          alt: "MetaTrader 5 File menu open with the Open Data Folder item highlighted",
          annotations: [
            "1. File menu expanded",
            "2. Open Data Folder menu item",
          ],
        },
      },
      {
        name: "Copy the file into MQL5/Experts",
        text: "Inside the data folder, open the MQL5 folder, then the Experts folder inside it. Copy or drag your downloaded .ex5 file into Experts, alongside the example EAs that MetaQuotes ships with the platform. The exact folder matters: a file left in MQL5 itself, or in Indicators, will never appear in the terminal. You can close the Explorer windows once the file is in place.",
        screenshot: {
          file: "mql5-experts-folder-ex5-file.webp",
          alt: "Windows Explorer showing the MQL5 Experts folder with the GritMarkets.ex5 file copied in",
          annotations: [
            "1. Folder path ending in MQL5\\Experts",
            "2. The copied .ex5 file",
          ],
        },
      },
      {
        name: "Refresh the Navigator panel",
        text: "Back in MetaTrader 5, find the Navigator panel on the left; if it is hidden, press Ctrl+N. Right-click the Expert Advisors section and choose Refresh, and the terminal rescans the Experts folder. Your EA should now appear in the list by name. If it does not, the file is almost certainly in the wrong folder, so repeat the previous step and check the path carefully.",
        screenshot: {
          file: "mt5-navigator-refresh-expert-list.webp",
          alt: "MetaTrader 5 Navigator panel with the right-click menu open on Expert Advisors and Refresh highlighted",
          annotations: [
            "1. Expert Advisors section in Navigator",
            "2. Refresh option in the right-click menu",
            "3. The EA listed after refreshing",
          ],
        },
      },
      {
        name: "Open a chart and drag the EA onto it",
        text: "An EA attaches to exactly one chart and works the symbol that chart shows. Open a chart for the currency pair the EA is designed for by dragging the pair from Market Watch into the chart area, then drag the EA's name from Navigator onto that chart. The settings dialog opens automatically. For Grit Markets, use the pair named in your dashboard's setup notes.",
        screenshot: {
          file: "mt5-drag-ea-onto-chart.webp",
          alt: "Expert Advisor being dragged from the Navigator panel onto an open currency pair chart in MetaTrader 5",
          annotations: [
            "1. EA name in Navigator",
            "2. Target chart for the correct pair",
          ],
        },
      },
      {
        name: "Fill in the Inputs tab — there are only three",
        text: "The Inputs tab lists the EA's settings, and Grit Markets keeps this deliberately short: LicenseKey, pasted exactly from your dashboard, which the EA checks against gritmarkets.com; EnableTelemetry, which feeds your dashboard and should stay true; and MagicNumber, an identifier that separates this EA's trades from anything else on the account — the default is fine unless support says otherwise. Everything about risk and sizing is configured from your dashboard as a risk profile, delivered to the EA automatically, with the equity stop armed in every profile. There is nothing risk-related to type into MT5, and nothing to get wrong here.",
        screenshot: {
          file: "ea-inputs-dialog-settings.webp",
          alt: "Expert Advisor Inputs tab showing the licence key, telemetry and magic number fields",
          annotations: [
            "1. Licence key field",
            "2. EnableTelemetry set to true",
            "3. Magic number (default)",
          ],
        },
      },
      {
        name: "Tick Allow Algo Trading in the Common tab",
        text: "Switch to the Common tab of the same dialog and tick the Allow Algo Trading box. This is the per-chart permission, separate from the toolbar button you enabled in the previous guide; both must be on for the EA to trade. Click OK to close the dialog and attach the EA to the chart.",
        screenshot: {
          file: "ea-common-tab-allow-algo-trading.webp",
          alt: "Expert Advisor settings dialog on the Common tab with the Allow Algo Trading checkbox ticked",
          annotations: [
            "1. Common tab selected",
            "2. Allow Algo Trading checkbox ticked",
          ],
        },
      },
      {
        name: "Confirm the EA is actually running",
        text: "Look at the top-right corner of the chart: the EA's name should appear with an icon showing it is active rather than crossed out or marked with a sad face. Then open the Toolbox and click the Experts tab, where the EA writes its startup messages; a healthy start typically includes a line confirming initialisation and the licence check. If either signal is missing, the common problems below cover the usual causes. You are still on demo, exactly as intended.",
        screenshot: {
          file: "mt5-chart-corner-ea-status.webp",
          alt: "Chart top-right corner showing the EA name with an active status icon and the Experts log confirming initialisation",
          annotations: [
            "1. EA name and active icon on the chart corner",
            "2. Initialisation line in the Experts tab",
          ],
        },
      },
    ],
    problems: [
      {
        question: "Why does my EA not appear in the Navigator after copying the file?",
        answer: "Almost always the file is in the wrong folder. It must sit directly inside MQL5\\Experts within the data folder opened via File, Open Data Folder, not in MQL5 itself, not in Indicators, and not in a subfolder created by unzipping. Check the file ends in .ex5, move it if needed, then right-click Expert Advisors in Navigator and choose Refresh. If it still refuses to show, restart the terminal, which forces a full rescan.",
      },
      {
        question: "The chart corner shows the EA name with a sad face or crossed out. What does that mean?",
        answer: "It means the EA is attached but not permitted to trade. Check three switches in order: the Algo Trading button on the toolbar must be green; Allow Algo Trading must be ticked on the Common tab, which you can reopen by pressing F7 on the chart; and Tools, Options, Expert Advisors must allow algorithmic trading. Fixing whichever one is off changes the icon to active immediately, with no need to reattach the EA.",
      },
      {
        question: "The Experts log says licence validation failed or WebRequest not allowed. How do I fix it?",
        answer: "Two causes cover nearly every case. Either https://gritmarkets.com is missing or mistyped in Tools, Options, Expert Advisors, Allow WebRequest for listed URL, so re-enter it exactly with no www, trailing slash or spaces, or the licence key in the Inputs tab was pasted with a stray character. Press F7, repaste the key from your dashboard, correct the whitelist, click OK, and the EA will retry the check within moments.",
      },
      {
        question: "Which chart timeframe and currency pair should I attach the EA to?",
        answer: "Use the pair stated in your Grit Markets setup notes, because the strategy is built and tested for a specific market, and attaching it elsewhere means running it somewhere it was never designed for. The timeframe of the chart usually matters less, as the EA reads the price data it needs regardless of what the chart displays, but following the documented recommendation removes doubt. One chart, one EA, one pair is the rule.",
      },
      {
        question: "Can I attach the same EA to several charts at once?",
        answer: "Technically yes, but do not do it here. Each attached copy trades independently, so two charts on the same pair would double every position, and with recovery sizing that doubles your worst case too. Grit Markets is designed to run as a single instance on the one recommended pair. If you ever want to experiment with more, do it on the demo account first and understand the combined margin requirement before considering anything live.",
      },
    ],
  },
  {
    slug: "first-run-and-daily-use",
    step: 5,
    navLabel: "First run and daily use",
    title: "Running an EA safely: first run and daily use",
    metaDescription:
      "What normal EA operation looks like, warning signs vs normal drawdown, when to intervene, how to stop it safely, and when demo becomes live.",
    timeMinutes: 10,
    answerFirst:
      "On a normal first day the EA may do nothing at all: it waits for a qualifying setup, and that patience is by design. Check the dashboard briefly each day, learn the difference between normal drawdown and genuine warning signs, and stay on demo for several weeks before you even consider a live account.",
    intro:
      "The EA is installed and running on your demo account, which means the setup work is done and a different skill begins: watching. Most of the damage beginners do to automated strategies comes not from the software but from the human fiddling with it, closing trades early, changing inputs mid-sequence, or switching it off and on at the worst moments. This final guide covers what normal looks like, what the dashboard is telling you, the few situations that genuinely call for intervention, and how to stop the EA safely when you choose to. It also sets the standard for the only optional step left: moving to a live account, later, if at all.",
    steps: [
      {
        name: "Expect a quiet first day and leave it alone",
        text: "Do not be surprised if the EA opens nothing for hours or even days: the engine waits for a qualifying setup and refuses to trade without one. A silent EA with a green status icon and a clean Experts log is working correctly. Resist the urge to reattach it, change inputs or restart the terminal to make something happen, because none of that creates a setup; it only risks breaking a healthy installation.",
        screenshot: {
          file: "mt5-quiet-chart-ea-waiting.webp",
          alt: "MetaTrader 5 chart with the EA active in the corner and no open positions, showing a normal waiting state",
          annotations: [
            "1. EA status icon showing active",
            "2. Empty Trade tab, no positions yet",
          ],
        },
      },
      {
        name: "Learn to read the subscriber dashboard",
        text: "Your Grit Markets dashboard shows four things at a glance. Equity is your account's live value including any open positions. Open positions lists what the EA currently holds. The recovery level shows how far into a sizing sequence the EA is, where level zero or one means the first, smallest position. Licence status confirms the EA can still validate against gritmarkets.com. A daily glance at these four takes under a minute.",
        screenshot: {
          file: "grit-dashboard-equity-positions-overview.webp",
          alt: "Grit Markets subscriber dashboard showing equity, open positions, recovery level and licence status panels",
          annotations: [
            "1. Equity figure updating live",
            "2. Current recovery level indicator",
            "3. Licence status showing valid",
          ],
        },
      },
      {
        name: "Distinguish normal drawdown from warning signs",
        text: "Drawdown is the temporary dip in equity while positions are open at a loss, and with recovery-based sizing some drawdown is a routine part of every sequence, not an emergency. The genuine warning signs are direction and proximity: a recovery level climbing steadily towards your max recovery levels cap, or equity approaching the equity stop you set in the inputs. On demo, deliberately watch a deep sequence all the way through, because seeing one resolve, or hit the stop, teaches you more than any page of text.",
        screenshot: {
          file: "dashboard-recovery-level-warning.webp",
          alt: "Dashboard chart showing recovery level rising towards its cap and equity nearing the equity stop line",
          annotations: [
            "1. Recovery level near the configured cap",
            "2. Equity approaching the equity stop line",
            "3. Normal shallow drawdown earlier for comparison",
          ],
        },
      },
      {
        name: "Set your intervention rule before you need it",
        text: "The default rule is: do not intervene. Closing positions in the middle of a sequence realises losses that the sequence was designed to manage, and it is the single most common way users turn a temporary drawdown into a permanent one. The exception is absolute: if you look at the worst case, the equity stop being hit and the account losing what remains, and you no longer accept it, stop the EA. That decision is always valid, at any time, and needs no other justification.",
        screenshot: {
          file: "worst-case-intervention-checklist.webp",
          alt: "Written intervention rule card stating do not interfere mid-sequence, but stop the EA if the worst case is no longer acceptable",
          annotations: [
            "1. Default rule: do not touch mid-sequence",
            "2. Override: stop if you no longer accept the worst case",
          ],
        },
      },
      {
        name: "Know the three ways to stop the EA, in order",
        text: "Removing the EA from the chart, by right-clicking the chart, choosing Expert List and removing it, stops new decisions but leaves existing positions open and unmanaged. Turning off the Algo Trading toolbar button pauses every EA in the terminal at once, again leaving positions open, and is the fastest emergency brake. Closing positions manually from the Toolbox's Trade tab is the final step that actually realises the outcome, so do it deliberately, understanding that the loss or profit becomes permanent at that moment.",
        screenshot: {
          file: "mt5-remove-expert-from-chart.webp",
          alt: "MetaTrader 5 chart context menu showing Expert List for removal, with the Algo Trading button and Trade tab also marked",
          annotations: [
            "1. Expert List option to remove the EA",
            "2. Algo Trading button as the master pause",
            "3. Trade tab where positions are closed manually",
          ],
        },
      },
      {
        name: "Build a two-minute daily routine",
        text: "Once a day, check four things: the EA status icon on the chart is active, the Experts and Journal tabs show no red errors, the dashboard's recovery level and equity look consistent with what you understood yesterday, and the licence status is valid. Note anything unusual in a simple log with the date; over weeks this becomes your own evidence of how the system behaves. That is the whole job. More frequent checking tends to invite fiddling, not safety.",
        screenshot: {
          file: "daily-check-routine-checklist.webp",
          alt: "Four-point daily checklist covering EA status, terminal logs, dashboard figures and licence validity",
          annotations: [
            "1. Chart status and logs",
            "2. Dashboard figures against yesterday",
          ],
        },
      },
      {
        name: "Move from demo to live only when you qualify yourself",
        text: "Going live is optional and should follow weeks of demo observation, not days, including at least one deep drawdown watched without interference. When you do choose it, open the live account with the same broker settings from step one, fund it only with money you can afford to lose entirely, and configure the EA with the smallest available base lot regardless of account size. You can scale a setting up later; you cannot un-lose money. Completing this step on demo means you have finished the setup path.",
        screenshot: {
          file: "live-account-smallest-base-lot-settings.webp",
          alt: "EA inputs dialog on a live account showing the base lot set to the smallest available value",
          annotations: [
            "1. Base lot at the minimum value",
            "2. Equity stop set before the first live trade",
          ],
        },
      },
    ],
    problems: [
      {
        question: "My EA has not opened a trade for two days. Is it broken?",
        answer: "Probably not. The engine only trades when a qualifying setup appears, and quiet markets can mean days without one; silence with a green status icon and a clean Experts log is normal operation. Confirm the Algo Trading button is green, the chart corner shows the EA as active, and the Journal shows a live connection. If all three are healthy, the correct action is to wait. If any of them is not, the earlier guides in this path show the fix.",
      },
      {
        question: "The EA is in drawdown. Should I close the trades myself?",
        answer: "Not because of drawdown alone. Temporary drawdown during a recovery sequence is how this style of strategy operates, and closing mid-sequence converts a managed, temporary loss into a permanent one. The two questions that matter are whether the recovery level is nearing your cap and whether equity is nearing your equity stop. Above all: if you no longer accept the worst case you originally signed up for, stopping the EA is always the right call, whatever the charts say.",
      },
      {
        question: "What happens to my open trades if my computer or VPS goes offline?",
        answer: "The positions remain open at the broker, because trades live on the broker's server, not on your machine, but nothing manages them until MetaTrader 5 reconnects. Any stop or protective orders already placed on the server still work; decisions the EA would have made do not happen. Get the terminal back online promptly, check the Journal for the reconnection, and confirm the EA resumed. This scenario is the core argument for a VPS before going live, and a non-event on demo.",
      },
      {
        question: "How long should I run the EA on demo before going live?",
        answer: "Weeks, not days, and ideally through at least one deep recovery sequence so you have felt a real drawdown with nothing at stake. There is no magic number, but a reasonable personal bar is: you can explain what the recovery level, base lot and equity stop each do, you have watched a sequence resolve without touching it, and the worst case no longer surprises you. Going live remains optional; some users run demo indefinitely, and that is a legitimate choice.",
      },
      {
        question: "When I go live, how big should my base lot be?",
        answer: "Start at the smallest lot size your broker allows, whatever your account balance. The base lot sets the first position in every sequence, and because recovery sizing multiplies from it, a small increase at the base means a much larger worst case at the top of a sequence. Run live at the minimum until the system's behaviour matches what your demo weeks taught you, and only then consider a measured increase you have checked against your margin and equity stop.",
      },
    ],
  },
];

export const HUB_RISK_PRIMER: string[] = [
  "This path teaches you to run automated software that trades foreign exchange using leverage, meaning you borrow from your broker to control positions larger than your deposit. Leverage magnifies losses as well as gains, and if you eventually go live, real money is at stake. That deserves respect rather than fear: read the five guides in order, practise every step on a demo account, and understand each risk control before it is needed. Grit Markets is software sold by subscription, not an investment service.",
  "The strategy uses Martingale-style position sizing, and you should understand what that means before spending anything. After a losing trade the next position is larger, so losing streaks compound in size while your account absorbs a growing drawdown. The typical pattern is frequent small wins punctuated by occasional deep drawdowns, and in a bad enough sequence total loss of your capital is possible; no built-in cap or equity stop removes that possibility. The simulator on our home page shows these mechanics, including the ugly sequences, before you pay anything.",
  "Be equally honest about capital. Money placed in a live account running this software must be money you can afford to lose entirely, without consequence to your household. The base lot, the recovery levels you allow, and the margin your broker requires for the largest position in a sequence are linked: a bigger base or more levels means a far larger worst case your account must carry. We make no income claims of any kind, and nothing you see in a simulator or backtest is a promise about your account.",
  "The rule of this path is demo-first: complete every one of the five steps on a demo account, where prices are real and the money is not. Only consider a live account after weeks of watching the software on demo, including at least one deep drawdown, and only once you can explain every risk control to someone else. If that standard feels slow, it is working as intended. Nothing on this site is investment advice; it is documentation for software.",
];
