import { expect, test, type Page } from "@playwright/test";

const pages = [
  { path: "/", h1: /Bridge the gap between your data/ },
  { path: "/services/", h1: /Specialist data engineering/ },
  { path: "/case-studies/", h1: /How we approach common data problems/ },
  { path: "/about/", h1: /engineering-led consultancy/i },
  { path: "/contact/", h1: /Discuss your project/ },
  { path: "/privacy/", h1: /Privacy notice/ },
  { path: "/case-studies/enterprise-pipeline-engineering/", h1: /Enterprise data pipeline engineering/ },
];

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text()}`));
  page.on("response", (r) => r.status() >= 400 && !r.url().includes("does-not-exist") && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}

for (const p of pages) {
  test(`direct navigation renders ${p.path}`, async ({ page }) => {
    const errors = trackErrors(page);
    const res = await page.goto(p.path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.h1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/Arcbridge Analytics/);
    expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "horizontal overflow").toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("paths without a trailing slash still resolve", async ({ page }) => {
  const res = await page.goto("/services");
  expect(res?.status()).toBe(200);
  await expect(page).toHaveURL(/\/services\/$/);
});

test("unknown routes show the custom 404 page", async ({ page }) => {
  const res = await page.goto("/does-not-exist/");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/doesn.t lead anywhere/);
  await page.getByRole("link", { name: "Go to the home page" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("every internal link on every page resolves", async ({ page, request }) => {
  const seen = new Set<string>();
  for (const p of pages) {
    await page.goto(p.path);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
    for (const href of hrefs) {
      if (/^(https?:|mailto:)/.test(href)) continue;
      const url = new URL(href, page.url());
      const key = url.pathname;
      if (url.hash && url.pathname === new URL(page.url()).pathname) {
        expect(await page.locator(url.hash).count(), `anchor ${href} on ${p.path}`).toBe(1);
      }
      if (seen.has(key)) continue;
      seen.add(key);
      const res = await request.get(key);
      expect(res.status(), `link ${href} from ${p.path}`).toBe(200);
    }
  }
  expect(seen.size).toBeGreaterThan(8);
});

test("service anchors from the home page land on the right section", async ({ page }) => {
  await page.goto("/services/#ai-ready-data");
  await expect(page.locator("#ai-ready-data h2")).toHaveText(/AI-Ready Data Foundations/);
});

test("demonstration case studies are clearly labelled", async ({ page }) => {
  await page.goto("/case-studies/");
  await expect(page.getByText("Illustrative demonstration project", { exact: true })).toHaveCount(3);
  await page.goto("/case-studies/warehouse-reporting-modernisation/");
  await expect(page.getByRole("note")).toContainText("not delivered for a client");
});

test.describe("navigation", () => {
  test("desktop nav marks the current page and CTAs work", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop only");
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Main" });
    await nav.getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/\/services\/$/);
    await expect(nav.getByRole("link", { name: "Services" })).toHaveAttribute("aria-current", "page");
    await page.getByRole("banner").getByRole("link", { name: "Discuss your project" }).click();
    await expect(page).toHaveURL(/\/contact\/$/);
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: "Explore our services" }).first().click();
    await expect(page).toHaveURL(/\/services\/$/);
  });

  test("mobile menu opens, navigates, and closes with Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();

    await page.getByRole("button", { name: "Open menu" }).click();
    await menu.getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(menu).toBeHidden();
  });

  test("skip link moves focus to main content", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard test on desktop");
    await page.goto("/services/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });
});

test("sitemap and robots are published", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/case-studies/enterprise-pipeline-engineering/");
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
});
