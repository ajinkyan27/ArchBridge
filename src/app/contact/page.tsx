import Link from "next/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { Container, PageHeader } from "@/components/ui/Layout";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Tell us about your data engineering, cloud platform, analytics or AI-ready data project. We will reply by email with honest next steps.",
  path: "/contact/",
});

const nextSteps = [
  { title: "We read every enquiry", body: "Your message goes directly to the consultancy, not to a sales team." },
  { title: "We reply by email", body: "With initial thoughts, any questions, and whether we think we can help." },
  { title: "A discovery conversation", body: "If it makes sense for both sides, we arrange a short call to explore the detail." },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Discuss your project."
        intro="Share a little about your systems, goals and constraints. There is no obligation, and we will be straightforward about whether we are the right fit."
      />
      <Container className="grid gap-14 py-16 sm:py-20 lg:grid-cols-12">
        <section aria-labelledby="form-title" className="lg:col-span-7">
          <h2 id="form-title" className="sr-only">
            Enquiry form
          </h2>
          <div className="rounded-lg border border-line bg-ink-900 p-5 sm:p-8">
            <ContactForm />
          </div>
        </section>

        <aside aria-labelledby="next-title" className="lg:col-span-4 lg:col-start-9">
          <h2 id="next-title" className="eyebrow">
            What happens next
          </h2>
          <ol className="mt-6 space-y-6">
            {nextSteps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2.5rem_1fr]">
                <span className="font-mono text-sm text-accent-400">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-semibold text-fg">{s.title}</h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-fg-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 space-y-4 border-t border-line pt-8 text-sm leading-relaxed text-fg-muted">
            {siteConfig.contactEmail && (
              <p>
                Prefer email? Write to{" "}
                <a href={`mailto:${siteConfig.contactEmail}`} className="break-all text-accent-400 underline underline-offset-4 hover:text-accent-300">
                  {siteConfig.contactEmail}
                </a>
                .
              </p>
            )}
            <p>We work remotely with clients internationally. Engagements are priced by proposal once scope is understood.</p>
            <p>
              How we handle your details is explained in our{" "}
              <Link href="/privacy/" className="text-accent-400 underline underline-offset-4 hover:text-accent-300">
                privacy notice
              </Link>
              .
            </p>
          </div>
        </aside>
      </Container>
    </>
  );
}
