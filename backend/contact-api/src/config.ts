/**
 * Lambda configuration, read from environment variables set by the SAM
 * template (backend/contact-api/template.yaml). No values are hard-coded.
 */
export type ContactConfig = {
  recipientEmail: string;
  fromEmail: string;
  allowedOrigins: string[];
  siteName: string;
  sesConfigurationSet?: string;
  /** "ses" sends email; "log" (local development only) validates without sending. */
  deliveryMode: "ses" | "log";
  /** Allow requests without an Origin header (curl smoke tests). Default false. */
  allowMissingOrigin: boolean;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function loadConfig(env: Record<string, string | undefined>): ContactConfig {
  const deliveryMode = env.CONTACT_DELIVERY_MODE === "log" ? "log" : "ses";
  const recipientEmail = env.CONTACT_RECIPIENT_EMAIL?.trim() ?? "";
  const fromEmail = env.CONTACT_FROM_EMAIL?.trim() ?? "";
  const allowedOrigins = (env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);

  if (deliveryMode === "ses") {
    if (!EMAIL.test(recipientEmail)) throw new Error("CONTACT_RECIPIENT_EMAIL is missing or invalid");
    if (!EMAIL.test(fromEmail)) throw new Error("CONTACT_FROM_EMAIL is missing or invalid");
  }
  if (allowedOrigins.length === 0) throw new Error("ALLOWED_ORIGINS is empty");
  if (allowedOrigins.some((o) => o === "*")) throw new Error("ALLOWED_ORIGINS must list explicit origins, not *");

  return {
    recipientEmail,
    fromEmail,
    allowedOrigins,
    siteName: env.SITE_NAME?.trim() || "Arcbridge Analytics",
    sesConfigurationSet: env.SES_CONFIGURATION_SET?.trim() || undefined,
    deliveryMode,
    allowMissingOrigin: env.ALLOW_MISSING_ORIGIN === "true",
  };
}
