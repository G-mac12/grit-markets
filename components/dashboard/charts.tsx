/**
 * Server-rendered SVG charts for the dashboard — no chart library, no
 * client JS. Terminal-window styling; honest about sparse data.
 */

const COBALT = "#5E71FF";
const GAIN = "#3DD68C";
const LOSS = "#F0564F";

export function EquityCurve({
  points,
  height = 180,
}: {
  points: { ts: string; equity: number }[];
  height?: number;
}) {
  if (points.length < 2) {
    return (
      <div
        className="flex items-center justify-center border border-term-line bg-term-bg font-mono text-micro uppercase tracking-[0.12em] text-term-faint"
        style={{ height }}
      >
        Waiting for telemetry — the curve draws itself once the EA reports
      </div>
    );
  }
  const w = 720;
  const vals = points.map((p) => p.equity);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = (max - min || 1) * 0.08;
  const y = (v: number) =>
    height - 10 - ((v - (min - pad)) / (max - min + 2 * pad)) * (height - 20);
  const x = (i: number) => (i / (points.length - 1)) * w;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.equity).toFixed(1)}`).join(" ");
  const up = vals[vals.length - 1] >= vals[0];

  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="w-full border border-term-line bg-term-bg"
      role="img"
      aria-label={`Equity curve from ${points[0].ts} to ${points[points.length - 1].ts}`}
      preserveAspectRatio="none"
      style={{ height }}
    >
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={0} x2={w} y1={height * g} y2={height * g} stroke="#262932" strokeWidth={1} />
      ))}
      <path d={path} fill="none" stroke={up ? GAIN : LOSS} strokeWidth={1.75} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Calendar heatmap of daily realized P&L (last ~13 weeks). */
export function PnlHeatmap({
  days,
}: {
  days: { date: string; realized_pl: number }[];
}) {
  const byDate = new Map(days.map((d) => [d.date, Number(d.realized_pl)]));
  const today = new Date();
  const cells: { date: string; v: number | undefined }[] = [];
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 24 * 3600_000);
    const key = d.toISOString().slice(0, 10);
    cells.push({ date: key, v: byDate.get(key) });
  }
  const maxAbs = Math.max(1, ...days.map((d) => Math.abs(Number(d.realized_pl))));
  const cols = Math.ceil(cells.length / 7);
  const size = 14;
  const gap = 3;

  return (
    <svg
      viewBox={`0 0 ${cols * (size + gap)} ${7 * (size + gap)}`}
      className="w-full max-w-xl"
      role="img"
      aria-label="Daily profit and loss calendar for the last 13 weeks"
    >
      {cells.map((c, i) => {
        const col = Math.floor(i / 7);
        const row = i % 7;
        let fill = "#1D2129";
        if (c.v !== undefined) {
          const t = Math.min(1, Math.abs(c.v) / maxAbs);
          fill = c.v >= 0 ? GAIN : LOSS;
          return (
            <rect key={c.date} x={col * (size + gap)} y={row * (size + gap)} width={size} height={size} fill={fill} opacity={0.25 + t * 0.75}>
              <title>{`${c.date}: ${c.v.toFixed(2)}`}</title>
            </rect>
          );
        }
        return (
          <rect key={c.date} x={col * (size + gap)} y={row * (size + gap)} width={size} height={size} fill={fill} />
        );
      })}
    </svg>
  );
}

/** Horizontal histogram (e.g. Martingale sequence-depth distribution). */
export function Histogram({
  buckets,
  accent = COBALT,
}: {
  buckets: { label: string; count: number }[];
  accent?: string;
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <div className="space-y-1.5">
      {buckets.map((b) => (
        <div key={b.label} className="flex items-center gap-3 font-mono text-xs">
          <span className="w-16 shrink-0 text-term-faint">{b.label}</span>
          <div className="h-3 flex-1 bg-term-bg">
            <div
              className="h-3"
              style={{ width: `${(b.count / max) * 100}%`, backgroundColor: accent, opacity: 0.85 }}
            />
          </div>
          <span className="w-10 text-right text-term-muted">{b.count}</span>
        </div>
      ))}
    </div>
  );
}

/** Margin health gauge with colour thresholds. */
export function MarginGauge({ marginLevelPct }: { marginLevelPct: number | null }) {
  if (marginLevelPct == null || marginLevelPct <= 0) {
    return (
      <p className="font-mono text-sm text-term-muted">
        No open positions — margin unused
      </p>
    );
  }
  const capped = Math.min(marginLevelPct, 2000);
  const pct = (capped / 2000) * 100;
  const color = marginLevelPct < 200 ? LOSS : marginLevelPct < 500 ? "#FFB84D" : GAIN;
  return (
    <div>
      <div className="flex justify-between font-mono text-xs text-term-faint">
        <span>margin level</span>
        <span style={{ color }}>{marginLevelPct.toFixed(0)}%</span>
      </div>
      <div className="mt-1 h-2 w-full bg-term-bg">
        <div className="h-2" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <p className="mt-1 font-mono text-micro uppercase tracking-[0.1em] text-term-faint">
        {"<"}200% danger · {"<"}500% caution · above is comfortable
      </p>
    </div>
  );
}
