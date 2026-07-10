import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] flex-col items-center justify-center px-5 pt-20 text-center">
      <svg
        viewBox="0 0 600 160"
        aria-hidden="true"
        className="w-full max-w-xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <line x1="0" y1="130" x2="600" y2="130" stroke="#D9D3C6" strokeWidth="1" />
        {/* equity curve: grinds up, cliff, flatline */}
        <polyline
          points="0,110 40,104 70,108 110,96 150,99 190,88 230,92 260,80 300,84 330,70 355,74 375,60 395,130 600,130"
          fill="none"
          stroke="#1D35E0"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="395" cy="130" r="3.5" fill="#C0332B" />
        <text
          x="420"
          y="122"
          fill="#8F897C"
          fontSize="11"
          fontFamily="var(--font-mono), monospace"
          letterSpacing="2"
        >
          FLAT — 404
        </text>
      </svg>

      <h1 className="mt-10 font-display text-display-md font-medium">
        Position closed.
      </h1>
      <p className="mt-4 max-w-md text-fg-muted">
        Nothing at this price level. The page you requested doesn&apos;t exist —
        or was stopped out.
      </p>
      <Link href="/" className="btn-primary mt-10">
        Return to base lot
      </Link>
    </section>
  );
}
