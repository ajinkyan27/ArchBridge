import { cn } from "@/lib/cn";

/**
 * Hero artwork: scattered source systems on the left converge on a single arc
 * that carries data across to an orderly set of outcomes on the right.
 * Pure SVG, computed at build time. Motion is limited to a slow pulse along
 * the arc and is disabled by prefers-reduced-motion (see globals.css).
 */

const W = 1200;
const DECK = 330;
const ARC = { left: 250, right: 950, rise: 200 };
const cx = (ARC.left + ARC.right) / 2;
const rx = (ARC.right - ARC.left) / 2;

function arcY(x: number) {
  const t = (x - cx) / rx;
  return DECK - ARC.rise * Math.sqrt(Math.max(0, 1 - t * t));
}

const hangers = Array.from({ length: 11 }, (_, i) => ARC.left + 70 + i * 56);

const sources = [
  { x: 54, y: 120, label: "ERP" },
  { x: 128, y: 196, label: "CRM" },
  { x: 40, y: 262, label: "Files" },
  { x: 150, y: 286, label: "APIs" },
  { x: 92, y: 330, label: "Events" },
] as const;

const outcomes = [
  { x: 1120, y: 150, label: "Warehouse" },
  { x: 1120, y: 210, label: "Reporting" },
  { x: 1120, y: 270, label: "Analytics" },
  { x: 1120, y: 330, label: "AI-ready data" },
] as const;

const arcPath = `M${ARC.left} ${DECK} A${rx} ${ARC.rise} 0 0 1 ${ARC.right} ${DECK}`;

function sourcePath(x: number, y: number) {
  const mx = (x + ARC.left) / 2 + 20;
  return `M${x} ${y} C${mx} ${y}, ${mx} ${DECK}, ${ARC.left} ${DECK}`;
}

function outcomePath(x: number, y: number) {
  const mx = (x + ARC.right) / 2 - 20;
  return `M${ARC.right} ${DECK} C${mx} ${DECK}, ${mx} ${y}, ${x - 10} ${y}`;
}

export function BridgeArt({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} 400`} fill="none" aria-hidden className={cn("h-auto w-full", className)}>
      <defs>
        <linearGradient id="arc-stroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--color-accent-500)" />
          <stop offset="0.55" stopColor="var(--color-accent-400)" />
          <stop offset="1" stopColor="var(--color-cyan-400)" />
        </linearGradient>
        <linearGradient id="arc-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-accent-500)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--color-accent-500)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="deck-stroke" x1="0" x2="1">
          <stop offset="0" stopColor="var(--color-line-strong)" stopOpacity="0" />
          <stop offset="0.15" stopColor="var(--color-line-strong)" />
          <stop offset="0.85" stopColor="var(--color-line-strong)" />
          <stop offset="1" stopColor="var(--color-line-strong)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area under the arc */}
      <path d={`${arcPath} Z`} fill="url(#arc-fill)" />

      {/* Deck and ticks */}
      <path d={`M0 ${DECK}H${W}`} stroke="url(#deck-stroke)" strokeWidth="1.5" />
      {Array.from({ length: 25 }, (_, i) => 24 + i * 48).map((x) => (
        <path key={x} d={`M${x} ${DECK + 8}v8`} stroke="var(--color-line-strong)" strokeWidth="1" />
      ))}

      {/* Inbound: messy, varied curves */}
      {sources.map((s) => (
        <path key={s.label} d={sourcePath(s.x, s.y)} stroke="var(--color-line-strong)" strokeWidth="1.25" strokeDasharray="3 5" />
      ))}

      {/* Outbound: orderly fan */}
      {outcomes.map((o) => (
        <path key={o.label} d={outcomePath(o.x, o.y)} stroke="var(--color-accent-500)" strokeOpacity="0.45" strokeWidth="1.25" />
      ))}

      {/* Hangers */}
      {hangers.map((x) => (
        <path key={x} d={`M${x} ${arcY(x).toFixed(1)}V${DECK}`} stroke="var(--color-accent-500)" strokeOpacity="0.28" strokeWidth="1" />
      ))}

      {/* The arc */}
      <path d={arcPath} stroke="url(#arc-stroke)" strokeWidth="3" strokeLinecap="round" />
      <path
        d={arcPath}
        stroke="var(--color-cyan-400)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="10 230"
        className="animate-flow"
      />

      {/* Abutments */}
      <rect x={ARC.left - 9} y={DECK - 9} width="18" height="18" rx="3" fill="var(--color-ink-950)" stroke="var(--color-accent-400)" strokeWidth="1.5" />
      <rect x={ARC.right - 9} y={DECK - 9} width="18" height="18" rx="3" fill="var(--color-accent-500)" />
      <circle cx={cx} cy={DECK - ARC.rise} r="5" fill="var(--color-cyan-400)" className="animate-pulse-node" />

      {/* Source nodes */}
      {sources.map((s) => (
        <g key={s.label}>
          <circle cx={s.x} cy={s.y} r="5" fill="var(--color-ink-950)" stroke="var(--color-fg-subtle)" strokeWidth="1.5" />
          <text x={s.x + 12} y={s.y - 10} className="fill-fg-subtle font-mono text-[15px] max-sm:hidden">
            {s.label}
          </text>
        </g>
      ))}

      {/* Outcome nodes */}
      {outcomes.map((o) => (
        <g key={o.label}>
          <rect x={o.x - 10} y={o.y - 6} width="12" height="12" rx="2" fill="var(--color-accent-500)" fillOpacity="0.9" />
          <text x={o.x - 14} y={o.y - 14} textAnchor="end" className="fill-fg-muted font-mono text-[15px] max-sm:hidden">
            {o.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Small arc used as a divider / accent in CTA panels and cards. */
export function ArcAccent({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 200" fill="none" aria-hidden className={className}>
      {[180, 140, 100, 60].map((r, i) => (
        <path
          key={r}
          d={`M${200 - r} 200 A${r} ${r} 0 0 1 ${200 + r} 200`}
          stroke={i === 0 ? "var(--color-accent-500)" : "var(--color-line-strong)"}
          strokeOpacity={i === 0 ? 0.7 : 0.6}
          strokeWidth={i === 0 ? 1.5 : 1}
        />
      ))}
      <circle cx="20" cy="200" r="4" fill="var(--color-accent-400)" />
      <circle cx="380" cy="200" r="4" fill="var(--color-cyan-400)" />
    </svg>
  );
}
