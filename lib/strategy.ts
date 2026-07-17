import { z } from "zod";

/**
 * Strategy parameter schema + bounds — matched to the real
 * GritAgilityMartingale EA inputs (EURUSD M1 geometric-ladder scalper).
 * Server-side validation for every settings change; the same bounds drive
 * the dashboard form. Bounds follow the EA's own validated input ranges.
 */

export const PARAM_BOUNDS = {
  base_lot: { min: 0.01, max: 0.1, step: 0.01, label: "Base lot (first leg)" },
  lot_multiplier: { min: 1.05, max: 2.0, step: 0.01, label: "Lot multiplier per leg" },
  max_legs: { min: 5, max: 210, step: 1, label: "Max legs per basket" },
  take_profit_points: { min: 10, max: 260, step: 1, label: "Basket take-profit (points)" },
  grid_step_points: { min: 5, max: 100, step: 1, label: "Grid step (points)" },
  equity_stop_pct: { min: 0.5, max: 50, step: 0.5, label: "Equity stop %" },
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
    max_legs: z
      .number()
      .int()
      .min(PARAM_BOUNDS.max_legs.min)
      .max(PARAM_BOUNDS.max_legs.max),
    take_profit_points: z
      .number()
      .int()
      .min(PARAM_BOUNDS.take_profit_points.min)
      .max(PARAM_BOUNDS.take_profit_points.max),
    grid_step_points: z
      .number()
      .int()
      .min(PARAM_BOUNDS.grid_step_points.min)
      .max(PARAM_BOUNDS.grid_step_points.max),
    use_equity_stop: z.boolean(),
    equity_stop_pct: z
      .number()
      .min(PARAM_BOUNDS.equity_stop_pct.min)
      .max(PARAM_BOUNDS.equity_stop_pct.max),
    news_filter: z.boolean(),
  })
  .strict();

export type StrategyParams = z.infer<typeof strategyParamsSchema>;

/** Matches the EA's shipped .set values (equity stop ON here — the
 *  dashboard defaults deliberately do NOT reproduce the legacy no-stop
 *  configuration). */
export const DEFAULT_PARAMS: StrategyParams = {
  base_lot: 0.01,
  lot_multiplier: 1.21,
  max_legs: 21,
  take_profit_points: 34,
  grid_step_points: 21,
  use_equity_stop: true,
  equity_stop_pct: 20,
  news_filter: true,
};

/** Total lots committed if a full basket runs to maxLegs. */
export function worstCaseExposureLots(p: {
  base_lot: number;
  lot_multiplier: number;
  max_legs: number;
}): number {
  let total = 0;
  for (let i = 0; i < p.max_legs; i++)
    total += p.base_lot * Math.pow(p.lot_multiplier, i);
  return total;
}

/**
 * Risk profiles (constraint 6): raw parameters live server-side only.
 * Customers choose a profile; these abstractions are all the client ever
 * sees. Descriptors are computed server-side from the raw params relative
 * to the Balanced (published, shipped) configuration.
 */
export interface RiskProfileRow {
  key: string;
  label: string;
  description: string;
  params: StrategyParams;
  sort: number;
}

export interface AbstractProfile {
  key: string;
  label: string;
  description: string;
  /** Equity stop is a safety disclosure, not strategy IP — always shown. */
  equityStopPct: number;
  /** Worst-case committed exposure relative to Balanced (1 = same). */
  exposureVsBalanced: number;
  depth: "shallower" | "default" | "deeper";
  spacing: "wider" | "default" | "tighter";
}

export function abstractProfiles(rows: RiskProfileRow[]): AbstractProfile[] {
  const balanced = rows.find((r) => r.key === "balanced") ?? rows[0];
  const balExp = worstCaseExposureLots({
    ...balanced.params,
    max_legs: Math.min(balanced.params.max_legs, 30),
  });
  return [...rows]
    .sort((a, b) => a.sort - b.sort)
    .map((r) => {
      const exp = worstCaseExposureLots({
        ...r.params,
        max_legs: Math.min(r.params.max_legs, 30),
      });
      return {
        key: r.key,
        label: r.label,
        description: r.description,
        equityStopPct: r.params.equity_stop_pct,
        exposureVsBalanced: balExp > 0 ? exp / balExp : 1,
        depth:
          r.params.max_legs === balanced.params.max_legs
            ? "default"
            : r.params.max_legs < balanced.params.max_legs
              ? "shallower"
              : "deeper",
        spacing:
          r.params.grid_step_points === balanced.params.grid_step_points
            ? "default"
            : r.params.grid_step_points > balanced.params.grid_step_points
              ? "wider"
              : "tighter",
      };
    });
}

/**
 * Honest risk deltas between two parameter sets — rendered inline in the
 * settings form before a change is submitted.
 */
export function riskDeltas(
  current: StrategyParams,
  proposed: StrategyParams
): string[] {
  const out: string[] = [];
  const curExp = worstCaseExposureLots({ ...current, max_legs: Math.min(current.max_legs, 30) });
  const propExp = worstCaseExposureLots({ ...proposed, max_legs: Math.min(proposed.max_legs, 30) });
  if (Math.abs(propExp - curExp) > 1e-9) {
    const pct = ((propExp - curExp) / curExp) * 100;
    out.push(
      `Committed exposure by leg ${Math.min(proposed.max_legs, 30)} ${pct > 0 ? "increases" : "decreases"} ` +
        `${Math.abs(pct).toFixed(0)}% (${curExp.toFixed(2)} → ${propExp.toFixed(2)} lots).`
    );
  }
  if (proposed.max_legs > 30) {
    out.push(
      `Max legs ${proposed.max_legs}: at ×${proposed.lot_multiplier} this is effectively an uncapped ladder — the equity stop becomes your only hard limit.`
    );
  }
  if (!proposed.use_equity_stop) {
    out.push(
      "Equity stop DISABLED: nothing force-closes a losing basket. This is the configuration that historically left baskets stuck open for weeks and can lose the entire account."
    );
  } else if (proposed.equity_stop_pct > current.equity_stop_pct) {
    out.push(
      `Equity stop loosened ${current.equity_stop_pct}% → ${proposed.equity_stop_pct}%: deeper account drawdown tolerated before flattening.`
    );
  }
  if (proposed.grid_step_points < current.grid_step_points) {
    out.push(
      `Grid step tightened ${current.grid_step_points} → ${proposed.grid_step_points} points: legs stack faster in an adverse move, deepening baskets sooner.`
    );
  }
  if (!proposed.news_filter && current.news_filter) {
    out.push(
      "News filter disabled: baskets may open and stack straight through rate decisions and NFP."
    );
  }
  return out;
}
