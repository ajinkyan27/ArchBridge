import { describe, expect, it } from "vitest";
import { loadUrlRewrite, viewerRequest } from "../../scripts/cloudfront-function.mjs";

describe("CloudFront url-rewrite function", () => {
  const handler = loadUrlRewrite();

  it("serves the home page index", () => {
    expect(handler(viewerRequest("/")).uri).toBe("/index.html");
  });

  it("maps directory URLs to index.html", () => {
    expect(handler(viewerRequest("/services/")).uri).toBe("/services/index.html");
    expect(handler(viewerRequest("/case-studies/enterprise-pipeline-engineering/")).uri).toBe(
      "/case-studies/enterprise-pipeline-engineering/index.html",
    );
  });

  it("redirects extensionless paths to the trailing-slash form, keeping the query", () => {
    const r = handler(viewerRequest("/services", { query: { ref: "nav" } }));
    expect(r.statusCode).toBe(301);
    expect(r.headers.location.value).toBe("/services/?ref=nav");
  });

  it("leaves real files untouched", () => {
    for (const uri of ["/_next/static/chunks/app.js", "/sitemap.xml", "/icon.svg", "/about/__next.about/__PAGE__.txt"]) {
      expect(handler(viewerRequest(uri)).uri).toBe(uri);
    }
  });

  it("optionally redirects other hosts to the canonical host", () => {
    const canonical = loadUrlRewrite({ canonicalHost: "www.example.com" });
    const r = canonical(viewerRequest("/about/", { host: "example.com" }));
    expect(r.statusCode).toBe(301);
    expect(r.headers.location.value).toBe("https://www.example.com/about/");
    expect(canonical(viewerRequest("/about/", { host: "www.example.com" })).uri).toBe("/about/index.html");
  });
});
