export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDoc {
  slug: "terms" | "privacy" | "refunds" | "risk";
  title: string;
  description: string;      // <=155 chars
  updated: string;
  sections: LegalSection[]; // 6-12 sections
}

export const LEGAL: LegalDoc[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    description:
      "Terms of Service for the Grit Markets software subscription from Grit Agility Ltd: licence, acceptable use, billing, termination and governing law.",
    updated: "2026-07-10",
    sections: [
      {
        heading: "1. Who we are and what these terms cover",
        paragraphs: [
          "These Terms of Service govern your purchase and use of Grit Markets, an expert advisor software product for the MetaTrader 5 platform, and the associated website at https://gritmarkets.com, account dashboard, documentation and support services (together, the Service). The Service is provided by Grit Agility Ltd, a company registered in Scotland with company number SC837399 (we, us, our). [OWNER INPUT: registered office address and support contact email.]",
          "By creating an account, purchasing a subscription or using the software, you agree to these terms. If you are a consumer, nothing in these terms affects your statutory rights, including those under the Consumer Rights Act 2015 and the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013. Where these terms conflict with a right you have by law that cannot be excluded, the law prevails.",
          "You must be at least 18 years old to use the Service. By subscribing you confirm that you meet this requirement and that trading in leveraged products is lawful for you in your country of residence.",
        ],
      },
      {
        heading: "2. What Grit Markets is, and what it is not",
        paragraphs: [
          "Grit Markets is software. It automates a Martingale-based trading strategy on a MetaTrader 5 account that you hold with a broker of your choosing. We supply the software, updates, documentation and support. We do not hold, manage or have access to your money, we do not execute trades on your behalf, and we are not a party to any transaction between you and your broker.",
          "We are not authorised or regulated by the Financial Conduct Authority or any other financial regulator, and the Service does not include investment advice, portfolio management or any other regulated activity. Nothing on the website, in the documentation or in support communications is a recommendation to trade or a statement that any configuration of the software is suitable for you. All decisions to trade, including the choice of broker, instrument, capital and settings, are yours alone.",
          "Use of the software involves significant financial risk, up to and including the loss of the entire balance of the trading account on which it runs. You must read our Risk Disclosure, which forms part of these terms, before using the software with real funds.",
        ],
      },
      {
        heading: "3. Your subscription and licence",
        paragraphs: [
          "Grit Markets is sold as a monthly subscription. In return for the subscription fee, we grant you a personal, non-exclusive, non-transferable, revocable licence to install and run the software for your own trading, for as long as your subscription remains active and you comply with these terms. Current pricing is published at https://gritmarkets.com/pricing.",
          "Each subscription includes one licence key, which is bound to a single MetaTrader 5 account number nominated by you. The software validates the licence key and account number against our servers when it runs. Running the software on additional MT5 accounts requires additional subscriptions. [OWNER INPUT: policy on demo accounts and on rebinding a licence to a new MT5 account number, including any limits or fees.]",
          "The licence is a right to use the software, not a sale of it. We and our licensors retain all intellectual property rights in the software, documentation and website content. Your subscription does not transfer any ownership to you.",
        ],
      },
      {
        heading: "4. Billing, renewal and cancellation",
        paragraphs: [
          "Subscription fees are charged in advance for each monthly billing period, using the payment method you provide. Payments are processed by our payment processor, Stripe; we do not store your full card details. Your subscription renews automatically at the end of each billing period unless you cancel.",
          "You may cancel at any time from your account dashboard. Cancellation takes effect at the end of the billing period you have already paid for, and you retain access to the Service until then. We do not charge exit fees. Refunds and your statutory cooling-off rights are dealt with in our Refund and Cancellation Policy, which forms part of these terms.",
          "We may change subscription prices from time to time. Price changes do not affect a billing period you have already paid for. We will give you at least 30 days notice of a price change by email, and if you do not accept it you may cancel before it takes effect.",
          "If a payment fails, we will retry it and notify you. If payment is not received within [OWNER INPUT: grace period, e.g. 7 days] of the due date, we may suspend licence validation until payment is made, and may cancel the subscription after continued non-payment.",
        ],
      },
      {
        heading: "5. Acceptable use",
        paragraphs: [
          "You agree not to: share, resell, sublicense or otherwise distribute the software or your licence key; attempt to reverse engineer, decompile, disassemble or modify the software or to circumvent its licence validation, except to the extent such acts cannot be prohibited by law; use the software or licence system to develop a competing product; interfere with the operation or security of the Service, including its licensing servers; or use the Service in breach of any law that applies to you, including the rules of your broker and any restrictions on automated trading in your jurisdiction.",
          "You are responsible for keeping your account credentials and licence key confidential, and for all activity under your account. Notify us promptly if you believe your account or key has been compromised.",
          "We may suspend or terminate your licence and account, without refund of fees for the current period except where the law requires otherwise, if you materially breach these terms, including any attempt to crack, share or resell the software.",
        ],
      },
      {
        heading: "6. Software delivery, updates and support",
        paragraphs: [
          "The software is delivered digitally through your account dashboard immediately after purchase. We may release updates from time to time to fix defects, maintain compatibility with MetaTrader 5 builds or improve the software, and an active subscription includes access to those updates. We may require you to install a current version for the licence to continue validating, where an old version poses a security or operational risk.",
          "Support is provided by [OWNER INPUT: support channel, e.g. email address and any response-time expectation] for questions about installation, configuration and operation of the software. Support does not include trading advice, recommendations of settings for profitability, or advice about your broker.",
          "The software depends on third-party systems we do not control, including the MetaTrader 5 platform, your broker's servers, your VPS or computer, and your internet connection. We are not responsible for failures, changes or outages in those systems.",
        ],
      },
      {
        heading: "7. Your statutory rights in the software",
        paragraphs: [
          "If you are a consumer, the Consumer Rights Act 2015 gives you rights in relation to digital content: it must be of satisfactory quality, fit for purpose and as described. If the software is faulty, you are entitled to have it repaired or replaced, and if that fails, to a price reduction which may be up to the full amount paid. These rights are in addition to anything in our Refund and Cancellation Policy.",
          "For clarity, the description of the software is that it executes the documented strategy according to your settings. Trading losses are not a defect. The software performing the strategy faithfully during a period in which the strategy loses money does not make the software faulty, and these terms make no promise of trading performance of any kind.",
        ],
      },
      {
        heading: "8. Disclaimers and limitation of liability",
        paragraphs: [
          "Nothing in these terms excludes or limits our liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for any other liability that cannot be excluded or limited under the law of Scotland, including your statutory rights as a consumer.",
          "Subject to that: we are not liable for trading losses. You acknowledge that trading decisions and outcomes on your broker account are your responsibility, that the software automates a high-risk strategy which can produce large drawdowns and the total loss of the balance on the account it trades, and that we make no warranty as to trading results. We are also not liable for losses caused by events outside our reasonable control, including broker actions, market conditions, platform outages, or failures of your hardware, VPS or connectivity.",
          "Subject to the first paragraph of this section, our total liability to you arising out of or in connection with the Service, whether in contract, delict, breach of statutory duty or otherwise, is limited to the greater of the amounts you paid us in the 12 months before the event giving rise to the claim and [OWNER INPUT: liability floor amount, e.g. 100 GBP]. We are not liable for indirect or consequential loss, loss of profits, loss of anticipated savings or loss of opportunity.",
          "If you use the Service in the course of a business, the software is provided as is to the fullest extent permitted by law, and we exclude all implied terms as to quality and fitness for purpose.",
        ],
      },
      {
        heading: "9. Privacy",
        paragraphs: [
          "We process personal data, including account details, billing information and licence validation telemetry, as described in our Privacy Policy, which forms part of these terms. By using the Service you acknowledge that the software contacts our servers at https://gritmarkets.com to validate your licence, and that this transmits the data described in the Privacy Policy.",
        ],
      },
      {
        heading: "10. Changes to these terms",
        paragraphs: [
          "We may update these terms from time to time, for example to reflect changes in the law, our Service or our business. For material changes we will give you at least 30 days notice by email or through your dashboard. If you do not accept the changes you may cancel your subscription before they take effect; continuing to use the Service after the effective date constitutes acceptance.",
        ],
      },
      {
        heading: "11. General",
        paragraphs: [
          "If any provision of these terms is found to be unenforceable, the remainder continues in effect. A failure by us to enforce a provision is not a waiver of it. You may not assign your subscription or licence; we may assign our rights and obligations under these terms to a successor of our business, provided your rights are not reduced. These terms, together with the Refund and Cancellation Policy, Privacy Policy and Risk Disclosure, are the entire agreement between us in relation to the Service.",
        ],
      },
      {
        heading: "12. Governing law and jurisdiction",
        paragraphs: [
          "These terms are governed by the law of Scotland. The courts of Scotland have jurisdiction over any dispute arising out of or in connection with these terms or the Service, except that if you are a consumer resident elsewhere in the United Kingdom or in the European Union, you may also bring proceedings in the courts of your place of residence, and you retain the benefit of any mandatory consumer protections of that place.",
          "If you have a complaint, please contact us first at [OWNER INPUT: complaints contact email] and we will try to resolve it with you directly.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description:
      "How Grit Agility Ltd collects and uses personal data for the Grit Markets service under UK GDPR: what we collect, why, how long we keep it, your rights.",
    updated: "2026-07-10",
    sections: [
      {
        heading: "1. Who is responsible for your data",
        paragraphs: [
          "This policy explains how Grit Agility Ltd, a company registered in Scotland with company number SC837399, collects and uses personal data when you visit https://gritmarkets.com, create an account, subscribe to Grit Markets or run the software. Grit Agility Ltd is the data controller for this processing. [OWNER INPUT: registered office address and privacy contact email; confirm whether the company is registered with the ICO and, if so, the registration number.]",
          "We process personal data in accordance with the UK General Data Protection Regulation and the Data Protection Act 2018. This policy applies to the website, the account dashboard, the licensing system built into the software, and our communications with you.",
        ],
      },
      {
        heading: "2. What we collect and why",
        paragraphs: [
          "Account data: when you create an account we collect your email address and a password, and any name you choose to provide. We use this to operate your account, deliver the software and licence key, and send service messages such as billing notices and security alerts. Lawful basis: performance of our contract with you.",
          "Billing data: payments are processed by Stripe, acting as our payment processor. Stripe collects your card details directly; we do not receive or store full card numbers. We receive from Stripe confirmation of payment, the payment method type, and billing details needed for our records, such as your name, billing address and country. Lawful bases: performance of our contract, and our legal obligations to keep accounting and tax records.",
          "Licence validation telemetry: when the Grit Markets software runs, it contacts our servers at https://gritmarkets.com to validate your licence. This transmits your licence key, the MetaTrader 5 account number the software is attached to, and the IP address from which the request is made, together with basic technical data such as the software version. We use this to enforce the one-licence-per-account binding, prevent fraud and licence abuse, and diagnose validation faults. Lawful basis: performance of our contract (licence enforcement is how the subscription works) and our legitimate interest in preventing fraud and protecting our intellectual property. We do not receive your trades, positions, balance or broker credentials through licence validation. [OWNER INPUT: confirm the exact telemetry fields transmitted by the shipped EA and update this list if it differs.]",
          "Support and correspondence: if you contact us we keep the correspondence and any information you include in it, to answer you and to keep a record of the issue. Lawful basis: our legitimate interest in providing support and handling disputes.",
          "Website data: our web server and hosting infrastructure log IP addresses and request data for security and reliability. Lawful basis: our legitimate interest in running a secure service. [OWNER INPUT: confirm analytics and cookie usage; if any non-essential cookies or analytics are used, a cookie notice and consent mechanism are required and this section must be updated.]",
        ],
      },
      {
        heading: "3. Who we share data with",
        paragraphs: [
          "We share personal data with service providers who process it on our instructions as processors: Stripe for payment processing; [OWNER INPUT: hosting provider for the website, dashboard and licensing servers]; [OWNER INPUT: email delivery provider for service and support email]; and [OWNER INPUT: any other processors, e.g. analytics, support desk, accounting software]. Each processor is bound by a contract meeting the requirements of Article 28 UK GDPR.",
          "We may also disclose data where the law requires it, for example to HMRC in connection with tax records, to law enforcement under a lawful request, or to our professional advisers where necessary to establish or defend legal claims. If our business is sold or reorganised, data may be transferred to the successor subject to this policy. We do not sell personal data, and we do not share it with third parties for their own marketing.",
        ],
      },
      {
        heading: "4. International transfers",
        paragraphs: [
          "Some of our processors may store or process data outside the United Kingdom. Where that happens, we rely on a UK adequacy regulation for the destination country, or on appropriate safeguards such as the UK International Data Transfer Agreement or the UK Addendum to the EU Standard Contractual Clauses. [OWNER INPUT: confirm processor locations and the transfer mechanism relied on for each, in particular for Stripe and the hosting provider.]",
        ],
      },
      {
        heading: "5. How long we keep data",
        paragraphs: [
          "Account data is kept while your account is open and for [OWNER INPUT: retention period, e.g. 24 months] after it closes, in case you return and to handle residual queries. Billing records are kept for six years after the end of the relevant financial year, as required for UK tax and accounting purposes. Licence validation logs are kept for [OWNER INPUT: retention period, e.g. 12 months] for fraud prevention and diagnostics, then deleted or anonymised. Support correspondence is kept for [OWNER INPUT: retention period, e.g. 24 months] after the matter is closed. Where data is relevant to an ongoing dispute or legal claim, we keep it until the matter is resolved.",
        ],
      },
      {
        heading: "6. Security",
        paragraphs: [
          "We take appropriate technical and organisational measures to protect personal data, including encryption of data in transit, access controls limiting who within the company can access customer data, and the use of established infrastructure providers. No system is perfectly secure, and you are responsible for keeping your account password and licence key confidential.",
          "If a personal data breach occurs that is likely to result in a risk to your rights and freedoms, we will notify the Information Commissioner's Office within the statutory timescale and, where the risk is high, notify you directly.",
        ],
      },
      {
        heading: "7. Your rights",
        paragraphs: [
          "Under the UK GDPR you have the right to: access the personal data we hold about you; have inaccurate data corrected; have data erased where there is no longer a lawful reason to keep it; restrict processing in certain circumstances; object to processing based on legitimate interests; receive the data you provided to us in a portable format; and withdraw consent at any time where processing is based on consent, without affecting processing before the withdrawal.",
          "To exercise any of these rights, contact us at [OWNER INPUT: privacy contact email]. We will respond within one month, and we may need to verify your identity first. Exercising your rights is free of charge except in the limited circumstances where the law permits a fee.",
          "Please note that some data cannot be deleted on request while we have an overriding legal obligation or legitimate ground to keep it, for example billing records we must retain for tax purposes, or validation logs relevant to an active fraud investigation. Where we refuse a request we will explain why.",
        ],
      },
      {
        heading: "8. Marketing communications",
        paragraphs: [
          "We send service messages, such as billing notices, licence and security alerts, and material changes to terms, to all account holders; these are not marketing and you cannot opt out of them while you hold an account. We only send marketing email, such as product news or new content, where the law permits, and every marketing email includes an unsubscribe link. [OWNER INPUT: confirm whether marketing email is sent and on what basis, e.g. soft opt-in for existing customers or explicit consent at signup.]",
        ],
      },
      {
        heading: "9. Children",
        paragraphs: [
          "The Service is for adults. We do not knowingly collect personal data from anyone under 18, and you may not create an account if you are under 18. If we learn that we hold data about a person under 18, we will delete the account and associated data.",
        ],
      },
      {
        heading: "10. Complaints and changes to this policy",
        paragraphs: [
          "If you are unhappy with how we handle your data, please contact us first at [OWNER INPUT: privacy contact email] so we can try to put it right. You also have the right to complain to the Information Commissioner's Office (ICO), the UK supervisory authority, at ico.org.uk or by telephone on 0303 123 1113. If you are in the European Union you may complain to your local supervisory authority.",
          "We may update this policy from time to time. The date at the top shows when it was last revised, and we will notify account holders of material changes by email or through the dashboard.",
        ],
      },
    ],
  },
  {
    slug: "refunds",
    title: "Refund and Cancellation Policy",
    description:
      "How to cancel a Grit Markets subscription, your 14-day cooling-off rights under UK consumer law, and how refunds are handled by Grit Agility Ltd.",
    updated: "2026-07-10",
    sections: [
      {
        heading: "1. Overview",
        paragraphs: [
          "This policy explains how cancellation and refunds work for the Grit Markets monthly subscription sold by Grit Agility Ltd (company SC837399, Scotland). It should be read together with our Terms of Service. Nothing in this policy reduces your statutory rights as a consumer, including under the Consumer Rights Act 2015 and the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013.",
          "One point before anything else: trading losses are not grounds for a refund. Grit Markets is software that automates a high-risk strategy; the outcome of your trading depends on markets, your settings and your broker, and losing money while the software operates as documented is not a fault in the software. We say this plainly here because it is the most common misunderstanding in this market.",
        ],
      },
      {
        heading: "2. Cancelling your subscription",
        paragraphs: [
          "You can cancel at any time from your account dashboard, without giving a reason and without an exit fee. Cancellation stops the next renewal: you keep full access to the software, updates and support until the end of the billing period you have already paid for, and no further charges are taken after that.",
          "If you cannot access your dashboard, email [OWNER INPUT: support email] from the address on your account and we will process the cancellation manually. Cancellation requests are effective from the day we receive them.",
          "When your subscription ends, licence validation stops and the software will no longer open new trades. You are responsible for closing or managing any positions that are open on your broker account at that time; we recommend cancelling only when the EA is flat, or closing open baskets manually before your access ends.",
        ],
      },
      {
        heading: "3. Your 14-day cooling-off right",
        paragraphs: [
          "Under the Consumer Contracts Regulations 2013, consumers buying digital content online normally have 14 days from the date of purchase to cancel and receive a full refund. This cooling-off right applies to your first purchase of a Grit Markets subscription.",
          "There is an important qualification that the law attaches to digital content. Because the software and your licence key are delivered immediately, we ask you at checkout to expressly consent to immediate supply and to acknowledge that, by downloading or activating the software within the 14-day period, you lose the right to cancel that purchase for a refund under the Regulations. This is the standard digital-content waiver in Regulation 37, and we apply it exactly as the law describes: if you have not downloaded or activated the software, your 14-day right remains intact.",
          "To cancel within the cooling-off period, email [OWNER INPUT: support email] or use the dashboard, stating clearly that you wish to cancel. You may use the model cancellation form in the Regulations but you do not have to. Where a cooling-off refund is due, we will refund the full amount paid, without undue delay and in any event within 14 days of your cancellation, to the original payment method.",
        ],
      },
      {
        heading: "4. Refunds for renewals",
        paragraphs: [
          "The statutory cooling-off right applies to the contract, not to each monthly renewal, so renewal payments are not automatically refundable. The right way to avoid an unwanted renewal is to cancel before the billing date, which you can do at any time as described above.",
          "That said, we recognise that people occasionally forget. [OWNER INPUT: refund goodwill policy, e.g. whether a renewal charged within N days before a cancellation request is refunded as a gesture of goodwill, and any conditions such as no software use in the new period.]",
        ],
      },
      {
        heading: "5. Faulty software",
        paragraphs: [
          "Separately from cancellation rights, the Consumer Rights Act 2015 entitles you to digital content that is of satisfactory quality, fit for purpose and as described. If Grit Markets is faulty, for example it fails to validate a correctly bound licence, fails to run on a supported MT5 build, or does not execute the documented strategy according to its settings, contact support and we will repair or replace it. If we cannot fix a genuine fault within a reasonable time, you are entitled to a price reduction, which can be up to the full amount paid for the affected period.",
          "For the avoidance of doubt, the following are not faults: trading losses or drawdowns while the software follows its documented behaviour; the consequences of your chosen settings; broker-side issues such as spreads, slippage, requotes or margin calls; and failures of your computer, VPS or internet connection.",
        ],
      },
      {
        heading: "6. How refunds are paid",
        paragraphs: [
          "All refunds are made to the original payment method, via our payment processor Stripe. We process approved refunds within 14 days at the latest, and usually much sooner; your bank or card issuer may take a few additional days to show the credit. We do not refund in cash, vouchers or to a different card or account, except where the original method no longer exists, in which case we will agree an alternative with you.",
        ],
      },
      {
        heading: "7. Abuse of this policy",
        paragraphs: [
          "We honour the rights described here in full. In return, we reserve the right to refuse goodwill (non-statutory) refunds where we see abuse, such as repeated subscribe-refund cycles, use of refunded periods to run cracked or rebound licences, or chargebacks raised without first contacting us. Raising a card chargeback for a charge you agreed to, instead of using this policy, may result in the account being closed. None of this section limits your statutory rights.",
        ],
      },
      {
        heading: "8. Contact and disputes",
        paragraphs: [
          "Questions about cancellation or refunds: [OWNER INPUT: support email]. If you are unhappy with our answer, you can escalate to [OWNER INPUT: complaints contact], and this policy does not affect your right to bring a claim in court as described in the Terms of Service. UK consumers can also seek free guidance from Citizens Advice.",
        ],
      },
    ],
  },
  {
    slug: "risk",
    title: "Risk Disclosure",
    description:
      "Full risk disclosure for Grit Markets: Martingale drawdown and total-loss risk, leverage, execution risk, no advice, and simulated performance warnings.",
    updated: "2026-07-10",
    sections: [
      {
        heading: "1. Read this before using Grit Markets",
        paragraphs: [
          "Grit Markets is software that automates a Martingale-based trading strategy on leveraged foreign exchange and CFD markets. Trading these markets is high risk for everyone, and the Martingale approach concentrates that risk in a specific way described below. You can lose some or all of the money on the trading account that runs the software. Do not use Grit Markets with money you cannot afford to lose in full.",
          "This document is part of our agreement with you and is written to be read, not skimmed. If anything in it is unclear, contact us before subscribing, or do not subscribe. Grit Agility Ltd would rather lose a sale than take on a customer who has not understood this page.",
        ],
      },
      {
        heading: "2. Martingale risk: the core of this disclosure",
        paragraphs: [
          "A Martingale strategy increases position size after adverse price movement, so that a partial retracement lets the whole basket of positions close at a net profit. The consequence is that exposure compounds while a trade is going wrong: with a size multiplier of two, the tenth recovery level is 512 times the initial position. Most of the time markets retrace and baskets close in profit, which produces long periods of smooth results. Occasionally the market moves persistently in one direction without a sufficient retracement. When that happens, floating losses grow geometrically, and the sequence can consume the entire account balance through an equity stop, a margin call or forced liquidation by the broker.",
          "This is not a rare defect of Martingale systems; it is their defining trade-off. The strategy exchanges frequent small gains for infrequent, very large losses. Sustained one-directional moves occur regularly in real markets, driven by central bank decisions, economic shocks, geopolitical events or ordinary strong trends, and they do not announce themselves in advance.",
          "Grit Markets includes configurable risk controls: a cap on recovery levels, an equity stop that closes all positions at a loss threshold you set, base lot sizing guidance and event filters. Used conservatively, these controls bound the loss from a bad sequence to a large but defined amount. They do not eliminate the risk. An equity stop still realises a real loss when it fires; price can gap through stop levels in fast markets so the realised loss can exceed the configured one; and repeated bounded losses can deplete an account over time. There is no configuration of this software that removes the possibility of losing the entire balance of the account it trades.",
        ],
      },
      {
        heading: "3. Leverage risk",
        paragraphs: [
          "Leveraged trading means you control positions much larger than the cash in your account, so small price movements produce large gains or losses relative to your balance. Leverage magnifies the Martingale effect described above: it allows larger baskets to be held open relative to your equity, which means deeper drawdowns are possible before the broker intervenes. Higher leverage does not reduce the capital a configuration truly needs; it only delays the point at which the broker stops you.",
          "Depending on your broker and jurisdiction, losses can in some circumstances exceed your deposits. UK and EU retail accounts have negative balance protection; accounts elsewhere may not. Check your broker's terms.",
        ],
      },
      {
        heading: "4. Execution, platform and dependency risk",
        paragraphs: [
          "The software's behaviour in live markets depends on systems outside our control. Slippage, widened spreads, requotes, order rejections and broker outages can cause fills at worse prices than the strategy assumes, including on the equity stop. The software only manages positions while your MetaTrader 5 terminal is running and connected: power cuts, computer sleep, VPS failures, internet outages and platform updates all suspend its risk management while positions may remain open. Weekend and news gaps can move price across stop levels without trading in between.",
          "You are responsible for the infrastructure the software runs on and for monitoring it. We recommend, but do not require, a reliable Windows VPS and a daily check-in during the trading week.",
        ],
      },
      {
        heading: "5. No advice, no guarantee, no regulated service",
        paragraphs: [
          "Grit Agility Ltd is a software company. We are not authorised or regulated by the Financial Conduct Authority or any other financial regulator. Nothing on our website, in our documentation, in the software's default settings, or in our support communications constitutes investment advice, a personal recommendation, or a statement that this strategy or any configuration of it is suitable for you.",
          "Grit Markets does not guarantee profits, returns, win rates or any trading outcome, and we make no representation about future performance. Any decision to trade, and every choice of broker, instrument, capital and settings, is yours alone. If you are unsure whether leveraged trading is appropriate for your circumstances, take independent financial advice from a person authorised to give it.",
        ],
      },
      {
        heading: "6. Past and simulated performance",
        paragraphs: [
          "Past performance is not a reliable indicator of future results. This applies with particular force to Martingale strategies, whose historical results tend to look smooth precisely because the strategy defers its losses into rare, large events that a given historical window may not contain.",
          "Where we publish or provide backtest data, it is generated in simulation: simulated results. Backtests do not predict live performance. Backtests assume idealised execution, cannot capture live spreads, slippage and outages, and are exposed to hindsight in parameter selection. The on-site simulator models worst-case arithmetic under your chosen settings; it is a sizing tool, not a forecast. Treat all such material as illustrative only.",
        ],
      },
      {
        heading: "7. Suitability and responsible use",
        paragraphs: [
          "Grit Markets is intended for people who understand leveraged trading and the specific mechanics of Martingale position sizing, accept that the entire balance of the trading account is at risk, and are able to fund that account exclusively with money whose loss would not affect their financial security. It is not suitable as a source of income, as a savings or pension vehicle, or for funds you may need at short notice.",
          "Before trading live, we recommend that you run your configuration through the on-site simulator, operate the software on a demo account until you have observed a full recovery cycle, set the equity stop before the first live trade, and never loosen risk settings while a losing basket is open.",
        ],
      },
      {
        heading: "8. Your acknowledgement",
        paragraphs: [
          "By subscribing to Grit Markets and running the software, you acknowledge that you have read and understood this Risk Disclosure; that the software automates a high-risk Martingale strategy which can produce large drawdowns and the total loss of the balance on the account it trades; that its risk controls bound but do not eliminate that risk; that Grit Agility Ltd provides software only and gives no investment advice and no guarantee of any trading outcome; and that all trading decisions and their consequences are your own responsibility.",
        ],
      },
    ],
  },
];
