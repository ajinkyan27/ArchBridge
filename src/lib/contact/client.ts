import type { ContactApiResponse, FieldErrors, Submission } from "./schema";

export type SubmitResult =
  | { status: "success"; reference: string; localDev: boolean }
  | { status: "invalid"; fieldErrors: FieldErrors; message: string }
  | { status: "error"; message: string };

const messages = {
  network: "We couldn't reach the server. Please check your connection and try again.",
  timeout: "The request took too long. Please try again in a moment.",
  rateLimited: "Too many enquiries have been sent recently. Please wait a few minutes and try again.",
  expired: "This form has been open for a long time. Please reload the page and try again.",
  rejected: "Your enquiry could not be accepted. Please try again, or reload the page first.",
  delivery: "Your enquiry was received but could not be delivered just now. Please try again shortly.",
  generic: "Something went wrong and your enquiry was not sent. Please try again.",
  invalid: "Please correct the highlighted fields.",
} as const;

/**
 * Posts an enquiry to the AWS contact API. Only a 2xx response with
 * `{ ok: true }` counts as success; every other outcome is reported as a failure.
 */
export async function submitEnquiry(
  apiUrl: string,
  payload: Submission,
  { timeoutMs, fetchImpl = fetch }: { timeoutMs: number; fetchImpl?: typeof fetch },
): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetchImpl(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
      credentials: "omit",
      mode: "cors",
    });
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === "AbortError";
    return { status: "error", message: aborted ? messages.timeout : messages.network };
  } finally {
    clearTimeout(timer);
  }

  let body: ContactApiResponse | null = null;
  try {
    body = (await res.json()) as ContactApiResponse;
  } catch {
    body = null;
  }

  if (res.ok && body && body.ok === true && typeof body.reference === "string") {
    return { status: "success", reference: body.reference, localDev: body.mode === "local-dev" };
  }

  if (res.status === 429) return { status: "error", message: messages.rateLimited };

  if (body && body.ok === false) {
    switch (body.error) {
      case "validation_failed":
        return { status: "invalid", fieldErrors: body.fieldErrors ?? {}, message: messages.invalid };
      case "expired":
        return { status: "error", message: messages.expired };
      case "rejected":
        return { status: "error", message: messages.rejected };
      case "delivery_failed":
        return { status: "error", message: messages.delivery };
    }
  }
  return { status: "error", message: messages.generic };
}
