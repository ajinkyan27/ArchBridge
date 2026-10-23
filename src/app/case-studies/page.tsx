import { Info } from "lucide-react";
import { caseStudies } from "@/content/case-studies";
import { pageMetadata } from "@/lib/metadata";
import { Container, PageHeader, Section } from "@/components/ui/Layout";
import { CaseStudyCard } from "@/components/sections/CaseStudyCard";
import { CtaPanel } from "@/components/sections/CtaPanel";

export const metadata = pageMetadata({
  title: "Case studies",
  description:
    "Illustrative demonstration projects showing how Arcbridge Analytics approaches warehouse modernisation, pipeline engineering and ERP/CRM integration.",
  path: "/case-studies/",
});

export default function CaseStudiesPage() {
  const hasDemos = caseStudies.some((c) => c.kind === "demonstration");
  return (
    <>
      <PageHeader
        eyebrow="Case studies"
        title="How we approach common data problems."
        intro="Each walkthrough covers the context, the problem, our approach, the data flow, what was built and how it was validated."
      >
        {hasDemos && (
          <div role="note" className="mt-10 flex max-w-3xl gap-3 rounded-md border border-warning/30 bg-warning/5 p-4 text-sm leading-relaxed text-fg-muted">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-warning" />
            <p>
              <strong className="font-semibold text-fg">Illustrative demonstration projects.</strong> These describe representative
              scenarios and our approach to them. They were not delivered for a client, and contain no client data, results or
              proprietary details. Verified client case studies will be published here with permission.
            </p>
          </div>
        )}
      </PageHeader>

      <Section aria-label="Case study list" className="pt-16 sm:pt-20">
        <Container className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {caseStudies.map((c, i) => (
            <CaseStudyCard key={c.slug} study={c} index={i} />
          ))}
        </Container>
      </Section>

      <CtaPanel title="Facing a similar problem?" secondary={{ href: "/services/", label: "Explore our services" }} />
    </>
  );
}
