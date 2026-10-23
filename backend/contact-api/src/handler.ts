import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import {
  antiSpamSchema,
  enquirySchema,
  LIMITS,
  toFieldErrors,
  type ContactApiErrorCode,
  type ContactApiResponse,
} from "../../../src/lib/contact/schema";
import { buildNotificationEmail } from "./email";
import { loadConfig, type ContactConfig } from "./config";

/**
 * Contact API: API Gateway (HTTP API, payload v2) → Lambda → Amazon SES.
 *
 * - Accepts only POST with a JSON body up to LIMITS.bodyBytes.
 * - Validates with the same Zod schema as the browser form.
 * - Rejects honeypot hits and implausibly fast or stale submissions.
 * - Sends one plain-text notification to the configured recipient.
 * - Never returns internal error details; logs metadata only, never enquiry content.
 */

export type EmailSender = (input: { from: string; to: string; replyTo: string; subject: string; text: string; configurationSet?: string }) => Promise<void>;

type Deps = {
  config: ContactConfig;
  sendEmail: EmailSender;
  now: () => number;
  log: (entry: Record<string, unknown>) => void;
};

let ses: SESv2Client | undefined;

const sesSender: EmailSender = async ({ from, to, replyTo, subject, text, configurationSet }) => {
  ses ??= new SESv2Client({});
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      ReplyToAddresses: [replyTo],
      ConfigurationSetName: configurationSet,
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: "UTF-8" },
          Body: { Text: { Data: text, Charset: "UTF-8" } },
        },
      },
    }),
  );
};

const defaultLog = (entry: Record<string, unknown>) => console.log(JSON.stringify(entry));

export function createHandler(overrides: Partial<Deps> = {}) {
  return async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
    const log = overrides.log ?? defaultLog;
    const now = overrides.now ?? Date.now;
    const requestId = event.requestContext?.requestId ?? "unknown";
    const origin = header(event, "origin");

    let config: ContactConfig;
    try {
      config = overrides.config ?? loadConfig(process.env);
    } catch (err) {
      log({ level: "error", requestId, outcome: "not_configured", reason: (err as Error).message });
      return respond(503, { ok: false, error: "not_configured" }, origin, null);
    }

    const allowedOrigin = origin && config.allowedOrigins.includes(origin) ? origin : null;
    const fail = (status: number, error: ContactApiErrorCode, extra: Partial<Extract<ContactApiResponse, { ok: false }>> = {}) => {
      log({ level: status >= 500 ? "error" : "warn", requestId, outcome: error, status });
      return respond(status, { ok: false, error, ...extra }, origin, allowedOrigin);
    };

    const method = event.requestContext?.http?.method ?? "";
    if (method === "OPTIONS") return respond(204, null, origin, allowedOrigin);
    if (method !== "POST") return fail(405, "method_not_allowed");

    // Browsers always send Origin on cross-origin POST. Requests without one
    // (curl, scripts) are allowed only when explicitly enabled for testing.
    if (origin ? !allowedOrigin : !config.allowMissingOrigin) return fail(403, "forbidden_origin");

    const contentType = header(event, "content-type") ?? "";
    if (!/^application\/json\b/i.test(contentType)) return fail(415, "unsupported_media_type");

    const raw = event.body ?? "";
    const bodyText = event.isBase64Encoded ? Buffer.from(raw, "base64").toString("utf8") : raw;
    if (Buffer.byteLength(bodyText, "utf8") > LIMITS.bodyBytes) return fail(413, "payload_too_large");

    let json: unknown;
    try {
      json = JSON.parse(bodyText);
    } catch {
      return fail(400, "invalid_json");
    }

    const spam = antiSpamSchema.safeParse(json);
    if (!spam.success) return fail(400, "rejected");
    if (spam.data.website.trim() !== "") return fail(400, "rejected");
    const elapsed = now() - spam.data.startedAt;
    if (elapsed < LIMITS.minFillMs) return fail(400, "rejected");
    if (elapsed > LIMITS.maxFillMs) return fail(400, "expired");

    const parsed = enquirySchema.safeParse(json);
    if (!parsed.success) return fail(422, "validation_failed", { fieldErrors: toFieldErrors(parsed.error) });

    const reference = makeReference(now(), requestId);
    const email = buildNotificationEmail(parsed.data, { reference, receivedAt: new Date(now()), siteName: config.siteName });

    if (config.deliveryMode === "log") {
      // Local development only: validate and acknowledge without sending.
      log({ level: "info", requestId, outcome: "accepted_local_dev", enquiryType: parsed.data.enquiryType, reference });
      return respond(200, { ok: true, reference, mode: "local-dev" }, origin, allowedOrigin);
    }

    try {
      await (overrides.sendEmail ?? sesSender)({
        from: config.fromEmail,
        to: config.recipientEmail,
        replyTo: parsed.data.email,
        subject: email.subject,
        text: email.text,
        configurationSet: config.sesConfigurationSet,
      });
    } catch (err) {
      const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
      log({ level: "error", requestId, outcome: "delivery_failed", errorName: e?.name ?? "Unknown", httpStatus: e?.$metadata?.httpStatusCode });
      return respond(502, { ok: false, error: "delivery_failed" }, origin, allowedOrigin);
    }

    log({ level: "info", requestId, outcome: "sent", enquiryType: parsed.data.enquiryType, reference });
    return respond(200, { ok: true, reference }, origin, allowedOrigin);
  };
}

export const handler = createHandler();

function header(event: APIGatewayProxyEventV2, name: string): string | undefined {
  // HTTP API v2 lower-cases header names.
  return event.headers?.[name] ?? undefined;
}

function makeReference(ts: number, requestId: string) {
  const suffix = requestId.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || "000000";
  return `ARC-${new Date(ts).toISOString().slice(0, 10).replace(/-/g, "")}-${suffix}`;
}

function respond(
  statusCode: number,
  body: ContactApiResponse | null,
  origin: string | undefined,
  allowedOrigin: string | null,
): APIGatewayProxyStructuredResultV2 {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
  };
  if (body) headers["Content-Type"] = "application/json; charset=utf-8";
  // API Gateway's CORS configuration is the primary control; these mirror it
  // so local testing behaves the same. Never echo an unlisted origin.
  if (origin && allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "content-type";
    headers["Access-Control-Max-Age"] = "600";
  }
  return { statusCode, headers, body: body ? JSON.stringify(body) : "" };
}
