// Builds a static export for end-to-end tests with a fake contact API URL
// (requests to it are intercepted by Playwright), then moves it out of `out/`
// so a test build can never be uploaded by mistake.
import { spawnSync } from "node:child_process";
import { cpSync, rmSync } from "node:fs";

export const E2E_API_URL = "https://contact-api.e2e.invalid/enquiries";
const target = ".e2e-site";

const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_CONTACT_API_URL: E2E_API_URL, NEXT_PUBLIC_ALLOW_INDEXING: "false" },
});
if (result.status !== 0) process.exit(result.status ?? 1);
spawnSync(process.execPath, ["scripts/fix-export-segments.mjs", "out"], { stdio: "inherit" });

rmSync(target, { recursive: true, force: true });
cpSync("out", target, { recursive: true });
rmSync("out", { recursive: true, force: true });

console.log(`E2E site exported to ${target}`);
