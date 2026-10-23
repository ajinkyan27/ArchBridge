import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { caseStudies } from "@/content/case-studies";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/services/", "/case-studies/", "/about/", "/contact/", "/privacy/"];
  return [
    ...routes.map((path) => ({
      url: `${siteConfig.url}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
    })),
    ...caseStudies.map((c) => ({
      url: `${siteConfig.url}/case-studies/${c.slug}/`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
