// Loads infrastructure/cloudfront/url-rewrite.js (a CloudFront Function with no
// module syntax) into a sandbox so it can be run locally and in tests.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const source = readFileSync(fileURLToPath(new URL("../infrastructure/cloudfront/url-rewrite.js", import.meta.url)), "utf8");

export function loadUrlRewrite({ canonicalHost = "" } = {}) {
  const context = vm.createContext({});
  vm.runInContext(`${source}\nCANONICAL_HOST = ${JSON.stringify(canonicalHost)};`, context);
  return /** @type {(event: unknown) => any} */ (context.handler);
}

/** Builds a minimal viewer-request event. */
export function viewerRequest(uri, { host = "localhost", query = {} } = {}) {
  const querystring = Object.fromEntries(Object.entries(query).map(([k, v]) => [k, { value: v }]));
  return { request: { uri, method: "GET", headers: { host: { value: host } }, querystring } };
}
