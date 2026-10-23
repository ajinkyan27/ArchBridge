"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/config/site";
import { cn } from "@/lib/cn";

const normalise = (path: string) => (path.length > 1 ? path.replace(/\/$/, "") : path);

export function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  const current = normalise(pathname);
  const target = normalise(href);
  return current === target || current.startsWith(`${target}/`);
}

export function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {navigation.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors",
                  active ? "text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {item.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 bottom-1.5 h-px origin-left bg-accent-400 transition-transform duration-300 ease-out-quart",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
