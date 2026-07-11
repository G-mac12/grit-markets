import { getDashboardContext, fmtMoney, fmtSigned } from "@/lib/account-data";
import { getStripe } from "@/lib/stripe";
import { TIERS } from "@/content/pricing";

export const dynamic = "force-dynamic";

export default async function CostsPage() {
  const { supabase, link } = await getDashboardContext();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, status, stripe_customer_id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const tier = TIERS.find((t) => t.id === sub?.tier);
  const monthlySubGBP = tier?.pricePerMonthGBP ?? null;

  let invoices: { id: string; date: string; amount: string; url: string | null }[] = [];
  if (sub && process.env.STRIPE_SECRET_KEY) {
    try {
      const list = await getStripe().invoices.list({
        customer: sub.stripe_customer_id,
        limit: 6,
      });
      invoices = list.data.map((inv) => ({
        id: inv.id,
        date: new Date(inv.created * 1000).toLocaleDateString("en-GB"),
        amount: new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: inv.currency.toUpperCase(),
        }).format((inv.amount_paid || inv.amount_due) / 100),
        url: inv.hosted_invoice_url ?? null,
      }));
    } catch {
      // non-critical
    }
  }

  let tradingBlock: React.ReactNode = (
    <p className="font-mono text-xs text-term-faint">
      Trading-cost analytics unlock once an account reports telemetry.
    </p>
  );

  if (link) {
    const ccy = link.account_currency;
    const since30 = new Date(Date.now() - 30 * 24 * 3600_000).toISOString();
    const [{ data: t30 }, { data: firstSnap }] = await Promise.all([
      supabase
        .from("trades")
        .select("profit, commission, swap")
        .eq("account_link_id", link.id)
        .gte("close_time", since30),
      supabase
        .from("telemetry_snapshots")
        .select("balance")
        .eq("account_link_id", link.id)
        .gte("ts", since30)
        .order("ts", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    const gross = (t30 ?? []).reduce((a, t) => a + Number(t.profit), 0);
    const commissions = (t30 ?? []).reduce((a, t) => a + Number(t.commission), 0);
    const swaps = (t30 ?? []).reduce((a, t) => a + Number(t.swap), 0);
    const netTrading = gross + commissions + swaps;
    const baseBalance = firstSnap ? Number(firstSnap.balance) : null;
    const roi =
      baseBalance && baseBalance > 0 ? (netTrading / baseBalance) * 100 : null;

    tradingBlock = (
      <>
        <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { l: "Gross trading P/L (30d)", v: fmtSigned(gross, ccy), neg: gross < 0 },
            { l: "Commissions (30d)", v: fmtSigned(commissions, ccy), neg: true },
            { l: "Swaps (30d)", v: fmtSigned(swaps, ccy), neg: swaps < 0 },
            { l: "Net trading P/L (30d)", v: fmtSigned(netTrading, ccy), neg: netTrading < 0 },
          ].map((c) => (
            <div key={c.l}>
              <dt className="label-micro text-term-faint">{c.l}</dt>
              <dd className={`mt-1 font-mono text-lg ${c.neg ? "text-loss-bright" : "text-gain-bright"}`}>
                {c.v}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 border-t border-term-line pt-5">
          <p className="label-micro text-term-faint">
            The true all-in number (30 days)
          </p>
          <p className="mt-2 font-mono text-2xl text-term-fg">
            {fmtSigned(netTrading, ccy)}
            <span className="text-sm text-term-faint">
              {" "}
              trading net{monthlySubGBP != null ? ` − £${monthlySubGBP} subscription` : ""}
              {roi != null ? ` · ${roi >= 0 ? "+" : ""}${roi.toFixed(2)}% on opening balance` : ""}
            </span>
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-term-muted">
            Gross profit minus commissions, swaps and your subscription — the
            number most services never show. Subscription is billed in GBP;
            trading figures are in your account currency, so the total is
            presented side by side rather than falsely converted. Past
            figures do not predict future results.
          </p>
        </div>
      </>
    );
  }

  return (
    <section>
      <h1 className="font-display text-display-md font-medium">Costs &amp; True ROI.</h1>

      <div className="term-panel mt-8 p-5 md:p-6">{tradingBlock}</div>

      <div className="term-panel mt-8 p-5 md:p-6">
        <p className="label-micro mb-4 text-term-faint">
          Subscription — {tier ? `${tier.name} · £${tier.pricePerMonthGBP}/month` : "none active"}
        </p>
        {invoices.length > 0 ? (
          <table className="w-full max-w-xl font-mono text-xs">
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-term-line/40 text-term-muted">
                  <td className="py-2 pr-4">{inv.date}</td>
                  <td className="py-2 pr-4 text-right">{inv.amount}</td>
                  <td className="py-2 text-right">
                    {inv.url && (
                      <a href={inv.url} target="_blank" rel="noopener noreferrer" className="text-accent-bright underline-offset-4 hover:underline">
                        view
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="font-mono text-xs text-term-faint">No invoices yet.</p>
        )}
      </div>
    </section>
  );
}
