import Link from "next/link";
import { contactHref, siteConfig } from "@/config/site";
import { services } from "@/content/services";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";

const footerColumns = [
  {
    title: "Services",
    links: services.map((s) => ({ href: `/services/#${s.id}`, label: s.shortTitle })),
  },
  {
    title: "Company",
    links: [
      { href: "/about/", label: "About" },
      { href: "/case-studies/", label: "Case studies" },
      { href: contactHref, label: "Contact" },
      { href: "/privacy/", label: "Privacy notice" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-line bg-ink-950">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-500/50 to-transparent" />
      <Container className="grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link href="/" className="inline-block rounded-md" aria-label="Arcbridge Analytics home">
            <Logo />
          </Link>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-fg-muted">
            A specialist consultancy for data engineering, cloud data platforms, analytics foundations and AI-ready data.
          </p>
          <p className="mt-4 font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">{siteConfig.tagline}</p>
          <ButtonLink href={contactHref} variant="secondary" arrow className="mt-8">
            Discuss your project
          </ButtonLink>
        </div>

        <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={`Footer: ${col.title}`}>
              <h2 className="font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">{col.title}</h2>
              <ul className="mt-4 space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-10 items-center text-sm text-fg-muted transition-colors hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <h2 className="font-mono text-xs tracking-[0.14em] text-fg-subtle uppercase">Get in touch</h2>
            <ul className="mt-4 space-y-1 text-sm">
              <li>
                <Link href={contactHref} className="inline-flex min-h-10 items-center text-fg-muted transition-colors hover:text-fg">
                  Enquiry form
                </Link>
              </li>
              {siteConfig.contactEmail && (
                <li>
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    className="inline-flex min-h-10 items-center break-all text-fg-muted transition-colors hover:text-fg"
                  >
                    {siteConfig.contactEmail}
                  </a>
                </li>
              )}
              {siteConfig.linkedInUrl && (
                <li>
                  <a
                    href={siteConfig.linkedInUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="inline-flex min-h-10 items-center text-fg-muted transition-colors hover:text-fg"
                  >
                    LinkedIn<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              )}
              <li className="pt-2 text-fg-subtle">Working remotely with clients internationally.</li>
            </ul>
          </div>
        </div>
      </Container>
      <Container className="flex flex-col gap-3 border-t border-line py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} {siteConfig.name}. All rights reserved.
        </p>
        <p>Case studies on this site are illustrative demonstration projects unless stated otherwise.</p>
      </Container>
    </footer>
  );
}
