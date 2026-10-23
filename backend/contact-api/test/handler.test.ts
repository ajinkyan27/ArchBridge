import { describe, expect, it, vi } from "vitest";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { createHandler, type EmailSender } from "../src/handler";
import { loadConfig, type ContactConfig } from "../src/config";

const ORIGIN = "https://www.example.test";
const NOW = 1_800_000_000_000;

const config: ContactConfig = {
  recipientEmail: "inbox@example.test",
  fromEmail: "no-reply@example.test",
  allowedOrigins: [ORIGIN],
  siteName: "Arcbridge Analytics",
  deliveryMode: "ses",
  allowMissingOrigin: false,
};

const validBody = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Engines Ltd",
  enquiryType: "cloud-platform",
  summary: "Our Redshift cluster needs a review of cost and performance. CONFIDENTIAL-MARKER",
  budget: "",
  timeline: "exploring",
  privacyAcknowledged: true,
  website: "",
  startedAt: NOW - 60_000,
};

function event(overrides: { method?: string; headers?: Record<string, string>; body?: string; isBase64Encoded?: boolean } = {}) {
  return {
    version: "2.0",
    routeKey: "POST /enquiries",
    rawPath: "/enquiries",
    rawQueryString: "",
    headers: overrides.headers ?? { origin: ORIGIN, "content-type": "application/json" },
    body: overrides.body ?? JSON.stringify(validBody),
    isBase64Encoded: overrides.isBase64Encoded ?? false,
    requestContext: { requestId: "req-abc123", http: { method: overrides.method ?? "POST" } },
  } as unknown as APIGatewayProxyEventV2;
}

function setup(sendEmail: EmailSender = vi.fn(async () => {}), cfg: ContactConfig = config) {
  const logs: Record<string, unknown>[] = [];
  const handler = createHandler({ config: cfg, sendEmail, now: () => NOW, log: (e) => logs.push(e) });
  return { handler, logs, sendEmail };
}

const parse = (r: { body?: string }) => JSON.parse(r.body || "null");

