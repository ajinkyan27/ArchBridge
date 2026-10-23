/**
 * Central site configuration.
 *
 * Everything the owner may need to change lives here or in the environment
 * variables it reads. Values that differ per environment come from
 * `NEXT_PUBLIC_*` variables (see `.env.example`). They are inlined into the
 * static build, so they must never contain secrets.
 */

function readUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function readEmail(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
}

const siteUrl = (readUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "https://arcbridgeanalytics.com/").replace(/\/$/, "");

export const siteConfig = {
  name: "Arcbridge Analytics",
  shortName: "Arcbridge",
  tagline: "Bridging Data. Building Intelligence.",
  description:
    "Arcbridge Analytics is a specialist data engineering, analytics and AI consultancy. We modernise data platforms, connect enterprise systems and build reliable foundations for analytics and AI.",

  /** Production origin, used for canonical URLs, Open Graph, sitemap and robots. */
  url: siteUrl,

  /** Locale used in metadata. */
  locale: "en_GB",

  /**
   * Optional public contact address shown on the contact page and footer.
   * Leave NEXT_PUBLIC_CONTACT_EMAIL unset until the mailbox exists.
   */
  contactEmail: readEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL),

  /** Optional LinkedIn company page. Hidden when unset. */
  linkedInUrl: readUrl(process.env.NEXT_PUBLIC_LINKEDIN_URL),

  /** Allow search engines to index the site. Set NEXT_PUBLIC_ALLOW_INDEXING=false on staging builds. */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING !== "false",
} as const;

export const contactConfig = {
  /**
   * Public HTTPS endpoint of the AWS contact API (API Gateway → Lambda → SES).
   * When unset, the contact form shows an honest "not yet enabled" state.
   */
  apiUrl: readUrl(process.env.NEXT_PUBLIC_CONTACT_API_URL),

  /** Client-side timeout for the submission request. */
  requestTimeoutMs: 15000,
} as const;

export const navigation = [
  { href: "/services/", label: "Services" },
  { href: "/case-studies/", label: "Case studies" },
  { href: "/about/", label: "About" },
] as const;

export const contactHref = "/contact/";
