import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...props} />;
}

export function Section({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("py-20 sm:py-24 lg:py-28", className)} {...props} />;
}

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  id?: string;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({ eyebrow, title, intro, id, as: Heading = "h2", align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Heading
        id={id}
        className={cn(
          "font-semibold tracking-[-0.025em] text-fg",
          eyebrow && "mt-4",
          Heading === "h1" ? "text-4xl leading-[1.05] sm:text-5xl lg:text-6xl" : "text-3xl leading-tight sm:text-4xl",
        )}
      >
        {title}
      </Heading>
      {intro && <div className="mt-5 text-lg leading-relaxed text-fg-muted">{intro}</div>}
    </div>
  );
}

export function Badge({ className, tone = "neutral", ...props }: ComponentProps<"span"> & { tone?: "neutral" | "accent" | "warning" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 font-mono text-[0.68rem] leading-none tracking-[0.08em] uppercase",
        tone === "neutral" && "border-line-strong text-fg-muted",
        tone === "accent" && "border-accent-500/40 bg-accent-500/10 text-accent-300",
        tone === "warning" && "border-warning/40 bg-warning/10 text-warning",
        className,
      )}
      {...props}
    />
  );
}

/** Page intro band used at the top of inner pages. */
export function PageHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="bg-grid mask-radial pointer-events-none absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[28rem] w-[40rem] rounded-full bg-accent-600/15 blur-3xl"
      />
      <Container className="relative pt-16 pb-14 sm:pt-24 sm:pb-20">
        <SectionHeading as="h1" eyebrow={eyebrow} title={title} intro={intro} />
        {children}
      </Container>
    </header>
  );
}
