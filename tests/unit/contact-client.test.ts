import { describe, expect, it } from "vitest";
import { submitEnquiry } from "@/lib/contact/client";
import type { Submission } from "@/lib/contact/schema";

const payload: Submission = {
  name: "Ada",
  email: "ada@example.com",
  company: "",
  enquiryType: "other",
  summary: "A summary that is long enough to pass validation.",
  budget: "",
  timeline: "",
  privacyAcknowledged: true,
  website: "",
  startedAt: 1,
};

const json = (status: number, body: unknown) =>
  (async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })) as typeof fetch;

const submit = (fetchImpl: typeof fetch, timeoutMs = 1000) => submitEnquiry("https://api.example.test/enquiries", payload, { timeoutMs, fetchImpl });

describe("submitEnquiry", () => {
  it("reports success only for 2xx with ok:true and a reference", async () => {
    expect(await submit(json(200, { ok: true, reference: "ARC-1" }))).toEqual({ status: "success", reference: "ARC-1", localDev: false });
  });

  it("flags local development acknowledgements", async () => {
    const r = await submit(json(200, { ok: true, reference: "ARC-2", mode: "local-dev" }));
    expect(r).toMatchObject({ status: "success", localDev: true });
  });

  it("never treats a 200 without ok:true as success", async () => {
    expect((await submit(json(200, { ok: false, error: "internal_error" }))).status).toBe("error");
    expect((await submit(json(200, { hello: "world" }))).status).toBe("error");
    const html = (async () => new Response("<html>gateway</html>", { status: 200 })) as typeof fetch;
    expect((await submit(html)).status).toBe("error");
  });

  it("returns server field errors for validation failures", async () => {
    const r = await submit(json(422, { ok: false, error: "validation_failed", fieldErrors: { email: "Bad email" } }));
    expect(r).toMatchObject({ status: "invalid", fieldErrors: { email: "Bad email" } });
  });

  it("explains rate limiting, delivery failures and expired forms", async () => {
    expect(await submit(json(429, { message: "Too Many Requests" }))).toMatchObject({ status: "error", message: expect.stringMatching(/too many/i) });
    expect(await submit(json(502, { ok: false, error: "delivery_failed" }))).toMatchObject({ message: expect.stringMatching(/could not be delivered/i) });
    expect(await submit(json(400, { ok: false, error: "expired" }))).toMatchObject({ message: expect.stringMatching(/reload/i) });
  });

  it("handles network failures", async () => {
    const offline = (async () => {
      throw new TypeError("Failed to fetch");
    }) as typeof fetch;
    expect(await submit(offline)).toMatchObject({ status: "error", message: expect.stringMatching(/couldn't reach/i) });
  });

  it("times out slow requests", async () => {
    const hang = ((_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      })) as typeof fetch;
    expect(await submit(hang, 20)).toMatchObject({ status: "error", message: expect.stringMatching(/too long/i) });
  });
});
