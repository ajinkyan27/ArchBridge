import Link from "next/link";
import { contactHref } from "@/config/site";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";
import { DesktopNav } from "./NavLinks";
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
  return (
    // No backdrop-filter here: it would become the containing block for the
    // fixed-position mobile menu panel and collapse it.
    <header className="sticky top-0 z-50 h-[var(--header-h)] border-b border-line/80 bg-ink-950/95">
      <Container className="flex h-full items-center justify-between gap-6">
        <Link href="/" className="-m-1 rounded-md p-1" aria-label="Arcbridge Analytics home">
          <Logo compact />
        </Link>
        <div className="flex items-center gap-4">
          <DesktopNav />
          <div className="hidden md:block">
            <ButtonLink href={contactHref}>Discuss your project</ButtonLink>
          </div>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-3 left-3 z-[60] -translate-y-24 rounded-md bg-accent-600 px-4 py-3 text-sm font-medium text-white transition-transform focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
