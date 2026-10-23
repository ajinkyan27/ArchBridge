// Bundles the contact API for AWS Lambda (and the local dev server).
//   node backend/contact-api/build.mjs          -> dist/index.mjs (Lambda)
//   node backend/contact-api/build.mjs --local  -> .local/server.mjs, then runs it
import { build } from "esbuild";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const local = process.argv.includes("--local");

const outfile = path.join(here, local ? ".local/server.mjs" : "dist/index.mjs");

await build({
  entryPoints: [path.join(here, local ? "src/local-server.ts" : "src/handler.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  minify: !local,
  sourcemap: local ? "inline" : false,
  legalComments: "none",
  // Lets bundled CommonJS dependencies call require() inside an ES module.
  banner: { js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" },
  logLevel: "info",
});

if (local) {
  spawn(process.execPath, ["--enable-source-maps", outfile], { stdio: "inherit" }).on("exit", (code) => process.exit(code ?? 0));
}
