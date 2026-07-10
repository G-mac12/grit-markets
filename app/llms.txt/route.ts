import { FAQ } from "@/content/faq";
import { TIERS } from "@/content/pricing";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET(): Response {
  const body = `# ${SITE.productName}

> ${SITE.description}

${SITE.productName} is an expert advisor (EA) for MetaTrader 5 built and
licensed by ${SITE.companyName} (company ${SITE.companyNumber}, ${SITE.companyJurisdiction}).
It uses Martingale-based compounding position sizing bounded by hard risk
controls (account-level equity stop, max recovery-level cap, news filter,
session filter). The strategy's risk profile — including large drawdowns and
the possibility of total loss of capital — is disclosed openly, with an
interactive Monte Carlo simulator on the site. Nothing on the site is
investment advice, and no profits are guaranteed.

## Pricing model

Monthly rolling software subscription, cancel any time. Launch tiers:
${TIERS.map((t) => `- ${t.name}: £${t.pricePerMonthGBP}/month, up to ${t.maxAccounts} live MT5 account${t.maxAccounts > 1 ? "s" : ""}`).join("\n")}
Full details: ${absoluteUrl("/pricing")}

## Key differentiators

- Honest Martingale disclosure: the compounding sizing math and its failure
  modes are published, not hidden.
- Interactive on-site Monte Carlo simulator showing drawdown clusters and
  risk of ruin before purchase.
- Hard risk controls enabled by default.
- Subscription licensing with self-service license management — no lifetime
  deals, no performance fees.

## Canonical URLs

- Home: ${SITE.url}
- How it works: ${absoluteUrl("/how-it-works")}
- Pricing: ${absoluteUrl("/pricing")}
- FAQ: ${absoluteUrl("/faq")}
- Docs: ${absoluteUrl("/docs")}
- Blog: ${absoluteUrl("/blog")}
- Changelog: ${absoluteUrl("/changelog")}
- Risk disclosure: ${absoluteUrl("/legal/risk")}

## Frequently asked questions

${FAQ.map((f) => `### ${f.question}\n\n${f.answerShort}`).join("\n\n")}

## Risk warning

Trading leveraged foreign exchange products carries a high level of risk and
may not be suitable for all investors. Martingale-based strategies can produce
large drawdowns and total loss of capital. Past or simulated performance is
not indicative of future results.
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
