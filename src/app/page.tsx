import type { Metadata } from "next";
import { contactHref, siteConfig } from "@/config/site";
import { hero, homeProcess, outcomes, valueProposition } from "@/content/home";
import { services } from "@/content/services";
import { caseStudies } from "@/content/case-studies";
import { BridgeArt } from "@/components/brand/BridgeArt";
import { ArrowLink, ButtonLink } from "@/components/ui/Button";
import { Container, Section, SectionHeading } from "@/components/ui/Layout";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { CaseStudyCard } from "@/components/sections/CaseStudyCard";
import { ProcessTrack } from "@/components/sections/ProcessTrack";
import { CtaPanel } from "@/components/sections/CtaPanel";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} | Data engineering, analytics and AI-ready data` },
  description:
    "Specialist data engineering consultancy. We build reliable cloud data platforms, connect enterprise systems and create AI-ready data foundations.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const pillars = services.filter((s) => s.pillar);

  return (
    <>
      {/* Hero */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden">
        <div aria-hidden className="bg-grid mask-radial pointer-events-none absolute inset-0 opacity-70" />
        <div aria-hidden className="pointer-events-none absolute top-[-18rem] left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-accent-600/15 blur-3xl" />
        <Container className="relative pt-16 sm:pt-24 lg:pt-28">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow">{hero.eyebrow}</p>
              <h1
                id="hero-title"
                className="mt-6 text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.035em] text-fg sm:text-6xl lg:text-[4.6rem]"
              >
                Bridge the gap between your data and your{" "}
                <span className="bg-gradient-to-r from-accent-400 via-accent-300 to-cyan-400 bg-clip-text text-transparent">
                  next breakthrough.
                </span>
              </h1>
            </div>
            <div className="lg:col-span-4 lg:pb-3">
              <p className="text-lg leading-relaxed text-fg-muted">{hero.body}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <ButtonLink href={contactHref} size="lg" arrow>
                  {hero.primaryCta}
                </ButtonLink>
                <ButtonLink href="/services/" size="lg" variant="secondary">
                  {hero.secondaryCta}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>

        <div className="relative mt-14 sm:mt-16">
          <Container>
            <BridgeArt className="-mb-px" />
          </Container>
          <div className="border-t border-line bg-ink-950/60">
            <Container className="grid grid-cols-3 gap-4 py-5 font-mono text-[0.68rem] tracking-[0.12em] text-fg-subtle uppercase sm:text-xs">
              <p>
                <span className="text-accent-400">01</span> Connect systems
              </p>
              <p className="text-center">
                <span className="text-accent-400">02</span> Engineer the flow
              </p>
              <p className="text-right">
                <span className="text-accent-400">03</span> Deliver insight
              </p>
            </Container>
          </div>
        </div>
      </section>

      {/* Value proposition */}
      <Section aria-labelledby="value-title" className="border-t border-line">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow">{valueProposition.eyebrow}</p>
            <h2 id="value-title" className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-fg sm:text-[2.6rem] sm:leading-[1.1]">
              {valueProposition.statement}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-fg-muted">{valueProposition.body}</p>
          </div>
          <dl className="grid gap-px self-start overflow-hidden rounded-lg border border-line bg-line lg:col-span-5 lg:col-start-8">
            {valueProposition.points.map((p) => (
              <div key={p.title} className="bg-ink-900 p-6">
                <dt className="flex items-center gap-3 font-semibold text-fg">
                  <span aria-hidden className="h-px w-5 bg-accent-400" />
                  {p.title}
                </dt>
                <dd className="mt-2 pl-8 text-[0.95rem] leading-relaxed text-fg-muted">{p.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      {/* Service pillars */}
      <Section aria-labelledby="services-title" className="bg-ink-900/40 border-y border-line">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="services-title"
              eyebrow="What we do"
              title="Four disciplines, one connected foundation."
              intro="Each service stands on its own. Together they take you from scattered systems to data you can build on."
            />
            <ArrowLink href="/services/" className="shrink-0">
              All services, including technical leadership
            </ArrowLink>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
            {pillars.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Outcomes */}
      <Section aria-labelledby="outcomes-title">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <SectionHeading id="outcomes-title" eyebrow={outcomes.eyebrow} title={outcomes.title} intro={outcomes.intro} />
            </div>
          </div>
          <ol className="lg:col-span-6 lg:col-start-7">
            {outcomes.items.map((o, i) => (
              <li key={o.title} className="group grid grid-cols-[3rem_1fr] gap-4 border-t border-line py-7 last:border-b">
                <span className="font-mono text-sm text-accent-400 transition-colors group-hover:text-cyan-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-fg">{o.title}</h3>
                  <p className="mt-2 leading-relaxed text-fg-muted">{o.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Case studies */}
      <Section aria-labelledby="work-title" className="border-t border-line">
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              id="work-title"
              eyebrow="Case studies"
              title="How we approach real data problems."
              intro="These are illustrative demonstration projects. They show our approach to common scenarios and were not delivered for a client."
            />
            <ArrowLink href="/case-studies/" className="shrink-0">
              View all case studies
            </ArrowLink>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {caseStudies.slice(0, 3).map((c, i) => (
              <CaseStudyCard key={c.slug} study={c} index={i} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Process */}
      <Section aria-labelledby="process-title" className="border-t border-line bg-ink-900/40">
        <Container>
          <SectionHeading
            id="process-title"
            eyebrow="How we work"
            title="A simple, transparent engagement."
            intro="Clear scope, visible progress and a proper handover. You always know what is being built, why, and what done looks like."
          />
          <ProcessTrack steps={homeProcess} className="mt-16" />
        </Container>
      </Section>

      <CtaPanel />
    </>
  );
}
