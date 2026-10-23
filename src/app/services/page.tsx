import { Check } from "lucide-react";
import { engagementSteps, services } from "@/content/services";
import { pageMetadata } from "@/lib/metadata";
import { ArrowLink } from "@/components/ui/Button";
import { Container, PageHeader, Section, SectionHeading } from "@/components/ui/Layout";
import { ServiceIcon } from "@/components/sections/ServiceCard";
import { ProcessTrack } from "@/components/sections/ProcessTrack";
import { CtaPanel } from "@/components/sections/CtaPanel";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Data engineering, cloud data platforms on Azure and AWS, ERP/CRM integration and analytics, AI-ready data foundations, and contract technical leadership.",
  path: "/services/",
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Specialist data engineering, from pipelines to platforms."
        intro="Five ways we help, each with clear deliverables. Engagements are scoped to your situation, whether that is a fixed-scope project, an architecture review or senior capacity inside your team."
      >
        <nav aria-label="Services on this page" className="mt-10">
          <ul className="flex flex-wrap gap-2">
            {services.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-md border border-line-strong px-3 text-sm text-fg-muted transition-colors hover:border-accent-500/70 hover:text-fg"
                >
                  <span className="font-mono text-xs text-accent-400">{s.index}</span>
                  {s.shortTitle}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <div>
        {services.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="border-b border-line py-16 sm:py-20">
            <Container className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-4">
                  <span className="inline-flex size-12 items-center justify-center rounded-md border border-line-strong text-accent-400">
                    <ServiceIcon name={s.icon} className="size-6" />
                  </span>
                  <span className="font-mono text-sm text-fg-subtle">{s.index}</span>
                </div>
                <h2 id={`${s.id}-title`} className="mt-6 text-3xl font-semibold tracking-[-0.025em] text-fg">
                  {s.title}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-fg-muted">{s.description}</p>
                <div className="mt-8 border-l-2 border-accent-500 pl-5">
                  <p className="font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">Business value</p>
                  <p className="mt-2 text-fg">{s.value}</p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
                <div className="rounded-lg border border-line bg-ink-900 p-6">
                  <h3 className="font-mono text-xs tracking-[0.14em] text-accent-400 uppercase">Deliverables</h3>
                  <ul className="mt-5 space-y-3">
                    {s.deliverables.map((d) => (
                      <li key={d} className="flex gap-3 text-[0.95rem] text-fg">
                        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-400" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-line bg-ink-900/40 p-6">
                  <h3 className="font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">A good fit for</h3>
                  <ul className="mt-5 space-y-4">
                    {s.idealFor.map((d) => (
                      <li key={d} className="border-t border-line pt-4 text-[0.95rem] leading-relaxed text-fg-muted first:border-0 first:pt-0">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Container>
          </section>
        ))}
      </div>

      <Section aria-labelledby="engagement-title" className="bg-ink-900/40">
        <Container>
          <SectionHeading
            id="engagement-title"
            eyebrow="Engagement model"
            title="How an engagement works."
            intro="Transparent from the first conversation to handover. Nothing starts until scope, deliverables and acceptance criteria are agreed in writing."
          />
          <ProcessTrack steps={engagementSteps} className="mt-16" />

          <div className="mt-20 grid gap-6 rounded-lg border border-line bg-ink-900 p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-8">
              <h3 className="text-xl font-semibold text-fg">Pricing</h3>
              <p className="mt-3 leading-relaxed text-fg-muted">
                Every engagement is priced in a written proposal once scope is understood. Fixed-scope projects are quoted as a fixed
                price with defined deliverables; contract and advisory work is quoted on a time basis. Delivery timelines are agreed
                in the proposal, not assumed in advance.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <ArrowLink href="/contact/">Request a proposal</ArrowLink>
            </div>
          </div>
        </Container>
      </Section>

      <CtaPanel secondary={{ href: "/case-studies/", label: "See example approaches" }} />
    </>
  );
}
