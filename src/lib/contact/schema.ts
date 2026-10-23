import { z } from "zod";

/**
 * Contact enquiry schema shared by the browser form and the AWS Lambda handler
 * (backend/contact-api). The Lambda bundles this file, so server validation and
 * client validation can never drift apart.
 */

export const enquiryTypes = [
  { value: "data-engineering", label: "Data engineering project" },
  { value: "cloud-platform", label: "Cloud platform modernisation" },
  { value: "analytics-integration", label: "Analytics or data integration" },
  { value: "ai-ready-data", label: "AI-ready data foundations" },
  { value: "contract-engineering", label: "Contract engineering" },
  { value: "other", label: "Other" },
] as const;

export const budgetRanges = [
  { value: "", label: "Prefer not to say" },
  { value: "under-10k", label: "Under 10,000 (USD/GBP/EUR equivalent)" },
  { value: "10k-25k", label: "10,000 – 25,000" },
  { value: "25k-50k", label: "25,000 – 50,000" },
  { value: "50k-plus", label: "50,000+" },
  { value: "not-sure", label: "Not sure yet" },
] as const;

export const timelines = [
  { value: "", label: "Prefer not to say" },
  { value: "asap", label: "As soon as possible" },
  { value: "1-3-months", label: "Within 1–3 months" },
  { value: "3-6-months", label: "Within 3–6 months" },
  { value: "exploring", label: "Exploring options" },
] as const;

type OptionValues<T extends readonly { value: string }[]> = T[number]["value"];
const values = <T extends readonly { value: string }[]>(options: T) =>
  options.map((o) => o.value) as [OptionValues<T>, ...OptionValues<T>[]];

export const LIMITS = {
  name: 120,
  email: 254,
  company: 160,
  summaryMin: 20,
  summaryMax: 4000,
  /** Max accepted JSON body in bytes (enforced by the Lambda). */
  bodyBytes: 16 * 1024,
  /** Submissions completed faster than this are treated as automated. */
  minFillMs: 3000,
  /** Form sessions older than this are rejected; the user is asked to reload. */
  maxFillMs: 24 * 60 * 60 * 1000,
} as const;

/** Strips control characters (incl. CR/LF, which could inject email headers). */
const singleLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
/** Keeps newlines and tabs in free text but removes other control characters. */
const multiLine = (s: string) =>
  s
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "")
    .trim();

export const enquirySchema = z.object({
  name: z
    .string({ error: "Please enter your name." })
    .transform(singleLine)
    .pipe(
      z
        .string()
        .min(1, "Please enter your name.")
        .max(LIMITS.name, `Please keep your name under ${LIMITS.name} characters.`),
    ),
  email: z
    .string({ error: "Please enter your work email." })
    .transform((s) => singleLine(s).toLowerCase())
    .pipe(
      z
        .string()
        .min(1, "Please enter your work email.")
        .max(LIMITS.email, "That email address is too long.")
        .pipe(z.email("Please enter a valid email address, for example name@company.com.")),
    ),
  company: z
    .string()
    .optional()
    .default("")
    .transform(singleLine)
    .pipe(z.string().max(LIMITS.company, `Please keep the company name under ${LIMITS.company} characters.`)),
  enquiryType: z.enum(values(enquiryTypes), { error: "Please choose an enquiry type." }),
  summary: z
    .string({ error: "Please tell us about your project." })
    .transform(multiLine)
    .pipe(
      z
        .string()
        .min(LIMITS.summaryMin, `Please add a little more detail (at least ${LIMITS.summaryMin} characters).`)
        .max(LIMITS.summaryMax, `Please keep the summary under ${LIMITS.summaryMax} characters.`),
    ),
  budget: z.enum(values(budgetRanges), { error: "Please choose a budget range from the list." }).optional().default(""),
  timeline: z.enum(values(timelines), { error: "Please choose a timeline from the list." }).optional().default(""),
  privacyAcknowledged: z.literal(true, { error: "Please confirm you have read the privacy notice." }),
});

/** Anti-spam fields sent alongside the enquiry; validated separately. */
export const antiSpamSchema = z.object({
  /** Honeypot: hidden from people, often filled by bots. Must be empty. */
  website: z.string().max(200).optional().default(""),
  /** Epoch ms when the form was rendered. */
  startedAt: z.number().int().positive(),
});

export const submissionSchema = enquirySchema.extend(antiSpamSchema.shape);

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;
export type Submission = z.output<typeof submissionSchema>;
export type EnquiryField = keyof Enquiry;

export type FieldErrors = Partial<Record<EnquiryField, string>>;

/** Flattens a Zod error into one message per field. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && key in enquirySchema.shape && !(key in out)) {
      out[key as EnquiryField] = issue.message;
    }
  }
  return out;
}

export function labelFor<T extends readonly { value: string; label: string }[]>(options: T, value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Response body returned by the contact API. */
export type ContactApiResponse =
  | { ok: true; reference: string; mode?: "local-dev" }
  | { ok: false; error: ContactApiErrorCode; fieldErrors?: FieldErrors };

export type ContactApiErrorCode =
  | "method_not_allowed"
  | "forbidden_origin"
  | "unsupported_media_type"
  | "payload_too_large"
  | "invalid_json"
  | "validation_failed"
  | "rejected"
  | "expired"
  | "delivery_failed"
  | "not_configured"
  | "internal_error";
