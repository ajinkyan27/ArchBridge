import { approach, collaboration, founder, principles, purpose, type FounderField } from "@/content/about";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";
import { LogoMark } from "@/components/brand/Logo";
import { Badge, Container, PageHeader, Section, SectionHeading } from "@/components/ui/Layout";
import { CtaPanel } from "@/components/sections/CtaPanel";

export const metadata = pageMetadata({
  title: "About",
  description:
    "Arcbridge Analytics is a specialist, engineering-led data consultancy focused on reliable data foundations, maintainable solutions and practical delivery.",
  path: "/about/",
});

function Placeholder({ field, className }: { field: FounderField; className?: string }) {
  return (
    <span className={cn(field.placeholder && "rounded-sm bg-warning/10 px-1 text-warning outline-1 outline-warning/30 outline-dashed", className)}>
      {field.value}
    </span>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="An engineering-led consultancy for data that has to be right." intro={purpose.paragraphs[0]} />

      <Section aria-labelledby="purpose-title">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading id="purpose-title" eyebrow="Purpose" title={purpose.title} />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-fg-muted lg:col-span-6 lg:col-start-7">
            {purpose.paragraphs.slice(1).map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p>
              Reliable data foundations come first. Advanced analytics and AI can only be as dependable as the pipelines, models and
              governance underneath them, so that is where we start.
            </p>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="approach-title" className="border-y border-line bg-ink-900/40">
        <Container>
          <SectionHeading id="approach-title" eyebrow="Approach" title="How we think about the work." />
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
            {approach.map((a, i) => (
              <div key={a.title} className="bg-ink-900 p-6 sm:p-8">
                <span className="font-mono text-xs text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-xl font-semibold text-fg">{a.title}</h3>
                <p className="mt-3 leading-relaxed text-fg-muted">{a.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="principles-title">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading id="principles-title" eyebrow="Principles" title="What you can expect from us." />
          </div>
          <dl className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
            {principles.map((p) => (
              <div key={p.title} className="border-t border-line py-6">
                <dt className="flex items-center gap-3 text-lg font-semibold text-fg">
                  <span aria-hidden className="size-1.5 rounded-full bg-cyan-400" />
                  {p.title}
                </dt>
                <dd className="mt-2 leading-relaxed text-fg-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section aria-labelledby="collab-title" className="border-t border-line bg-ink-900/40">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading id="collab-title" eyebrow="Collaboration" title={collaboration.title} intro={collaboration.body} />
          </div>
          <ul className="space-y-3 self-end lg:col-span-5 lg:col-start-8">
            {collaboration.points.map((p) => (
              <li key={p} className="flex gap-4 rounded-md border border-line bg-ink-900 p-4 text-fg">
                <span aria-hidden className="mt-2.5 h-px w-5 shrink-0 bg-accent-400" />
                {p}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {founder.show && (
        <Section aria-labelledby="founder-title" className="border-t border-line">
          <Container>
            <div className="grid gap-10 overflow-hidden rounded-lg border border-line bg-ink-900 lg:grid-cols-12">
              <div className="relative flex min-h-56 items-center justify-center border-b border-line bg-ink-850 lg:col-span-4 lg:border-r lg:border-b-0">
                <div aria-hidden className="bg-grid absolute inset-0 opacity-50" />
                {/* Replace with an approved portrait (e.g. /public/images/founder.jpg) and a descriptive alt text. */}
                <LogoMark className="relative size-24 opacity-80" />
              </div>
              <div className="p-6 sm:p-10 lg:col-span-8 lg:pl-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="eyebrow">Founder</p>
                  {[founder.name, founder.role, ...founder.bio, ...founder.focusAreas].some((f) => f.placeholder) && (
                    <Badge tone="warning">Profile details to be confirmed</Badge>
                  )}
                </div>
                <h2 id="founder-title" className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-fg">
                  <Placeholder field={founder.name} />
                </h2>
                <p className="mt-2 text-fg-muted">
                  <Placeholder field={founder.role} />
                </p>
                <div className="mt-6 space-y-4 leading-relaxed text-fg-muted">
                  {founder.bio.map((b, i) => (
                    <p key={i}>
                      <Placeholder field={b} />
                    </p>
                  ))}
                </div>
                <h3 className="mt-8 font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">Focus areas</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {founder.focusAreas.map((f, i) => (
                    <li key={i} className="rounded-sm border border-line px-2.5 py-1.5 text-sm text-fg">
                      <Placeholder field={f} />
                    </li>
                  ))}
                </ul>
                {founder.linkedInUrl && (
                  <a
                    href={founder.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex min-h-11 items-center text-sm font-medium text-accent-400 hover:text-accent-300"
                  >
                    LinkedIn profile<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </div>
          </Container>
        </Section>
      )}

      <CtaPanel title="Let's talk about your data." />
    </>
  );
}
