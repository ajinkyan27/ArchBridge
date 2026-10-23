import { cn } from "@/lib/cn";

type Step = { title: string; body: string };

/**
 * Ordered steps joined by a connecting line. Horizontal from lg up, vertical
 * on smaller screens. Rendered as an ordered list for assistive technology.
 */
export function ProcessTrack({ steps, className }: { steps: readonly Step[]; className?: string }) {
  const cols = steps.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-5";
  return (
    <ol className={cn("relative grid gap-10 lg:gap-8", cols, className)}>
      <span aria-hidden className="absolute top-2 bottom-2 left-[7px] w-px bg-gradient-to-b from-accent-500 via-line-strong to-transparent lg:top-[7px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-px lg:w-auto lg:bg-gradient-to-r" />
      {steps.map((step, i) => (
        <li key={step.title} className="relative pl-10 lg:pt-12 lg:pl-0">
          <span
            aria-hidden
            className={cn(
              "absolute top-0 left-0 size-[15px] rounded-full border-2",
              i === 0 ? "border-accent-400 bg-accent-500" : "border-accent-500/70 bg-ink-950",
            )}
          />
          <p className="font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">Step {String(i + 1).padStart(2, "0")}</p>
          <h3 className="mt-2 text-lg font-semibold text-fg">{step.title}</h3>
          <p className="mt-2 max-w-sm text-[0.95rem] leading-relaxed text-fg-muted">{step.body}</p>
        </li>
      ))}
    </ol>
  );
}
