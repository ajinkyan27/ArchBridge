import type { ReactNode } from "react";
import { contactHref } from "@/config/site";
import { ArcAccent } from "@/components/brand/BridgeArt";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";

type CtaPanelProps = {
  title?: ReactNode;
  body?: ReactNode;
  secondary?: { href: string; label: string };
};

export function CtaPanel({
  title = "Have a data problem worth solving properly?",
  body = "Tell us about your systems, your goals and your constraints. We will reply with honest thoughts on whether and how we can help.",
  secondary = { href: "/services/", label: "Explore our services" },
}: CtaPanelProps) {
  return (
    <section aria-labelledby="cta-title" className="py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-lg border border-line-strong bg-ink-900 px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
          <div aria-hidden className="bg-grid mask-radial pointer-events-none absolute inset-0 opacity-50" />
          <div aria-hidden className="pointer-events-none absolute -right-24 -bottom-40 h-80 w-[36rem] rounded-full bg-accent-600/20 blur-3xl" />
          <ArcAccent className="pointer-events-none absolute -right-10 bottom-0 hidden w-[26rem] lg:block" />
          <div className="relative max-w-2xl">
            <p className="eyebrow">Start a conversation</p>
            <h2 id="cta-title" className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-fg sm:text-4xl">
              {title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-fg-muted">{body}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={contactHref} size="lg" arrow>
                Discuss your project
              </ButtonLink>
              <ButtonLink href={secondary.href} size="lg" variant="secondary">
                {secondary.label}
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
