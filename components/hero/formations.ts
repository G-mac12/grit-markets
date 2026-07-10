/**
 * Deterministic particle formations for the hero ("The Tape").
 *
 * Three named states, K95 Rings/Spiral-style:
 *  - flow:      streaming price tape (animated lanes)
 *  - structure: particles assemble into a candlestick chart
 *  - engine:    the Martingale position-sizing ladder — step widths double
 *               per level, deliberately un-softened. The geometry IS the
 *               risk disclosure.
 *
 * Everything is seeded so the field is identical on every load.
 */

export const PARTICLE_COUNT = 6000;
export type FormationKind = "flow" | "structure" | "engine";
export const FORMATIONS: FormationKind[] = ["flow", "structure", "engine"];

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

const FLOW_WIDTH = 15;
const FLOW_LANES = 26;

export interface FormationData {
  /** static targets for structure + engine */
  structure: Float32Array;
  engine: Float32Array;
  /** flow lane parameters per particle */
  flowBaseX: Float32Array;
  flowY: Float32Array;
  flowZ: Float32Array;
  flowSpeed: Float32Array;
  flowPhase: Float32Array;
  /** per-particle random in [0,1] for size variance */
  rand: Float32Array;
}

export function buildFormations(): FormationData {
  const rnd = mulberry32(20260710);
  const n = PARTICLE_COUNT;

  const structure = new Float32Array(n * 3);
  const engine = new Float32Array(n * 3);
  const flowBaseX = new Float32Array(n);
  const flowY = new Float32Array(n);
  const flowZ = new Float32Array(n);
  const flowSpeed = new Float32Array(n);
  const flowPhase = new Float32Array(n);
  const rand = new Float32Array(n);

  // ---- flow: horizontal tape lanes, alternating direction, depth spread
  for (let i = 0; i < n; i++) {
    const lane = i % FLOW_LANES;
    const dir = lane % 2 === 0 ? 1 : -1;
    flowBaseX[i] = (rnd() - 0.5) * FLOW_WIDTH;
    flowY[i] = ((lane / (FLOW_LANES - 1)) - 0.5) * 6.4 + (rnd() - 0.5) * 0.12;
    flowZ[i] = (rnd() - 0.5) * 3.5;
    flowSpeed[i] = dir * (0.25 + rnd() * 0.9) * (1 - Math.abs(flowY[i]) / 8);
    flowPhase[i] = rnd() * Math.PI * 2;
    rand[i] = rnd();
  }

  // ---- structure: 42-candle seeded random walk, OHLC bodies + wicks
  const candles = 42;
  const walk = mulberry32(99131);
  let price = 0;
  const ohlc: { o: number; h: number; l: number; c: number }[] = [];
  for (let c = 0; c < candles; c++) {
    const o = price;
    const drift = (walk() - 0.48) * 0.9;
    const cl = o + drift;
    const h = Math.max(o, cl) + walk() * 0.45;
    const l = Math.min(o, cl) - walk() * 0.45;
    ohlc.push({ o, h, l, c: cl });
    price = cl;
  }
  // normalise price range to y ∈ [-2.6, 2.6]
  let pMin = Infinity;
  let pMax = -Infinity;
  for (const k of ohlc) {
    pMin = Math.min(pMin, k.l);
    pMax = Math.max(pMax, k.h);
  }
  const toY = (p: number) => ((p - pMin) / (pMax - pMin) - 0.5) * 5.2;
  const chartW = 12.4;
  const candleW = (chartW / candles) * 0.62;
  const sRnd = mulberry32(4451);
  for (let i = 0; i < n; i++) {
    const c = i % candles;
    const k = ohlc[c];
    const cx = (c / (candles - 1) - 0.5) * chartW;
    const inBody = sRnd() < 0.72;
    let x: number;
    let y: number;
    if (inBody) {
      const top = toY(Math.max(k.o, k.c));
      const bot = toY(Math.min(k.o, k.c));
      x = cx + (sRnd() - 0.5) * candleW;
      y = bot + sRnd() * Math.max(top - bot, 0.06);
    } else {
      x = cx + (sRnd() - 0.5) * candleW * 0.16;
      y = toY(k.l) + sRnd() * (toY(k.h) - toY(k.l));
    }
    structure[i * 3] = x;
    structure[i * 3 + 1] = y;
    structure[i * 3 + 2] = (sRnd() - 0.5) * 0.5;
  }

  // ---- engine: the Martingale ladder. Widths double per level — honest
  // exponential geometry, level 8 dwarfs level 1 on purpose.
  const levels = 8;
  const eRnd = mulberry32(7703);
  const widths: number[] = [];
  for (let l = 0; l < levels; l++) widths.push((9.6 / 2 ** (levels - 1)) * 2 ** l);
  const totalW = widths.reduce((a, b) => a + b, 0);
  // proportional particle allocation with a floor so early levels stay visible
  const floor = 90;
  const remaining = n - floor * levels;
  const counts = widths.map((w) => floor + Math.floor((w / totalW) * remaining));
  counts[levels - 1] += n - counts.reduce((a, b) => a + b, 0);
  const barH = 0.4;
  const gap = 0.26;
  const ladderCx = 1.4; // sit right-of-centre, clear of the headline column
  let idx = 0;
  for (let l = 0; l < levels; l++) {
    const y0 = -2.9 + l * (barH + gap);
    const w = widths[l];
    for (let j = 0; j < counts[l] && idx < n; j++, idx++) {
      engine[idx * 3] = ladderCx - w / 2 + eRnd() * w;
      engine[idx * 3 + 1] = y0 + eRnd() * barH;
      engine[idx * 3 + 2] = (eRnd() - 0.5) * 0.6;
    }
  }

  return { structure, engine, flowBaseX, flowY, flowZ, flowSpeed, flowPhase, rand };
}

/** Write formation positions at time t into out (Float32Array of n*3). */
export function writeFormation(
  kind: FormationKind,
  data: FormationData,
  t: number,
  out: Float32Array
): void {
  const n = PARTICLE_COUNT;
  if (kind === "flow") {
    const half = FLOW_WIDTH / 2;
    for (let i = 0; i < n; i++) {
      let x = data.flowBaseX[i] + data.flowSpeed[i] * t;
      x = ((((x + half) % FLOW_WIDTH) + FLOW_WIDTH) % FLOW_WIDTH) - half;
      out[i * 3] = x;
      out[i * 3 + 1] =
        data.flowY[i] + Math.sin(t * 0.7 + data.flowPhase[i]) * 0.05;
      out[i * 3 + 2] = data.flowZ[i];
    }
    return;
  }
  const src = kind === "structure" ? data.structure : data.engine;
  const breathe = kind === "engine" ? 1 + Math.sin(t * 0.9) * 0.006 : 1;
  for (let i = 0; i < n; i++) {
    out[i * 3] = src[i * 3] * breathe;
    out[i * 3 + 1] = src[i * 3 + 1] * breathe;
    out[i * 3 + 2] = src[i * 3 + 2];
  }
}
