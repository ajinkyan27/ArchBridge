import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type PageMetaInput = {
  title: string;
  description: string;
  /** Route path with trailing slash, e.g. "/services/". */
  path: string;
};

/** Per-page metadata with canonical URL and Open Graph/Twitter fields. */
export function pageMetadata({ title, description, path }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: path,
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
  };
}
