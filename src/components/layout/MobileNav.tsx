"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { contactHref, navigation } from "@/config/site";
import { cn } from "@/lib/cn";
import { buttonClasses } from "@/components/ui/Button";
import { isActivePath } from "./NavLinks";

/**
 * Disclosure-pattern mobile menu: a toggle button controlling a panel.
 * Escape closes it and returns focus to the toggle; it also closes on navigation.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const [lastPath, setLastPath] = useState(pathname);

  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 768px)");
    const onResize = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onResize);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onResize);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-md border border-line-strong text-fg transition-colors hover:border-accent-500/70"
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-x-0 top-[var(--header-h)] bottom-0 z-40 overflow-y-auto border-t border-line bg-ink-950"
      >
        <nav aria-label="Mobile" className="px-4 pt-6 pb-10 sm:px-6">
          <ul className="divide-y divide-line border-y border-line">
            {[{ href: "/", label: "Home" }, ...navigation, { href: contactHref, label: "Contact" }].map((item) => {
              const active = item.href === "/" ? pathname === "/" : isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-14 items-center justify-between text-lg font-medium",
                      active ? "text-fg" : "text-fg-muted",
                    )}
                  >
                    {item.label}
                    {active && <span aria-hidden className="size-1.5 rounded-full bg-accent-400" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href={contactHref} onClick={() => setOpen(false)} className={buttonClasses({ size: "lg", className: "mt-8 w-full" })}>
            Discuss your project
          </Link>
        </nav>
      </div>
    </div>
  );
}
