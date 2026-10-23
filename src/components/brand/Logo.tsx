import { cn } from "@/lib/cn";

/**
 * Arcbridge mark: an arc spanning two system nodes, with hangers down to the
 * deck. Reads at 16px and scales cleanly. Colours come from design tokens.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M2.5 24.5h27" stroke="var(--color-fg)" strokeWidth="2" strokeLinecap="round" />
      <path d="M11 24.5v-9.6M16 24.5V13.6M21 24.5v-9.6" stroke="var(--color-fg-subtle)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 24.5a11 11 0 0 1 22 0" stroke="var(--color-accent-500)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="5" cy="24.5" r="2.6" fill="var(--color-ink-950)" stroke="var(--color-accent-400)" strokeWidth="1.6" />
      <circle cx="27" cy="24.5" r="2.6" fill="var(--color-accent-400)" />
      <circle cx="16" cy="13.5" r="1.6" fill="var(--color-cyan-400)" />
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-8" />
      <span className={cn("leading-none", compact && "max-[360px]:sr-only")}>
        <span className="block text-[1.05rem] font-semibold tracking-[-0.01em] text-fg">Arcbridge</span>
        <span className="mt-1 block font-mono text-[0.62rem] tracking-[0.28em] text-fg-muted uppercase">
          Analytics
        </span>
      </span>
    </span>
  );
}
