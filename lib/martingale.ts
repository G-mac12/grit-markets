/**
 * Monte Carlo model of a Martingale recovery sequence.
 *
 * Deliberately simple and deliberately honest: fixed 20-pip target and stop,
 * £10 pip value per 1.0 lot, independent trade outcomes at the configured
 * win rate. It exists so a visitor can SEE the drawdown clusters Martingale
 * produces before they pay for the software. It is not a backtest and it
 * does not predict live performance.
 */

export interface SimParams {
  startBalance: number;
  baseLot: number;
  multiplier: number;
  maxLevels: number;
  winRate: number; // 0..1 per attempt
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

const PIP_VALUE = 10; // per 1.0 lot
const TP_PIPS = 20;
const SL_PIPS = 20;

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
        let priorLosses = 0;
        for (let level = 0; level < maxLevels; level++) {
          const lot = baseLot * Math.pow(multiplier, level);
          if (rnd() < winRate) {
            equity += lot * TP_PIPS * PIP_VALUE - priorLosses;
            priorLosses = -1; // sentinel: sequence closed on a win
            break;
          }
          priorLosses += lot * SL_PIPS * PIP_VALUE;
        }
        if (priorLosses >= 0) equity -= priorLosses; // sequence busted at max level
        if (equity <= 0) {
          equity = 0;
          dead = true;
        }
        peak = Math.max(peak, equity);
        if (peak > 0) maxDD = Math.max(maxDD, (peak - equity) / peak);
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
    medianMaxDrawdownPct: maxDDs[Math.floor(runs / 2)] * 100,
  };
}
