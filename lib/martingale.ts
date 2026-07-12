/**
 * Monte Carlo model of a Martingale grid basket — calibrated to the real
 * engine's geometry: a first leg at base lot, further legs added every
 * GRID_PIPS of adverse movement at ×multiplier size, the whole basket
 * closing together at TP_PIPS beyond its average entry.
 *
 * Honesty notes baked into the model:
 *  - Adverse moves are given persistence (each failed step raises the odds
 *    the next fails too) because real trends run — an independent-odds model
 *    flatters deep ladders and hides exactly the tail risk that matters.
 *  - A basket that reaches max legs is closed at the full distance-weighted
 *    loss. This is what the equity stop realises in live trading.
 *
 * It exists so a visitor SEES the drawdown clusters before they pay.
 * It is not a backtest and it does not predict live performance.
 */

export interface SimParams {
  startBalance: number;
  baseLot: number;
  multiplier: number;
  maxLevels: number;
  winRate: number; // 0..1 — chance a basket resolves at each step
  cycles: number;
  runs: number;
}

export interface SimResult {
  p10: number[];
  p50: number[];
  p90: number[];
  /** A single representative bad run (10th-percentile terminal equity). */
  sample: number[];
  ruinPct: number;
  medianMaxDrawdownPct: number;
}

const PIP_VALUE = 10; // per 1.0 lot, USD account
const TP_PIPS = 3.4; // basket take-profit beyond average entry (34 points)
const GRID_PIPS = 2.1; // adverse move between legs (21 points)
const TREND_PERSISTENCE = 1.18; // failed-step odds grow as a move runs
const MAX_FAIL_PROB = 0.92;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function simulate(params: SimParams, seed = 1337): SimResult {
  const { startBalance, baseLot, multiplier, maxLevels, winRate, cycles, runs } =
    params;
  const rnd = mulberry32(seed);

  // precompute leg lots
  const lots: number[] = [];
  for (let i = 0; i < maxLevels; i++)
    lots.push(baseLot * Math.pow(multiplier, i));

  const paths: Float64Array[] = [];
  const maxDDs: number[] = [];
  let ruined = 0;

  for (let r = 0; r < runs; r++) {
    const path = new Float64Array(cycles + 1);
    let equity = startBalance;
    path[0] = equity;
    let peak = equity;
    let maxDD = 0;
    let dead = false;

    for (let c = 1; c <= cycles; c++) {
      if (!dead) {
        let depth = 0;
        let failProb = 1 - winRate;
        let resolved = false;
        while (depth < maxLevels) {
          if (rnd() >= failProb) {
            // basket resolves: all open legs close at avg entry + TP
            let totalLots = 0;
            for (let i = 0; i <= depth; i++) totalLots += lots[i];
            equity += totalLots * TP_PIPS * PIP_VALUE;
            resolved = true;
            break;
          }
          depth++;
          failProb = Math.min(MAX_FAIL_PROB, failProb * TREND_PERSISTENCE);
        }
        if (!resolved) {
          // bust at max legs: leg i sits (maxLevels - i) grid steps offside
          let loss = 0;
          for (let i = 0; i < maxLevels; i++)
            loss += lots[i] * (maxLevels - i) * GRID_PIPS * PIP_VALUE;
          equity -= loss;
        }
        if (equity <= 0) {
          equity = 0;
          dead = true;
        }
        peak = Math.max(peak, equity);
        if (peak > 0) maxDD = Math.max(maxDD, ((peak - equity) / peak) * 100);
      }
      path[c] = equity;
    }

    if (dead) ruined++;
    maxDDs.push(maxDD);
    paths.push(path);
  }

  const p10: number[] = [];
  const p50: number[] = [];
  const p90: number[] = [];
  const col = new Float64Array(runs);
  for (let c = 0; c <= cycles; c++) {
    for (let r = 0; r < runs; r++) col[r] = paths[r][c];
    const sorted = Array.from(col).sort((a, b) => a - b);
    p10.push(sorted[Math.floor(runs * 0.1)]);
    p50.push(sorted[Math.floor(runs * 0.5)]);
    p90.push(sorted[Math.floor(runs * 0.9)]);
  }

  const byTerminal = paths
    .map((p, i) => ({ i, terminal: p[cycles] }))
    .sort((a, b) => a.terminal - b.terminal);
  const sampleIdx = byTerminal[Math.floor(runs * 0.1)].i;

  maxDDs.sort((a, b) => a - b);

  return {
    p10,
    p50,
    p90,
    sample: Array.from(paths[sampleIdx]),
    ruinPct: (ruined / runs) * 100,
    medianMaxDrawdownPct: maxDDs[Math.floor(maxDDs.length / 2)],
  };
}
