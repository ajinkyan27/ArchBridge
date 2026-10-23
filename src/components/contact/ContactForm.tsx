"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { contactConfig, siteConfig } from "@/config/site";
import {
  budgetRanges,
  enquirySchema,
  enquiryTypes,
  LIMITS,
  timelines,
  toFieldErrors,
  type EnquiryField,
  type FieldErrors,
} from "@/lib/contact/schema";
import { submitEnquiry } from "@/lib/contact/client";
import { Button } from "@/components/ui/Button";
import { describedBy, FieldShell, Input, Select, StatusMessage, Textarea } from "@/components/ui/Field";

type Values = {
  name: string;
  email: string;
  company: string;
  enquiryType: string;
  summary: string;
  budget: string;
  timeline: string;
  privacyAcknowledged: boolean;
};

const initialValues: Values = {
  name: "",
  email: "",
  company: "",
  enquiryType: "",
  summary: "",
  budget: "",
  timeline: "",
  privacyAcknowledged: false,
};

const fieldOrder: EnquiryField[] = ["name", "email", "company", "enquiryType", "summary", "budget", "timeline", "privacyAcknowledged"];

const fieldLabels: Record<EnquiryField, string> = {
  name: "Name",
  email: "Work email",
  company: "Company",
  enquiryType: "Enquiry type",
  summary: "Project summary",
  budget: "Budget range",
  timeline: "Desired timeline",
  privacyAcknowledged: "Privacy acknowledgement",
};

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; reference: string; localDev: boolean }
  | { kind: "error"; message: string };

function validate(values: Values): FieldErrors {
  const result = enquirySchema.safeParse(values);
  return result.success ? {} : toFieldErrors(result.error);
}

