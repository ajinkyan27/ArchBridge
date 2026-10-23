import { budgetRanges, enquiryTypes, labelFor, timelines, type Enquiry } from "../../../src/lib/contact/schema";

/**
 * Builds the plain-text notification sent to the business mailbox.
 * Plain text only: no HTML, so submitted content cannot inject markup.
 * Header-bound values (subject) are single-line after schema normalisation.
 */
export function buildNotificationEmail(e: Enquiry, meta: { reference: string; receivedAt: Date; siteName: string }) {
  const type = labelFor(enquiryTypes, e.enquiryType);
  const subject = truncate(`[${meta.siteName}] New enquiry: ${type} from ${e.name}`, 180);

  const lines = [
    `New website enquiry (${meta.reference})`,
    `Received: ${meta.receivedAt.toISOString()}`,
    "",
    `Name:         ${e.name}`,
    `Email:        ${e.email}`,
    `Company:      ${e.company || "Not provided"}`,
    `Enquiry type: ${type}`,
    `Budget:       ${e.budget ? labelFor(budgetRanges, e.budget) : "Not provided"}`,
    `Timeline:     ${e.timeline ? labelFor(timelines, e.timeline) : "Not provided"}`,
    `Privacy notice acknowledged: yes`,
    "",
    "Project summary",
    "---------------",
    e.summary,
    "",
    "Reply to this email to respond directly to the sender.",
  ];

  return { subject, text: lines.join("\n") };
}

function truncate(s: string, max: number) {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
