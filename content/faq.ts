export interface FaqEntry {
  slug: string;            // kebab-case
  question: string;        // phrased as a real search query
  answerShort: string;     // 40-60 words, direct answer, plain text (used in FAQPage JSON-LD)
  answerLong: string[];    // 2-4 expansion paragraphs, plain text
}

export const FAQ: FaqEntry[] = [
  {
    slug: "what-is-grit-markets",
    question: "What is Grit Markets?",
    answerShort:
      "Grit Markets is an expert advisor for MetaTrader 5 that automates a Martingale-based trading strategy with configurable risk controls. It is sold as a monthly software subscription by Grit Agility Ltd, a UK company. It is trading software, not an investment service, and it does not guarantee any profit.",
    answerLong: [
      "Grit Markets is a piece of software, an automated trading program known as an expert advisor or EA, that runs inside the MetaTrader 5 platform on your own broker account. Once installed and configured, it opens, manages and closes positions according to a Martingale-based recovery strategy, without you needing to sit at the screen.",
      "The subscription gives you a licence to run the software, access to updates, documentation and support, and tools such as an on-site risk simulator to help you understand how your chosen settings behave. You keep full control of your broker account and your capital at all times; Grit Agility Ltd never holds, manages or has access to your funds.",
      "It is important to be clear about what Grit Markets is not. It is not investment advice, portfolio management or a fund. Grit Agility Ltd is a software company, not a regulated financial adviser, and nothing on this site is a recommendation to trade. Martingale strategies carry substantial risk, including the possibility of losing your entire trading balance, and we say so plainly throughout this site.",
    ],
  },
  {
    slug: "how-does-a-martingale-trading-strategy-work",
    question: "How does a Martingale trading strategy work?",
    answerShort:
      "A Martingale trading strategy increases position size after a losing trade, so that a single winning trade can recover accumulated losses plus a small profit. Each additional recovery level multiplies exposure, which means drawdowns grow geometrically. The approach can produce long runs of small gains punctuated by occasional large losses.",
    answerLong: [
      "The Martingale concept comes from eighteenth-century betting systems: double your stake after each loss so that one win recovers everything. Applied to trading, an EA opens an initial position at a base lot size. If the market moves against it by a set distance, the EA opens a further position in the same direction at a larger size, typically the previous size multiplied by a fixed factor. When the market retraces far enough, the combined basket closes at a net profit and the cycle resets.",
      "The mathematics is unforgiving in both directions. Because most price movements retrace at least partially, a Martingale system can close many consecutive baskets in profit, which is what makes the equity curve look smooth. But position size grows geometrically with each level: with a multiplier of two, the tenth level is 512 times the base lot. A sustained one-directional move, the kind that happens around central bank surprises, geopolitical shocks or simply strong trends, can exhaust margin before any retracement arrives.",
      "Grit Markets implements this strategy with explicit, configurable limits: a cap on recovery levels, an equity stop that closes everything at a defined loss threshold, and filters that keep the EA out of the market at high-risk times. These controls bound the damage a bad sequence can do. They do not change the underlying character of the strategy, and we would rather you understand that before you subscribe than after.",
    ],
  },
  {
    slug: "can-a-martingale-ea-blow-my-account",
    question: "Can a Martingale EA blow my account?",
    answerShort:
      "Yes. Any Martingale EA, including Grit Markets, can lose your entire trading balance. Compounding position sizes mean a sustained move against the basket can exhaust margin before price retraces. Risk controls such as equity stops and level caps bound the loss on most sequences, but no setting eliminates the risk.",
    answerLong: [
      "We sell a Martingale EA, and we will still give you the straight answer: yes, it can. The defining feature of Martingale position sizing is that exposure compounds while you are losing. If the market trends hard against the open basket and never retraces to the recovery point, losses accelerate with every additional level until either the equity stop fires, margin runs out, or the broker force-closes the positions. Total loss of the balance on that account is a real outcome, not a theoretical one.",
      "Grit Markets ships with controls designed to keep any single bad sequence survivable rather than terminal: a hard cap on the number of recovery levels, an account-level equity stop that liquidates the basket at a loss threshold you set, base lot sizing guidance relative to account size, and time and news filters that avoid the most volatile scheduled events. Used conservatively, these controls turn an unbounded risk into a bounded one, where the worst case for a sequence is a large but defined loss.",
      "Bounded is not the same as eliminated. An equity stop that triggers still crystallises a loss, gaps and slippage can carry price through your stop level, and repeated stop-outs can erode an account almost as surely as one catastrophic sequence. If a vendor tells you their Martingale system cannot blow an account, they are either misinformed or misleading you. Only trade with money you can genuinely afford to lose.",
    ],
  },
  {
    slug: "how-much-capital-do-i-need-to-run-a-martingale-ea",
    question: "How much capital do I need to run a Martingale EA?",
    answerShort:
      "There is no universal figure. The capital a Martingale EA needs depends on your base lot size, the multiplier, the maximum number of recovery levels, your broker's margin requirements and leverage. The deeper the worst-case basket you want to survive, the more free margin you need. Model your settings before funding an account.",
    answerLong: [
      "Anyone quoting a single minimum deposit for a Martingale EA is guessing on your behalf. The genuine drivers are arithmetic: your base lot determines the size of level one, the multiplier determines how fast size grows at each recovery level, and the maximum level cap determines how large the total basket can become. Add your broker's margin requirement per lot and the leverage on the account, and you can calculate the free margin needed to hold the worst-case basket through its maximum drawdown without a margin call.",
      "As a way of thinking rather than a promise: a small change in the multiplier or one extra permitted level can multiply the capital requirement, because the sizing is geometric. This is why two traders running the same EA can have completely different risk profiles, and why we do not publish a headline minimum. What matters is the relationship between your settings and your balance, not the balance alone.",
      "Grit Markets includes a simulator on this site that takes your proposed base lot, multiplier, level cap and account size and shows the margin load and drawdown of a worst-case sequence under those settings. We strongly suggest running your intended configuration through it before you fund an account, and sizing so that the worst case is a loss you can absorb, because eventually the worst case arrives. Simulated results. Backtests do not predict live performance.",
    ],
  },
  {
    slug: "which-brokers-and-account-types-work-with-grit-markets",
    question: "Which brokers and account types work with Grit Markets?",
    answerShort:
      "Grit Markets runs on any broker that offers MetaTrader 5 with a hedging-type account. It attaches to a standard MT5 chart and needs no broker-side integration. Netting accounts are not supported, because the strategy holds multiple positions in the same instrument. Check your account type in the MT5 terminal before subscribing.",
    answerLong: [
      "Because Grit Markets is a standard MetaTrader 5 expert advisor, it is broker-agnostic: if your broker gives you an MT5 account, the EA can run on it. There is no special data feed, plugin or partnership required. The one hard requirement is the account's position accounting mode. Martingale recovery relies on holding several open positions in the same symbol simultaneously, which requires a hedging account. On a netting account MT5 merges positions in one symbol into a single net position, which breaks the strategy's basket logic.",
      "You can check which type you have in the MT5 terminal: the account type is shown in the terminal's account details, and most brokers state it when you open the account. If you are on a netting account, most brokers will open a hedging account on request.",
      "Beyond that hard requirement, execution quality still matters. Spreads, commissions, swap rates and slippage all affect a strategy that trades frequently and holds baskets of positions, so a low-cost account with reliable execution will always serve you better than a high-spread one. [OWNER INPUT: list any specifically tested or recommended brokers, minimum account specifications, and supported instruments.]",
    ],
  },
  {
    slug: "do-i-need-a-vps-to-run-an-mt5-expert-advisor",
    question: "Do I need a VPS to run an MT5 expert advisor?",
    answerShort:
      "Strictly you need MetaTrader 5 running continuously while markets are open, and a VPS is the most reliable way to achieve that. A home computer works if it never sleeps, reboots or loses connection, but for a Martingale EA managing open baskets, an interruption at the wrong moment can be expensive.",
    answerLong: [
      "An expert advisor only trades while its MetaTrader 5 terminal is running and connected. If your computer sleeps, updates itself overnight, or your home broadband drops, the EA goes blind: it cannot open recovery levels, trail exits or trigger its equity stop until the terminal reconnects. For strategies that trade occasionally this is an inconvenience. For a Martingale EA that may be managing an open basket of positions around the clock, it is a genuine risk, because the moments you most need the risk controls to fire are often the volatile ones.",
      "A virtual private server is a Windows machine rented in a data centre that runs twenty-four hours a day on redundant power and enterprise-grade connectivity. You install MT5 and Grit Markets on it exactly as you would at home, then connect occasionally by remote desktop to check on things. Locating the VPS near your broker's servers also reduces order latency, though for this strategy uptime matters far more than shaving milliseconds.",
      "You do not have to use one, and nothing in Grit Markets requires it. But if you intend to run the EA unattended through the trading week, we recommend a VPS as the professional default. Our setup guide walks through choosing a provider and configuring Windows so the terminal survives reboots.",
    ],
  },
  {
    slug: "how-does-the-grit-markets-subscription-and-license-work",
    question: "How does the Grit Markets subscription and license work?",
    answerShort:
      "Grit Markets is sold as a monthly software subscription. Each subscription includes a licence key bound to one MetaTrader 5 account number, and the EA validates the key when it runs. You can cancel at any time, effective at the end of the current billing period. Current pricing is on the pricing page.",
    answerLong: [
      "When you subscribe, you receive a licence key and access to your account dashboard, where you download the EA file and documentation. The licence is bound to a single MT5 account number that you nominate: the EA checks the key and account number against our licensing server when it starts, which is why the installation guide has you authorise https://gritmarkets.com in the terminal's WebRequest settings. One subscription covers one live MT5 account; if you want to run additional accounts, each needs its own licence. [OWNER INPUT: confirm demo-account policy and whether licence rebinding to a new MT5 account is self-service or handled by support.]",
      "The subscription renews monthly and includes software updates, documentation and support for as long as it is active. There is no long-term contract or exit fee: you can cancel from your dashboard at any time, and cancellation takes effect at the end of the billing period you have already paid for, so you keep access until then. If the subscription lapses, the licence stops validating and the EA stops opening new trades.",
      "Pricing is published on the pricing page at gritmarkets.com/pricing, and the full contractual terms, including the cooling-off rights you have as a UK or EU consumer, are set out in our Terms of Service and Refund and Cancellation Policy.",
    ],
  },
  {
    slug: "does-grit-markets-guarantee-profits",
    question: "Does Grit Markets guarantee profits?",
    answerShort:
      "No. Grit Markets does not guarantee profits, returns or any trading outcome, and neither does any honest trading software vendor. It is a tool that automates a high-risk Martingale strategy; results depend on markets, your settings and your broker. You can lose some or all of the money you trade with.",
    answerLong: [
      "The answer is no, without qualification. Grit Markets is software. It executes a defined strategy faithfully, but it has no control over what markets do, and no algorithm converts trading into a source of assured income. Leveraged foreign exchange and CFD trading is high risk in general, and Martingale position sizing concentrates that risk into occasional deep drawdowns. Losing part or all of the balance on the account running the EA is a possible outcome at any time.",
      "You should treat any performance claim, from us or anyone else, with scepticism. Where we show backtest data, it is clearly labelled and carries the same warning every time: Simulated results. Backtests do not predict live performance. Backtests benefit from hindsight, idealised execution and survivorship in parameter selection, and a Martingale backtest in particular can look flawless right up until the sequence that ends it.",
      "If a guaranteed or near-guaranteed return is what you are looking for, an expert advisor is the wrong product, and we would rather tell you that than take your subscription. What we do commit to is the software working as documented, honest disclosure of how the strategy behaves in the worst case as well as the best, and tools that let you measure the risk of your own configuration before you put money behind it.",
    ],
  },
];
