export interface PostSection {
  heading: string;
  paragraphs: string[];
}

export interface Post {
  slug: string;
  title: string;              // phrased as a real search query where natural
  description: string;        // <=155 chars meta description
  answerFirst: string;        // 40-60 word direct answer opening the article
  date: string;               // ISO date
  status: "draft";
  sections: PostSection[];    // 4-6 sections, 2-4 paragraphs each
}

export const POSTS: Post[] = [
  {
    slug: "is-martingale-trading-safe",
    title: "Is Martingale trading safe? An honest answer from people who sell a Martingale EA",
    description:
      "No, Martingale trading is not safe. The team behind a Martingale EA explains the real risk, what controls can and cannot do, and who should walk away.",
    answerFirst:
      "No, Martingale trading is not safe. Position sizes compound while you are losing, so a sustained adverse move can wipe out an account. Risk controls such as level caps and equity stops can bound the loss on most sequences, but nothing removes the risk. We sell a Martingale EA, and that is still our answer.",
    date: "2026-07-10",
    status: "draft",
    sections: [
      {
        heading: "Why a Martingale vendor is writing this",
        paragraphs: [
          "Grit Agility Ltd sells Grit Markets, an expert advisor for MetaTrader 5 built around Martingale-based recovery. That gives us an obvious commercial incentive to soften this question, which is exactly why we are answering it bluntly instead. The EA market is full of vendors who describe Martingale systems as safe, smoothed, or solved. They are not, and a customer who discovers that through a margin call is worse for everyone, including us.",
          "Our position is simple: the strategy has genuine, well-understood strengths and a genuine, well-understood catastrophic failure mode. You deserve both halves of that sentence before you spend a penny on a subscription, ours included. If reading this article convinces you Martingale is not for you, it has done its job just as well as if it convinces you to try the simulator.",
        ],
      },
      {
        heading: "What Martingale actually does to your risk",
        paragraphs: [
          "A Martingale system opens a position at a base size. If the market moves against it by a set distance, it opens another, larger position at the same or a better price, typically the previous size multiplied by a fixed factor. It keeps doing this until a partial retracement lets the whole basket close at a small net profit. Because markets retrace far more often than they trend without pause, most baskets close in profit, and the equity curve between incidents looks remarkably smooth.",
          "The cost of that smoothness is hidden in the sizing. With a multiplier of two, the fifth recovery level is sixteen times the base lot and the tenth is five hundred and twelve times. Exposure grows geometrically at precisely the moments the trade is going wrong. The strategy is, in effect, selling insurance against sustained trends: it collects small premiums most of the time and pays out enormously when the rare event arrives.",
          "That rare event is not hypothetical. Central bank surprises, depegging events, geopolitical shocks and plain strong trends all produce the sustained one-directional moves that Martingale baskets cannot survive without deep reserves. Anyone who traded through the Swiss franc cap removal in 2015 or the sharper moves of recent years knows the shape of the problem. A backtest that happens to avoid such a window will look flawless, which is one of several reasons we insist on the caveat: simulated results. Backtests do not predict live performance.",
        ],
      },
      {
        heading: "What risk controls can do",
        paragraphs: [
          "The honest case for a modern Martingale EA is not that the risk disappears, but that it can be converted from unbounded to bounded. Grit Markets exposes the levers that matter. A maximum recovery level cap stops the doubling sequence at a depth you choose, so the worst basket has a known maximum size. An equity stop closes every position when floating losses reach a percentage of the account you define, turning the catastrophic tail into a large but pre-agreed loss. Conservative base lot sizing relative to the account keeps even a full worst-case sequence within survivable territory. Session and news filters keep the EA flat through the scheduled events most likely to produce violent moves.",
          "Used together and set conservatively, these controls change the question from whether you can be wiped out by one sequence to how much one bad sequence is allowed to cost. That is a meaningful improvement, and it is the difference between a Martingale implementation built by people who respect the mathematics and one built to make a sales page look good.",
        ],
      },
      {
        heading: "What risk controls cannot do",
        paragraphs: [
          "None of the above makes the strategy safe, and here is where most marketing goes quiet. An equity stop that fires still crystallises a real loss; capping the disaster is not the same as preventing it. In fast markets, price can gap through your stop level, so the loss you actually take can exceed the loss you configured. Slippage, widened spreads and broker execution all live outside the EA's control.",
          "There is also a slower failure mode that gets less attention: repeated bounded losses. If your settings are tight enough to stop out frequently, a sequence of controlled losses can grind an account down almost as effectively as one blow-up. Tighter caps reduce the size of each incident and increase their frequency; looser caps do the reverse. There is no configuration that gets you smoothness and safety at once, because the trade-off is the strategy.",
          "Finally, no filter list is complete. News filters cover scheduled events, but the moves that hurt most are often unscheduled. Whatever settings you run, you should assume the worst case will eventually occur and size so that you can absorb it.",
        ],
      },
      {
        heading: "Who should not run a Martingale EA",
        paragraphs: [
          "You should not run Grit Markets, or any Martingale system, with money you cannot afford to lose in full. Not most of it: all of it. That rules out rent money, emergency funds, and anything you would need to explain to your family. It also rules out anyone who would be tempted to disable the equity stop after watching it close a basket at a loss, because overriding the controls in frustration is the most common way disciplined configurations become undisciplined ones.",
          "You should also walk away if what you actually want is dependable income. A Martingale equity curve is a series of gains punctuated by occasional deep drawdowns, and no setting reorders that sequence to suit your bills. This is speculative, high-risk trading automation, not a savings product, and we do not sell it as one.",
        ],
      },
      {
        heading: "How to proceed if you still want to",
        paragraphs: [
          "If you understand the failure modes and still want the strategy, do it in this order. First, run your intended configuration through the simulator on this site and look hard at the worst-case drawdown, not the average outcome. Second, start on a demo account and watch the EA manage a full recovery basket before real money is involved. Third, fund a live account only with capital whose total loss you have already accepted, set the equity stop before the first trade, and never widen the caps while a basket is open.",
          "We built Grit Markets for people who make decisions that way. The subscription includes the documentation, the risk configuration guide and support from a team that will tell you when your settings look too aggressive, because we would rather keep an informed customer for years than an uninformed one for a month. Nothing in this article is investment advice; it is a description of how the software and the strategy behave. What you do with that is, properly, your decision.",
        ],
      },
    ],
  },
  {
    slug: "how-much-capital-to-run-martingale-ea-mt5",
    title: "How much capital do you need to run a Martingale EA on MT5?",
    description:
      "How base lot, multiplier, recovery levels, leverage and margin decide the capital a Martingale EA needs on MT5, and how to model your own worst case.",
    answerFirst:
      "There is no single figure. The capital a Martingale EA needs is determined by your base lot size, the multiplier, the maximum recovery levels, and your broker's margin and leverage terms. Work out the worst-case basket your settings permit, then hold enough to survive it. A simulator makes this arithmetic concrete.",
    date: "2026-07-10",
    status: "draft",
    sections: [
      {
        heading: "Why nobody honest quotes a minimum deposit",
        paragraphs: [
          "Search for this question and you will find confident answers ranging across two orders of magnitude, usually attached to a sales page. The spread exists because the question is underspecified. A Martingale EA's capital requirement is not a property of the EA; it is a property of the configuration you run it with and the account you run it on. The same software can be conservatively survivable on one setup and one bad week from a margin call on another.",
          "So instead of a number, this article gives you the machinery: the four inputs that determine the requirement, the worst-case arithmetic that connects them, and a way to test your own configuration before any money is at risk. If a vendor quotes you a universal minimum deposit without asking about your settings, treat it as a marketing figure, not an engineering one.",
        ],
      },
      {
        heading: "The four inputs that set the requirement",
        paragraphs: [
          "First, base lot size: the volume of the initial trade in a cycle. Everything else scales from it linearly, so halving the base lot halves the whole worst-case calculation. Second, the multiplier: the factor applied to position size at each recovery level. This is the most sensitive input, because it compounds. A multiplier of 1.5 and a multiplier of 2.0 sound adjacent and behave nothing alike after eight levels.",
          "Third, the maximum recovery level cap: how many times the EA is permitted to add before it stops and waits, or the equity stop resolves the basket. This bounds the geometric series. Fourth, your broker's terms: the margin required per lot on the traded instrument and the leverage on your account, which together decide how much of your balance is consumed simply holding the basket open, before floating losses are counted.",
          "Two of these, base lot and level cap, you set directly in the EA inputs. The multiplier is also configurable within the strategy's design range. The broker terms you inherit, which is one reason account selection is part of risk management rather than an afterthought.",
        ],
      },
      {
        heading: "The worst-case basket, step by step",
        paragraphs: [
          "The calculation that matters is the fully extended basket: every permitted level open at once, with the market at the furthest adverse point before the equity stop fires. Total volume is the base lot multiplied by the sum of the geometric series across your level cap. With a multiplier of two and eight levels, that sum is 255 times the base lot; with ten levels it is 1,023 times. This is the arithmetic behind every Martingale blow-up story: people size for the first trade and are ambushed by the sum.",
          "That total volume drives two separate demands on your balance. Margin is the collateral the broker locks to keep the basket open, which is total volume times the per-lot margin requirement. Floating drawdown is the unrealised loss across the basket at maximum adverse excursion, which depends on the level spacing and the distance the market has travelled against you. Your account has to cover both at the same time, with headroom, because a margin call at the bottom of the excursion converts a temporary drawdown into a permanent loss at the worst possible price.",
          "Notice what this calculation does to intuition. A seemingly minor act of impatience, raising the multiplier a notch or allowing two extra levels, can multiply the capital requirement several times over. The relationship between settings and requirement is geometric, and geometric relationships punish rounding up in the aggressive direction.",
        ],
      },
      {
        heading: "Leverage changes the packaging, not the risk",
        paragraphs: [
          "Higher leverage lowers the margin locked per lot, which makes the worst-case basket cheaper to hold open. It is tempting to read that as reducing the capital requirement. It does not. The floating drawdown of the extended basket is exactly the same at any leverage, because it is a function of position size and price distance, not margin. What high leverage actually buys you is the ability to dig a deeper hole before the broker intervenes.",
          "The practical guidance follows directly: size your account against the floating drawdown of the worst case, not against the minimum margin to open it. Leverage determines whether your broker lets you take the risk; only your balance determines whether you survive it. UK and EU retail accounts, with leverage capped by regulation, force more honest sizing here than offshore accounts offering leverage in the hundreds, which flatter a Martingale configuration right up until they do not.",
        ],
      },
      {
        heading: "Model it before you fund it",
        paragraphs: [
          "You could build all of this in a spreadsheet, and some subscribers do. To make it easier, Grit Markets includes a simulator on this site: enter a base lot, multiplier, level cap and account size, and it shows the total worst-case volume, the margin load at your broker's terms, and the floating drawdown at full extension, alongside where your equity stop would intervene. Watching the drawdown figure respond as you nudge the multiplier is the fastest cure for aggressive settings we know of.",
          "Use the simulator to answer one question: if the worst case my settings permit happened next week, is the resulting loss one I have already accepted? If the answer is no, reduce the base lot or tighten the caps until it is yes, and only then consider funding an account. Where you also review backtest data during that process, keep the standing caveat in view: simulated results. Backtests do not predict live performance.",
          "None of this is a promise about outcomes, and none of it is investment advice. It is arithmetic, offered so that whatever decision you make about capital is an informed one. A Martingale EA run inside a properly sized worst case is a high-risk instrument with a defined downside. Run outside one, it is an account waiting for its ending. The difference is decided before the first trade, which is why this article exists.",
        ],
      },
    ],
  },
  {
    slug: "how-to-choose-mt5-expert-advisor-subscription",
    title: "How to choose an MT5 expert advisor subscription: 7 questions to ask before you pay",
    description:
      "Seven questions that separate honest MT5 expert advisor subscriptions from marketing traps: strategy, risk controls, backtests, terms and support.",
    answerFirst:
      "Before paying for any MT5 expert advisor subscription, get clear answers on seven things: what the strategy actually is, the worst-case risk, what the risk controls do, how backtests are presented, licensing and cancellation terms, the company behind it, and support. A vendor who dodges any of them has answered anyway.",
    date: "2026-07-10",
    status: "draft",
    sections: [
      {
        heading: "Why the EA market rewards scepticism",
        paragraphs: [
          "The expert advisor market has a structural problem: the product is judged on an equity curve, and equity curves are easy to manufacture. Curated backtests, demo accounts reset after bad runs, and results pages with no third-party verification are common enough that a careful buyer should treat every performance claim as unproven until shown otherwise. Subscriptions raise the stakes, because you are not making one purchase but signing up to a recurring relationship with the vendor.",
          "We sell Grit Markets, an MT5 expert advisor subscription, so we are not neutral observers here. The most useful thing we can do about that is publish the checklist we think you should hold every vendor to, and answer it ourselves in public. The seven questions below will disqualify a large share of the market. That is the point.",
        ],
      },
      {
        heading: "Questions 1 and 2: what is the strategy, and what is the worst case?",
        paragraphs: [
          "Question one: what does the EA actually do? You do not need source code, but you do need the strategy class and its known failure modes in plain language. Grid, Martingale, breakout, mean reversion, news scalping: each has a characteristic way of making money and a characteristic way of losing it. A vendor who will not name the approach, or hides it behind phrases like proprietary AI algorithm, is hiding the failure mode. Our answer, for the record: Grit Markets is Martingale-based recovery, and its failure mode is a sustained adverse trend, which is why this site discusses blow-up risk on the front page rather than in a footnote.",
          "Question two: what is the worst case, in numbers and mechanics? Every strategy has one. The honest vendor can tell you what a catastrophic sequence looks like, what it costs at given settings, and what stands between normal operation and that outcome. Listen for the shape of the answer. It cannot lose is a lie. It has never lost is a backtest talking. The worst case is X, bounded by controls Y and Z, and here is how to size for it is the answer of someone who understands their own product.",
        ],
      },
      {
        heading: "Questions 3 and 4: risk controls, and how results are presented",
        paragraphs: [
          "Question three: what risk controls exist, and are they yours to configure? A serious EA exposes an equity stop, position size limits and strategy-appropriate caps, documented well enough that you understand each one before real money is behind it. Be wary of EAs where the safety settings are opaque, hard-coded, or where the marketing quietly encourages you to loosen them for better results. The controls are the product; the equity curve is the by-product.",
          "Question four: how does the vendor present performance? Backtests are legitimate engineering tools and terrible promises. Any simulated result should be labelled as simulated and carry a warning that it does not predict live performance; ours carry exactly that, every time, because it is true: simulated results. Backtests do not predict live performance. Treat unverified account screenshots as decoration, and treat published percentage returns and win rates as claims requiring evidence you will rarely get. A vendor confident in the product does not need to promise you numbers; a vendor promising numbers is telling you where their confidence actually lives.",
        ],
      },
      {
        heading: "Questions 5 and 6: the terms, and the company",
        paragraphs: [
          "Question five: what exactly does the subscription buy, and how do you leave? Before paying, you should know how many MT5 accounts one licence covers, what happens to the EA when the subscription lapses, whether cancellation is self-service, and when it takes effect. As a UK or EU consumer buying digital content, you also have statutory cooling-off rights; a vendor's refund page should engage with them rather than pretend they do not exist. Grit Markets is one licence per MT5 account, cancel any time from the dashboard effective at the end of the paid period, with the terms and refund policy published in full on this site.",
          "Question six: who is behind it, and where do they stand legally? A registered company with a named jurisdiction, published terms and a working complaints route can be held to account; an anonymous website with a payment button cannot. Check the company register where one is claimed. Grit Markets is sold by Grit Agility Ltd, registered in Scotland as company SC837399, and our contracts say so with governing law attached. Also confirm what the vendor is not: an EA seller is a software company, not your investment adviser, and any vendor blurring that line is either confused about the law or hoping you are.",
        ],
      },
      {
        heading: "Question 7, and how to use the list",
        paragraphs: [
          "Question seven: what happens after you pay? Support quality is invisible on the sales page and decisive six weeks in, when a broker changes margin terms or an update needs installing. Look for documentation you can read before purchase, a stated support channel with a response expectation, and evidence of maintenance, because MT5 builds change and unmaintained EAs quietly rot. A vendor who invests in documentation before the sale generally invests in support after it.",
          "Used together, the seven questions form a filter: strategy named, worst case quantified, controls configurable, results honestly labelled, terms explicit, company identifiable, support real. No answer among them tells you an EA will make money; no honest process can tell you that. What the filter finds is vendors who treat you as a counterparty in an informed agreement rather than a conversion. Hold Grit Markets to every line of it. If we ever fail the checklist we published, you will know exactly what that means, and you will have learned it the cheap way.",
        ],
      },
    ],
  },
];
