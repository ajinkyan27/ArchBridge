import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const read = (p: string) => readFileSync(path.join(root, p), "utf8");

describe("infrastructure templates", () => {
  it("hosting template embeds the same CloudFront function as url-rewrite.js", () => {
    const template = read("infrastructure/hosting/template.yaml");
    const code = read("infrastructure/cloudfront/url-rewrite.js")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//"));
    const templateLines = new Set(template.split("\n").map((l) => l.trim()));
    for (const line of code) expect(templateLines.has(line), `missing in template: ${line}`).toBe(true);
  });

  it("keeps the S3 bucket private", () => {
    const template = read("infrastructure/hosting/template.yaml");
    for (const flag of ["BlockPublicAcls", "BlockPublicPolicy", "IgnorePublicAcls", "RestrictPublicBuckets"]) {
      expect(template).toMatch(new RegExp(`${flag}: true`));
    }
    expect(template).toContain("OriginAccessControlId");
  });

  it("does not hard-code emails, account IDs or origins in the contact API template", () => {
    const template = read("backend/contact-api/template.yaml");
    expect(template).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
    expect(template).not.toMatch(/\b\d{12}\b/);
    expect(template).not.toMatch(/AllowOrigins:\s*\[?\s*["']?\*/);
  });
});
