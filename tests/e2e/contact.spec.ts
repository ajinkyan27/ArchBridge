import { expect, test, type Page, type Route } from "@playwright/test";

// Must match scripts/build-e2e.mjs.
const API = "https://contact-api.e2e.invalid/enquiries";

async function fillValid(page: Page) {
  await page.locator("#field-name").fill("Ada Lovelace");
  await page.locator("#field-email").fill("ada@example.com");
  await page.locator("#field-company").fill("Engines Ltd");
  await page.locator("#field-enquiryType").selectOption({ label: "Cloud platform modernisation" });
  await page.locator("#field-summary").fill("We would like a review of our Redshift platform cost and reliability.");
  await page.locator("#field-timeline").selectOption({ label: "Exploring options" });
  await page.getByRole("checkbox", { name: /privacy notice/ }).check();
}

const reply = (status: number, body: unknown) => (route: Route) =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body), headers: { "access-control-allow-origin": "*" } });

test.beforeEach(async ({ page }) => {
  await page.goto("/contact/");
});

test("shows actionable errors for invalid input and does not submit", async ({ page }) => {
  let calls = 0;
  await page.route(API, (r) => {
    calls++;
    return r.abort();
  });
  await page.locator("#field-email").fill("not-an-email");
  await page.getByRole("button", { name: /Send enquiry/ }).click();

  const summary = page.getByRole("alert").filter({ hasText: "Please fix" });
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveCount(5);

  const email = page.locator("#field-email");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator("#field-email-error")).toContainText("valid email");
  await expect(email).toHaveAttribute("aria-describedby", /field-email-error/);

  await summary.getByRole("link", { name: /Name/ }).click();
  await expect(page).toHaveURL(/#field-name$/);
  expect(calls).toBe(0);
});

test("submits a valid enquiry and shows success only after the API accepts it", async ({ page }) => {
  let body: Record<string, unknown> | null = null;
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  await page.route(API, async (route) => {
    body = route.request().postDataJSON();
    await gate;
    await reply(200, { ok: true, reference: "ARC-20261023-ABC123" })(route);
  });

  await fillValid(page);
  await page.getByRole("button", { name: /Send enquiry/ }).click();

  // Loading state while the request is in flight; no premature success.
  await expect(page.getByRole("button", { name: /Sending/ })).toBeDisabled();
  await expect(page.getByText("Thank you")).toHaveCount(0);
  release();

  const status = page.getByRole("status");
  await expect(status).toContainText("Thank you, your enquiry has been sent.");
  await expect(status).toContainText("ARC-20261023-ABC123");

  expect(body).toMatchObject({
    name: "Ada Lovelace",
    email: "ada@example.com",
    enquiryType: "cloud-platform",
    timeline: "exploring",
    privacyAcknowledged: true,
    website: "",
  });
  expect(typeof body!.startedAt).toBe("number");
});

test("reports an email delivery failure and keeps the user's input", async ({ page }) => {
  await page.route(API, reply(502, { ok: false, error: "delivery_failed" }));
  await fillValid(page);
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  const alert = page.getByRole("alert").filter({ hasText: "not sent" });
  await expect(alert).toContainText("could not be delivered");
  await expect(page.locator("#field-name")).toHaveValue("Ada Lovelace");
  await expect(page.getByText("Thank you")).toHaveCount(0);
});

test("reports server-side validation errors against the right field", async ({ page }) => {
  await page.route(API, reply(422, { ok: false, error: "validation_failed", fieldErrors: { email: "That domain cannot receive email." } }));
  await fillValid(page);
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  await expect(page.locator("#field-email-error")).toContainText("That domain cannot receive email.");
});

test("reports network failures", async ({ page }) => {
  await page.route(API, (r) => r.abort("internetdisconnected"));
  await fillValid(page);
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "not sent" })).toContainText("couldn't reach the server");
});

test("reports rate limiting", async ({ page }) => {
  await page.route(API, reply(429, { message: "Too Many Requests" }));
  await fillValid(page);
  await page.getByRole("button", { name: /Send enquiry/ }).click();
  await expect(page.getByRole("alert").filter({ hasText: "not sent" })).toContainText("Too many enquiries");
});

test("form is fully keyboard operable", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard test on desktop");
  await page.route(API, reply(200, { ok: true, reference: "ARC-KEYBOARD" }));
  await page.locator("#field-name").focus();
  await page.keyboard.type("Grace Hopper");
  await page.keyboard.press("Tab");
  await page.keyboard.type("grace@example.com");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(page.locator("#field-enquiryType")).toBeFocused();
  await page.locator("#field-enquiryType").selectOption("data-engineering");
  await page.keyboard.press("Tab");
  await page.keyboard.type("We need help modernising nightly batch pipelines.");
  await page.getByRole("checkbox", { name: /privacy notice/ }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: /Send enquiry/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("ARC-KEYBOARD");
});

test("form controls have accessible names", async ({ page }) => {
  await expect(page.getByRole("textbox", { name: "Name" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Work email" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Company" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Enquiry type" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Project summary" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Budget range" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Desired timeline" })).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /privacy notice/ })).toBeVisible();
  // The honeypot is hidden from assistive technology.
  await expect(page.getByRole("textbox", { name: "Website" })).toHaveCount(0);
});
