import type { Metadata } from "next";
import { ArcAccent } from "@/components/brand/BridgeArt";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="relative overflow-hidden">
      <div aria-hidden className="bg-grid mask-radial pointer-events-none absolute inset-0 opacity-60" />
      <Container className="relative flex min-h-[60vh] flex-col items-start justify-center py-24">
        <ArcAccent className="w-48 opacity-80" />
        <p className="eyebrow mt-8">Error 404</p>
        <h1 id="nf-title" className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-fg sm:text-5xl">
          This bridge doesn&rsquo;t lead anywhere.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-fg-muted">
          The page you were looking for doesn&rsquo;t exist or has moved. Try one of these instead.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg">
            Go to the home page
          </ButtonLink>
          <ButtonLink href="/services/" size="lg" variant="secondary">
            View services
          </ButtonLink>
          <ButtonLink href="/contact/" size="lg" variant="ghost">
            Contact us
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
