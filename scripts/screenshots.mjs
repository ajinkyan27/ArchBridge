// Captures full-page screenshots of each route at several widths for visual review.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir] [route...]
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [baseUrl = "http://localhost:3000", outDir = "test-results/screenshots", ...routeArgs] = process.argv.slice(2);
const routes = routeArgs.length ? routeArgs : ["/", "/services/", "/case-studies/", "/about/", "/contact/"];
const widths = [
  { name: "mobile-360", width: 360, height: 780 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const vp of widths) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    for (const route of routes) {
      await page.goto(new URL(route, baseUrl).toString(), { waitUntil: "networkidle" });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      const file = path.join(outDir, `${vp.name}${route.replace(/\//g, "_") || "_"}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`${file}${overflow > 0 ? `  [horizontal overflow ${overflow}px]` : ""}`);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
