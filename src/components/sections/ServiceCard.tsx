import Link from "next/link";
import { ArrowUpRight, Cable, Cloud, Compass, Layers, Workflow, type LucideIcon } from "lucide-react";
import type { Service, ServiceIcon as IconName } from "@/content/services";

const icons: Record<IconName, LucideIcon> = {
  pipeline: Workflow,
  cloud: Cloud,
  integration: Cable,
  foundation: Layers,
  leadership: Compass,
};

export function ServiceIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = icons[name];
  return <Icon aria-hidden className={className} strokeWidth={1.5} />;
}

/** Pillar card used on the home page; the whole card links to the service anchor. */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="group relative flex h-full flex-col bg-ink-900 p-6 transition-colors duration-300 hover:bg-ink-850 sm:p-8">
      <div className="flex items-start justify-between">
        <span className="inline-flex size-11 items-center justify-center rounded-md border border-line-strong text-accent-400 transition-colors group-hover:border-accent-500/60">
          <ServiceIcon name={service.icon} className="size-5" />
        </span>
        <span className="font-mono text-xs text-fg-subtle">{service.index}</span>
      </div>
      <h3 className="mt-8 text-xl font-semibold tracking-[-0.01em] text-fg">
        <Link href={`/services/#${service.id}`} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:outline-2 after:focus-visible:outline-accent-400">
          {service.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-fg-muted">{service.summary}</p>
      <span aria-hidden className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent-400">
        Learn more
        <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent-500 transition-transform duration-500 ease-out-quart group-hover:scale-x-100" />
    </article>
  );
}
