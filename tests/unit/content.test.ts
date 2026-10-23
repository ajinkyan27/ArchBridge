import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { contactHref, navigation } from "@/config/site";
import { caseStudies } from "@/content/case-studies";
import { services } from "@/content/services";

const appDir = path.resolve(__dirname, "../../src/app");
const routeExists = (href: string) => existsSync(path.join(appDir, href.replace(/^\/|\/$/g, ""), "page.tsx"));

describe("site content integrity", () => {
  it("every navigation link points at an existing page", () => {
    for (const item of [...navigation, { href: contactHref }, { href: "/privacy/" }]) {
      expect(routeExists(item.href), item.href).toBe(true);
    }
  });

  it("navigation links use the trailing-slash form served by the static export", () => {
    for (const item of [...navigation, { href: contactHref }]) expect(item.href.endsWith("/")).toBe(true);
  });

  it("case study slugs are unique and URL-safe", () => {
    const slugs = caseStudies.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("demonstration projects never carry a client attribution", () => {
    for (const c of caseStudies) {
      if (c.kind === "demonstration") expect(c.client, c.slug).toBeUndefined();
      else expect(c.client, c.slug).toBeTruthy();
    }
  });

  it("each case study has every required section", () => {
    for (const c of caseStudies) {
      expect(c.context && c.problem).toBeTruthy();
      for (const list of [c.approach, c.dataFlow, c.functionality, c.validation, c.technologies, c.lessons]) {
        expect(list.length, c.slug).toBeGreaterThan(0);
      }
    }
  });

  it("services have unique anchors and exactly four home-page pillars", () => {
    const ids = services.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(services.filter((s) => s.pillar).map((s) => s.title)).toEqual([
      "Data Engineering",
      "Cloud Data Platforms",
      "Analytics & Data Integration",
      "AI-Ready Data Foundations",
    ]);
  });
});
