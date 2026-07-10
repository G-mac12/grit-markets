/**
 * Static fallback for the WebGL hero: the Martingale ladder motif as SVG.
 * Shown when WebGL is unavailable, on reduced-motion preference, or while
 * the 3D bundle lazy-loads. Ink-on-paper halftone treatment.
 */
export function HeroFallback() {
  const levels = 8;
  const bars = Array.from({ length: levels }, (_, l) => ({
    w: (46 / 2 ** (levels - 1)) * 2 ** l,
    y: 82 - l * 10,
  }));
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-30"
      preserveAspectRatio="xMidYMid meet"
    >
      {bars.map((b, i) => (
        <rect
          key={i}
          x={50 - b.w / 2}
          y={b.y}
          width={b.w}
          height={5}
          fill="#1D35E0"
          opacity={0.18 + (i / levels) * 0.5}
        />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <line
          key={`t${i}`}
          x1={0}
          x2={100}
          y1={4 + i * 2.2}
          y2={4 + i * 2.2}
          stroke="#1D35E0"
          strokeWidth={0.14}
          opacity={0.3}
          strokeDasharray={`${1 + ((i * 7) % 5)} ${2 + ((i * 3) % 4)}`}
        />
      ))}
    </svg>
  );
}