export function ContactForm({ apiUrl = contactConfig.apiUrl }: { apiUrl?: string | null }) {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<EnquiryField, boolean>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [showSummary, setShowSummary] = useState(false);
  const startedAt = useRef<number>(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Recorded in the browser (not at build time) for the minimum-fill-time check.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (showSummary) summaryRef.current?.focus();
  }, [showSummary]);

  useEffect(() => {
    if (status.kind === "success" || status.kind === "error") statusRef.current?.focus();
  }, [status]);

  const configured = Boolean(apiUrl);
  const submitting = status.kind === "submitting";

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (touched[key] || errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: validate(next)[key] }));
    }
  }

  function blur(key: EnquiryField) {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors((prev) => ({ ...prev, [key]: validate(values)[key] }));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting || !apiUrl) return;

    const parsed = enquirySchema.safeParse(values);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setTouched(Object.fromEntries(fieldOrder.map((f) => [f, true])));
      setShowSummary(false);
      // Re-trigger focus even if the summary was already showing.
      requestAnimationFrame(() => setShowSummary(true));
      return;
    }

    setShowSummary(false);
    setErrors({});
    setStatus({ kind: "submitting" });

    const result = await submitEnquiry(
      apiUrl,
      { ...parsed.data, website: honeypot.current?.value ?? "", startedAt: startedAt.current || Date.now() },
      { timeoutMs: contactConfig.requestTimeoutMs },
    );

    if (result.status === "success") {
      setStatus({ kind: "success", reference: result.reference, localDev: result.localDev });
      setValues(initialValues);
      setTouched({});
    } else if (result.status === "invalid") {
      setErrors(result.fieldErrors);
      setStatus({ kind: "error", message: result.message });
    } else {
      setStatus({ kind: "error", message: result.message });
    }
  }

  if (status.kind === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} className="focus:outline-none">
        <StatusMessage tone="success" role="status" title={status.localDev ? "Enquiry validated (local development mode)" : "Thank you, your enquiry has been sent."}>
          {status.localDev ? (
            <p>
              The local development API accepted the enquiry. No email was sent. Reference: <span className="font-mono text-fg">{status.reference}</span>
            </p>
          ) : (
            <>
              <p>We have received your message and will reply by email to the address you provided.</p>
              <p className="mt-2">
                Reference: <span className="font-mono text-fg">{status.reference}</span>
              </p>
            </>
          )}
        </StatusMessage>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus({ kind: "idle" })}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  const errorList = fieldOrder.filter((f) => errors[f]);
  const err = (f: EnquiryField) => (touched[f] || status.kind === "error" ? errors[f] : undefined);
  const summaryHint = `${values.summary.trim().length} / ${LIMITS.summaryMax} characters. Please don't include confidential or personal data.`;

  return (
    <form noValidate onSubmit={onSubmit} aria-describedby="form-required-note" className="space-y-7">
      {!configured && (
        <StatusMessage tone="warning" role="note" title="Online enquiries are not enabled yet">
          <p>
            The enquiry service for this site has not been configured, so this form cannot send messages yet.
            {siteConfig.contactEmail ? (
              <>
                {" "}
                Please email{" "}
                <a className="font-medium text-accent-400 underline underline-offset-4 hover:text-accent-300" href={`mailto:${siteConfig.contactEmail}`}>
                  {siteConfig.contactEmail}
                </a>{" "}
                instead.
              </>
            ) : (
              " Please check back soon."
            )}
          </p>
        </StatusMessage>
      )}

      {showSummary && errorList.length > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby="error-summary-title" className="rounded-md border border-danger/50 bg-danger/5 p-4 focus:outline-none">
          <p id="error-summary-title" className="font-semibold text-fg">
            Please fix {errorList.length === 1 ? "1 problem" : `${errorList.length} problems`} before sending:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {errorList.map((f) => (
              <li key={f}>
                <a href={`#field-${f}`} className="text-danger underline underline-offset-4 hover:text-fg">
                  {fieldLabels[f]}: {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status.kind === "error" && (
        <div ref={statusRef} tabIndex={-1} className="focus:outline-none">
          <StatusMessage tone="error" role="alert" title="Your enquiry was not sent">
            <p>{status.message}</p>
          </StatusMessage>
        </div>
      )}

      <p id="form-required-note" className="text-sm text-fg-subtle">
        Fields marked <span className="text-accent-400">*</span> are required.
      </p>

      <fieldset disabled={!configured || submitting} className="space-y-7 disabled:opacity-90">
        <legend className="sr-only">Your enquiry</legend>
        <div className="grid gap-7 sm:grid-cols-2">
          <FieldShell id="field-name" label="Name" required error={err("name")}>
            <Input
              id="field-name"
              name="name"
              autoComplete="name"
              required
              maxLength={LIMITS.name}
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              onBlur={() => blur("name")}
              invalid={Boolean(err("name"))}
              aria-describedby={describedBy("field-name", { error: err("name") })}
            />
          </FieldShell>
          <FieldShell id="field-email" label="Work email" required error={err("email")}>
            <Input
              id="field-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              required
              maxLength={LIMITS.email}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              onBlur={() => blur("email")}
              invalid={Boolean(err("email"))}
              aria-describedby={describedBy("field-email", { error: err("email") })}
            />
          </FieldShell>
        </div>

        <div className="grid gap-7 sm:grid-cols-2">
          <FieldShell id="field-company" label="Company" error={err("company")}>
            <Input
              id="field-company"
              name="company"
              autoComplete="organization"
              maxLength={LIMITS.company}
              value={values.company}
              onChange={(e) => update("company", e.target.value)}
              onBlur={() => blur("company")}
              invalid={Boolean(err("company"))}
              aria-describedby={describedBy("field-company", { error: err("company") })}
            />
          </FieldShell>
          <FieldShell id="field-enquiryType" label="Enquiry type" required error={err("enquiryType")}>
            <Select
              id="field-enquiryType"
              name="enquiryType"
              required
              value={values.enquiryType}
              onChange={(e) => update("enquiryType", e.target.value)}
              onBlur={() => blur("enquiryType")}
              invalid={Boolean(err("enquiryType"))}
              aria-describedby={describedBy("field-enquiryType", { error: err("enquiryType") })}
            >
              <option value="" disabled>
                Choose one…
              </option>
              {enquiryTypes.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FieldShell>
        </div>

        <FieldShell id="field-summary" label="Project summary" required hint="What are you trying to achieve, and what systems are involved?" error={err("summary")}>
          <Textarea
            id="field-summary"
            name="summary"
            required
            rows={7}
            maxLength={LIMITS.summaryMax}
            value={values.summary}
            onChange={(e) => update("summary", e.target.value)}
            onBlur={() => blur("summary")}
            invalid={Boolean(err("summary"))}
            aria-describedby={[describedBy("field-summary", { hint: true, error: err("summary") }), "field-summary-count"].join(" ")}
          />
          <p id="field-summary-count" className="mt-2 text-xs text-fg-subtle">
            {summaryHint}
          </p>
        </FieldShell>

        <div className="grid gap-7 sm:grid-cols-2">
          <FieldShell id="field-budget" label="Budget range" hint="Approximate, in your currency." error={err("budget")}>
            <Select
              id="field-budget"
              name="budget"
              value={values.budget}
              onChange={(e) => update("budget", e.target.value)}
              aria-describedby={describedBy("field-budget", { hint: true, error: err("budget") })}
            >
              {budgetRanges.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FieldShell>
          <FieldShell id="field-timeline" label="Desired timeline" hint="When would you ideally like to start?" error={err("timeline")}>
            <Select
              id="field-timeline"
              name="timeline"
              value={values.timeline}
              onChange={(e) => update("timeline", e.target.value)}
              aria-describedby={describedBy("field-timeline", { hint: true, error: err("timeline") })}
            >
              {timelines.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </FieldShell>
        </div>

        {/* Honeypot: hidden from people and assistive technology; bots often fill it. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="field-website">Website</label>
          <input ref={honeypot} id="field-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div>
          <div className="flex items-start gap-3">
            <input
              id="field-privacyAcknowledged"
              name="privacyAcknowledged"
              type="checkbox"
              checked={values.privacyAcknowledged}
              onChange={(e) => {
                update("privacyAcknowledged", e.target.checked);
                setTouched((t) => ({ ...t, privacyAcknowledged: true }));
              }}
              aria-invalid={Boolean(err("privacyAcknowledged")) || undefined}
              aria-describedby={err("privacyAcknowledged") ? "field-privacyAcknowledged-error" : undefined}
              className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-sm accent-accent-500"
            />
            <label htmlFor="field-privacyAcknowledged" className="cursor-pointer text-sm leading-relaxed text-fg-muted">
              I have read the{" "}
              <Link href="/privacy/" className="font-medium text-accent-400 underline underline-offset-4 hover:text-accent-300">
                privacy notice
              </Link>{" "}
              and understand my details will be used to respond to this enquiry.
              <span aria-hidden className="ml-1 text-accent-400">
                *
              </span>
            </label>
          </div>
          {err("privacyAcknowledged") && (
            <p id="field-privacyAcknowledged-error" className="mt-2 ml-8 text-sm text-danger">
              <span className="sr-only">Error: </span>
              {err("privacyAcknowledged")}
            </p>
          )}
        </div>
      </fieldset>

      <div className="flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-fg-subtle">We use your details only to respond to this enquiry. No marketing lists.</p>
        <Button type="submit" size="lg" disabled={!configured || submitting} aria-disabled={!configured || submitting} className="sm:min-w-48">
          {submitting ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              Send enquiry
              <Send aria-hidden className="size-4" />
            </>
          )}
        </Button>
      </div>
      <p aria-live="polite" className="sr-only">
        {submitting ? "Sending your enquiry…" : ""}
      </p>
    </form>
  );
}
