import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { pageMetadata } from "@/lib/metadata";
import { Badge, Container } from "@/components/ui/Layout";
import { ArrowLink } from "@/components/ui/Button";
import { CaseStudyKindBadge } from "@/components/sections/CaseStudyCard";
import { CtaPanel } from "@/components/sections/CtaPanel";

// Static export: every slug is generated at build time; unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) return {};
  return pageMetadata({
    title: study.title,
    description: `${study.kind === "demonstration" ? "Illustrative demonstration project: " : ""}${study.summary}`,
    path: `/case-studies/${study.slug}/`,
  });
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-4 border-t border-line py-10 md:grid-cols-12 md:gap-8">
      <h2 id={id} className="font-mono text-xs tracking-[0.14em] text-accent-400 uppercase md:col-span-3 md:pt-1">
        {title}
      </h2>
      <div className="text-fg-muted md:col-span-9">{children}</div>
    </section>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();

  const others = caseStudies.filter((c) => c.slug !== study.slug);

  return (
    <>
      <article>
        <header className="relative overflow-hidden border-b border-line">
          <div aria-hidden className="bg-grid mask-radial pointer-events-none absolute inset-0 opacity-50" />
          <Container className="relative pt-10 pb-14 sm:pt-14 sm:pb-16">
            <Link href="/case-studies/" className="inline-flex min-h-11 items-center gap-2 text-sm text-fg-muted transition-colors hover:text-fg">
              <ArrowLeft aria-hidden className="size-4" />
              All case studies
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CaseStudyKindBadge kind={study.kind} />
              {study.services.map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl leading-[1.08] font-semibold tracking-[-0.03em] text-fg sm:text-5xl">{study.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-fg-muted">{study.summary}</p>
            <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
              <div>
                <dt className="font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">{study.kind === "client" ? "Client" : "Scenario"}</dt>
                <dd className="mt-1 text-fg">{study.kind === "client" && study.client ? study.client : study.sector}</dd>
              </div>
            </dl>
          </Container>
        </header>

        <Container className="py-12 sm:py-16">
          {study.kind === "demonstration" && (
            <div role="note" className="mb-10 flex gap-3 rounded-md border border-warning/30 bg-warning/5 p-4 text-sm leading-relaxed text-fg-muted">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
              <p>
                <strong className="font-semibold text-fg">Illustrative demonstration project.</strong> This walkthrough describes a
                representative scenario and how we would approach it. It was not delivered for a client and makes no claims about
                client results.
              </p>
            </div>
          )}

          <Block id="context" title="Context">
            <p className="text-lg leading-relaxed">{study.context}</p>
          </Block>

          <Block id="problem" title="Problem statement">
            <p className="text-lg leading-relaxed">{study.problem}</p>
          </Block>

          <Block id="approach" title="Approach">
            <ol className="space-y-4">
              {study.approach.map((a, i) => (
                <li key={a} className="grid grid-cols-[2.25rem_1fr] leading-relaxed">
                  <span className="font-mono text-sm text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-fg">{a}</span>
                </li>
              ))}
            </ol>
          </Block>

          <Block id="data-flow" title="Architecture & data flow">
            <ol className="relative grid gap-3 lg:grid-cols-5 lg:gap-0">
              {study.dataFlow.map((f, i) => (
                <li
                  key={f.stage}
                  className="relative rounded-md border border-line bg-ink-900 p-4 lg:rounded-none lg:border-r-0 lg:first:rounded-l-md lg:last:rounded-r-md lg:last:border-r"
                >
                  <span className="font-mono text-[0.7rem] text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-2 font-semibold text-fg">{f.stage}</p>
                  <p className="mt-1 text-sm leading-relaxed">{f.detail}</p>
                  {i < study.dataFlow.length - 1 && (
                    <span aria-hidden className="absolute -bottom-3 left-6 h-3 w-px bg-accent-500 lg:top-1/2 lg:-right-px lg:bottom-auto lg:left-auto lg:h-px lg:w-0" />
                  )}
                </li>
              ))}
            </ol>
          </Block>

          <Block id="functionality" title="Implemented functionality">
            <ul className="grid gap-3 sm:grid-cols-2">
              {study.functionality.map((f) => (
                <li key={f} className="flex gap-3 text-fg">
                  <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-accent-400" />
                  {f}
                </li>
              ))}
            </ul>
          </Block>

          <Block id="validation" title={study.kind === "client" ? "Measured results" : "Validation approach"}>
            <ul className="space-y-3">
              {study.validation.map((v) => (
                <li key={v} className="flex gap-3 leading-relaxed">
                  <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-cyan-400" />
                  {v}
                </li>
              ))}
            </ul>
          </Block>

          <Block id="technologies" title="Technologies">
            <ul className="flex flex-wrap gap-2">
              {study.technologies.map((t) => (
                <li key={t} className="rounded-sm border border-line bg-ink-900 px-2.5 py-1.5 font-mono text-xs text-fg">
                  {t}
                </li>
              ))}
            </ul>
          </Block>

          <Block id="lessons" title="Lessons learned">
            <ul className="space-y-4">
              {study.lessons.map((l) => (
                <li key={l} className="border-l-2 border-accent-500 pl-4 text-lg leading-relaxed text-fg">
                  {l}
                </li>
              ))}
            </ul>
          </Block>
        </Container>
      </article>

      <section aria-labelledby="more-title" className="border-t border-line bg-ink-900/40 py-16">
        <Container>
          <h2 id="more-title" className="text-2xl font-semibold text-fg">
            More case studies
          </h2>
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {others.map((o) => (
              <li key={o.slug} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-fg">{o.title}</span>
                <ArrowLink href={`/case-studies/${o.slug}/`} aria-label={`Read case study: ${o.title}`}>
                  Read
                </ArrowLink>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <CtaPanel title="Facing a similar problem?" />
    </>
  );
}
