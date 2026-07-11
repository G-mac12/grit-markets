import { z } from "zod";

/**
 * Strategy parameter schema + bounds. Server-side validation for every
 * settings change; the same bounds drive the dashboard form.
 * [OWNER INPUT: confirm min/max per parameter and which params are remotely
 *  editable — these bounds are conservative placeholders.]
 */

export const PARAM_BOUNDS = {
  base_lot: { min: 0.01, max: 1.0, step: 0.01, label: "Base lot" },
  lot_multiplier: { min: 1.1, max: 3.0, step: 0.1, label: "Lot multiplier" },
  max_levels: { min: 2, max: 10, step: 1, label: "Max recovery levels" },
  equity_stop_pct: { min: 2, max: 50, step: 0.5, label: "Equity stop %" },
  daily_stop_pct: { min: 1, max: 25, step: 0.5, label: "Daily stop %" },
} as const;

export const strategyParamsSchema = z
  .object({
    base_lot: z
      .number()
      .min(PARAM_BOUNDS.base_lot.min)
      .max(PARAM_BOUNDS.base_lot.max),
    lot_multiplier: z
      .number()
      .min(PARAM_BOUNDS.lot_multiplier.min)
      .max(PARAM_BOUNDS.lot_multiplier.max),
    max_levels: z
      .number()
      .int()
      .min(PARAM_BOUNDS.max_levels.min)
      .max(PARAM_BOUNDS.max_levels.max),
    equity_stop_pct: z
      .number()
      .min(PARAM_BOUNDS.equity_stop_pct.min)
      .max(PARAM_BOUNDS.equity_stop_pct.max),
    daily_stop_pct: z
      .number()
      .min(PARAM_BOUNDS.daily_stop_pct.min)
      .max(PARAM_BOUNDS.daily_stop_pct.max),
    session_filter: z.boolean(),
    news_filter: z.boolean(),
    magic_number: z.number().int().min(1).max(2147483647),
  })
  .strict();

export type StrategyParams = z.infer<typeof strategyParamsSchema>;

export const DEFAULT_PARAMS: StrategyParams = {
  base_lot: 0.01,
  lot_multiplier: 2.0,
  max_levels: 6,
  equity_stop_pct: 8,
  daily_stop_pct: 5,
  session_filter: true,
  news_filter: true,
  magic_number: 260701,
};

/** Total lots committed if a full sequence runs to maxLevels. */
export function worstCaseExposureLots(p: {
  base_lot: number;
  lot_multiplier: number;
  max_levels: number;
}): number {
  let total = 0;
  for (let i = 0; i < p.max_levels; i++)
    total += p.base_lot * Math.pow(p.lot_multiplier, i);
  return total;
}

/**
 * Honest risk deltas between two parameter sets — rendered inline in the
 * settings form ("raising multiplier 1.5→2.0 increases worst-case exposure
 * by ~78%").
 */
export function riskDeltas(
  current: StrategyParams,
  proposed: StrategyParams
): string[] {
  const out: string[] = [];
  const curExp = worstCaseExposureLots(current);
  const propExp = worstCaseExposureLots(proposed);
  if (Math.abs(propExp - curExp) > 1e-9) {
    const pct = ((propExp - curExp) / curExp) * 100;
    out.push(
      `Worst-case sequence exposure ${pct > 0 ? "increases" : "decreases"} ` +
        `${Math.abs(pct).toFixed(0)}% (${curExp.toFixed(2)} → ${propExp.toFixed(2)} lots committed at level ${proposed.max_levels}).`
    );
  }
  if (proposed.equity_stop_pct > current.equity_stop_pct) {
    out.push(
      `Equity stop loosened ${current.equity_stop_pct}% → ${proposed.equity_stop_pct}%: the engine will tolerate deeper account drawdown before flattening.`
    );
  }
  if (proposed.max_levels > current.max_levels) {
    out.push(
      `Max recovery levels raised ${current.max_levels} → ${proposed.max_levels}: rarer but larger worst-case losses.`
    );
  }
  if (!proposed.news_filter && current.news_filter) {
    out.push(
      "News filter disabled: sequences may open into scheduled high-impact events."
    );
  }
  if (!proposed.session_filter && current.session_filter) {
    out.push(
      "Session filter disabled: the engine may trade thin, erratic liquidity outside configured hours."
    );
  }
  return out;
}
