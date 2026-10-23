import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CaseStudy } from "@/content/case-studies";
import { Badge } from "@/components/ui/Layout";

export function CaseStudyKindBadge({ kind }: { kind: CaseStudy["kind"] }) {
  return kind === "demonstration" ? (
    <Badge tone="warning">Illustrative demonstration project</Badge>
  ) : (
    <Badge tone="accent">Client project</Badge>
  );
}

export function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-ink-900 transition-colors duration-300 hover:border-line-strong">
      <MiniFlow stages={study.dataFlow.length} seed={index} />
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <CaseStudyKindBadge kind={study.kind} />
        <h3 className="mt-5 text-xl font-semibold tracking-[-0.01em] text-fg">
          <Link
            href={`/case-studies/${study.slug}/`}
            className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:-outline-offset-2 after:focus-visible:outline-accent-400"
          >
            {study.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-fg-muted">{study.summary}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label="Technologies">
          {study.technologies.slice(0, 4).map((t) => (
            <li key={t} className="rounded-sm bg-ink-800 px-2 py-1 font-mono text-[0.7rem] text-fg-muted">
              {t}
            </li>
          ))}
        </ul>
        <span aria-hidden className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent-400">
          Read the walkthrough
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}

/** Decorative header strip: a small pipeline of stages joined by arcs. */
function MiniFlow({ stages, seed }: { stages: number; seed: number }) {
  const w = 360;
  const step = (w - 40) / (stages - 1);
  const xs = Array.from({ length: stages }, (_, i) => 20 + i * step);
  return (
    <div className="relative h-24 border-b border-line bg-ink-850">
      <div aria-hidden className="bg-grid absolute inset-0 opacity-40" />
      <svg viewBox={`0 0 ${w} 96`} preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
        {xs.slice(0, -1).map((x, i) => {
          const h = 22 + ((i + seed) % 3) * 9;
          return (
            <path
              key={x}
              d={`M${x} 66 Q${x + step / 2} ${66 - h * 2} ${x + step} 66`}
              stroke={i === stages - 2 ? "var(--color-cyan-400)" : "var(--color-accent-500)"}
              strokeOpacity={0.35 + i * 0.15}
              strokeWidth="1.5"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        <path d={`M8 66H${w - 8}`} stroke="var(--color-line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      {xs.map((x, i) => (
        <span
          key={x}
          aria-hidden
          className="absolute top-[66px] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400 transition-transform duration-300 group-hover:scale-125"
          style={{ left: `${(x / w) * 100}%`, opacity: 0.45 + (i / stages) * 0.55 }}
        />
      ))}
    </div>
  );
}