describe("contact handler", () => {
  it("sends a valid enquiry via SES and returns a reference", async () => {
    const { handler, sendEmail } = setup();
    const res = await handler(event());
    expect(res.statusCode).toBe(200);
    expect(parse(res)).toMatchObject({ ok: true, reference: expect.stringMatching(/^ARC-\d{8}-[A-Z0-9]+$/) });
    expect(res.headers?.["Access-Control-Allow-Origin"]).toBe(ORIGIN);
    expect(sendEmail).toHaveBeenCalledOnce();
    const msg = vi.mocked(sendEmail).mock.calls[0][0];
    expect(msg).toMatchObject({ from: config.fromEmail, to: config.recipientEmail, replyTo: "ada@example.com" });
    expect(msg.subject).toContain("Cloud platform modernisation");
    expect(msg.text).toContain("CONFIDENTIAL-MARKER");
  });

  it("does not log enquiry content or the sender's email", async () => {
    const { handler, logs } = setup();
    await handler(event());
    const logged = JSON.stringify(logs);
    expect(logged).not.toContain("CONFIDENTIAL-MARKER");
    expect(logged).not.toContain("ada@example.com");
    expect(logged).not.toContain("Ada Lovelace");
    expect(logs.at(-1)).toMatchObject({ outcome: "sent", enquiryType: "cloud-platform" });
  });

  it("rejects methods other than POST", async () => {
    const { handler, sendEmail } = setup();
    expect((await handler(event({ method: "GET" }))).statusCode).toBe(405);
    expect((await handler(event({ method: "PUT" }))).statusCode).toBe(405);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("answers CORS preflight for allowed origins without sending", async () => {
    const { handler, sendEmail } = setup();
    const res = await handler(event({ method: "OPTIONS" }));
    expect(res.statusCode).toBe(204);
    expect(res.headers?.["Access-Control-Allow-Origin"]).toBe(ORIGIN);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects unlisted or missing origins and never echoes them", async () => {
    const { handler } = setup();
    const bad = await handler(event({ headers: { origin: "https://evil.test", "content-type": "application/json" } }));
    expect(bad.statusCode).toBe(403);
    expect(bad.headers?.["Access-Control-Allow-Origin"]).toBeUndefined();
    expect((await handler(event({ headers: { "content-type": "application/json" } }))).statusCode).toBe(403);
  });

  it("allows missing origin only when explicitly enabled", async () => {
    const { handler } = setup(undefined, { ...config, allowMissingOrigin: true });
    expect((await handler(event({ headers: { "content-type": "application/json" } }))).statusCode).toBe(200);
  });

  it("requires a JSON content type", async () => {
    const { handler } = setup();
    expect((await handler(event({ headers: { origin: ORIGIN, "content-type": "text/plain" } }))).statusCode).toBe(415);
  });

  it("rejects oversized bodies, including base64-encoded ones", async () => {
    const { handler } = setup();
    const big = JSON.stringify({ ...validBody, summary: "x".repeat(20_000) });
    expect((await handler(event({ body: big }))).statusCode).toBe(413);
    expect((await handler(event({ body: Buffer.from(big).toString("base64"), isBase64Encoded: true }))).statusCode).toBe(413);
  });

  it("decodes base64 bodies from API Gateway", async () => {
    const { handler } = setup();
    const res = await handler(event({ body: Buffer.from(JSON.stringify(validBody)).toString("base64"), isBase64Encoded: true }));
    expect(res.statusCode).toBe(200);
  });

  it("rejects malformed JSON", async () => {
    const { handler } = setup();
    expect(parse(await handler(event({ body: "{not json" })))).toEqual({ ok: false, error: "invalid_json" });
  });

  it("rejects honeypot submissions without sending", async () => {
    const { handler, sendEmail } = setup();
    const res = await handler(event({ body: JSON.stringify({ ...validBody, website: "http://spam.test" }) }));
    expect(res.statusCode).toBe(400);
    expect(parse(res)).toEqual({ ok: false, error: "rejected" });
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("rejects implausibly fast and stale submissions", async () => {
    const { handler } = setup();
    expect(parse(await handler(event({ body: JSON.stringify({ ...validBody, startedAt: NOW - 500 }) })))).toMatchObject({ error: "rejected" });
    expect(parse(await handler(event({ body: JSON.stringify({ ...validBody, startedAt: NOW - 2 * 86_400_000 }) })))).toMatchObject({ error: "expired" });
    expect(parse(await handler(event({ body: JSON.stringify({ ...validBody, startedAt: undefined }) })))).toMatchObject({ error: "rejected" });
  });

  it("returns field errors for invalid input", async () => {
    const { handler, sendEmail } = setup();
    const res = await handler(event({ body: JSON.stringify({ ...validBody, email: "nope", enquiryType: "x", privacyAcknowledged: false }) }));
    expect(res.statusCode).toBe(422);
    const body = parse(res);
    expect(body.error).toBe("validation_failed");
    expect(Object.keys(body.fieldErrors).sort()).toEqual(["email", "enquiryType", "privacyAcknowledged"]);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns a safe 502 when SES fails, without leaking details", async () => {
    const failing = vi.fn(async () => {
      throw Object.assign(new Error("MessageRejected: Email address is not verified. arn:aws:ses:secret"), {
        name: "MessageRejected",
        $metadata: { httpStatusCode: 400 },
      });
    });
    const { handler, logs } = setup(failing);
    const res = await handler(event());
    expect(res.statusCode).toBe(502);
    expect(res.body).toBe(JSON.stringify({ ok: false, error: "delivery_failed" }));
    expect(JSON.stringify(logs)).not.toContain("arn:aws");
    expect(logs.at(-1)).toMatchObject({ outcome: "delivery_failed", errorName: "MessageRejected" });
  });

  it("returns 503 when configuration is missing", async () => {
    const logs: unknown[] = [];
    const prev = { ...process.env };
    delete process.env.CONTACT_RECIPIENT_EMAIL;
    try {
      const handler = createHandler({ log: (e) => logs.push(e), sendEmail: vi.fn() });
      const res = await handler(event());
      expect(res.statusCode).toBe(503);
      expect(parse(res)).toEqual({ ok: false, error: "not_configured" });
    } finally {
      process.env = prev;
    }
  });

  it("local-dev mode validates and acknowledges without sending", async () => {
    const send = vi.fn(async () => {});
    const { handler } = setup(send, { ...config, deliveryMode: "log" });
    const res = await handler(event());
    expect(parse(res)).toMatchObject({ ok: true, mode: "local-dev" });
    expect(send).not.toHaveBeenCalled();
  });
});

describe("loadConfig", () => {
  const base = { CONTACT_RECIPIENT_EMAIL: "a@b.co", CONTACT_FROM_EMAIL: "c@d.co", ALLOWED_ORIGINS: "https://x.test/, https://y.test" };

  it("parses and normalises origins", () => {
    expect(loadConfig(base).allowedOrigins).toEqual(["https://x.test", "https://y.test"]);
  });

  it("refuses wildcard and empty origins", () => {
    expect(() => loadConfig({ ...base, ALLOWED_ORIGINS: "*" })).toThrow();
    expect(() => loadConfig({ ...base, ALLOWED_ORIGINS: "" })).toThrow();
  });

  it("requires valid email addresses in SES mode", () => {
    expect(() => loadConfig({ ...base, CONTACT_FROM_EMAIL: "" })).toThrow(/CONTACT_FROM_EMAIL/);
    expect(() => loadConfig({ ...base, CONTACT_RECIPIENT_EMAIL: "bad" })).toThrow(/CONTACT_RECIPIENT_EMAIL/);
  });
});
