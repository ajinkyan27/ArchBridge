import { describe, expect, it } from "vitest";
import { enquirySchema, LIMITS, toFieldErrors } from "@/lib/contact/schema";

const valid = {
  name: "Ada Lovelace",
  email: "Ada@Example.com",
  company: "Analytical Engines Ltd",
  enquiryType: "data-engineering",
  summary: "We need to rebuild our nightly reporting pipelines on Azure.",
  budget: "10k-25k",
  timeline: "1-3-months",
  privacyAcknowledged: true,
};

describe("enquirySchema", () => {
  it("accepts a complete valid enquiry and normalises the email", () => {
    const r = enquirySchema.parse(valid);
    expect(r.email).toBe("ada@example.com");
    expect(r.enquiryType).toBe("data-engineering");
  });

  it("accepts optional fields when omitted", () => {
    const { company, budget, timeline, ...required } = valid;
    void company;
    void budget;
    void timeline;
    const r = enquirySchema.parse(required);
    expect(r.company).toBe("");
    expect(r.budget).toBe("");
    expect(r.timeline).toBe("");
  });

  it("reports every missing required field with a readable message", () => {
    const r = enquirySchema.safeParse({ name: "", email: "", summary: "", privacyAcknowledged: false });
    expect(r.success).toBe(false);
    const errors = toFieldErrors(r.error!);
    expect(Object.keys(errors).sort()).toEqual(["email", "enquiryType", "name", "privacyAcknowledged", "summary"]);
    expect(errors.name).toMatch(/name/i);
    expect(errors.enquiryType).toMatch(/enquiry type/i);
  });

  it("rejects malformed email addresses", () => {
    const r = enquirySchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
    expect(toFieldErrors(r.error!).email).toMatch(/valid email/i);
  });

  it("rejects unknown enquiry types, budgets and timelines", () => {
    for (const patch of [{ enquiryType: "hack" }, { budget: "1m" }, { timeline: "yesterday" }]) {
      expect(enquirySchema.safeParse({ ...valid, ...patch }).success).toBe(false);
    }
  });

  it("enforces summary length bounds", () => {
    expect(enquirySchema.safeParse({ ...valid, summary: "too short" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, summary: "x".repeat(LIMITS.summaryMax + 1) }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, summary: "x".repeat(LIMITS.summaryMax) }).success).toBe(true);
  });

  it("strips CR/LF from single-line fields to prevent header injection", () => {
    const r = enquirySchema.parse({ ...valid, name: "Eve\r\nBcc: victim@example.com" });
    expect(r.name).not.toMatch(/[\r\n]/);
  });

  it("keeps newlines in the summary but removes other control characters", () => {
    const r = enquirySchema.parse({ ...valid, summary: "Line one is long enough\r\nLine two\u0007" });
    expect(r.summary).toBe("Line one is long enough\nLine two");
  });

  it("requires the privacy acknowledgement to be exactly true", () => {
    expect(enquirySchema.safeParse({ ...valid, privacyAcknowledged: "true" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, privacyAcknowledged: false }).success).toBe(false);
  });
});
