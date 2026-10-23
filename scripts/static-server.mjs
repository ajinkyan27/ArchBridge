// Serves a static export the way CloudFront + private S3 will:
//   1. runs the real CloudFront Function (url-rewrite.js) on each request;
//   2. serves the resulting object key, or
//   3. returns /404.html with status 404 (the distribution's custom error response).
// Usage: node scripts/static-server.mjs [dir=out] [port=4173]
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { loadUrlRewrite } from "./cloudfront-function.mjs";

const root = path.resolve(process.argv[2] ?? "out");
const port = Number(process.argv[3] ?? 4173);
const rewrite = loadUrlRewrite();

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

async function tryFile(key) {
  const file = path.join(root, decodeURIComponent(key));
  if (!file.startsWith(root)) return null;
  try {
    if (!(await stat(file)).isFile()) return null;
    return { body: await readFile(file), type: types[path.extname(file)] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  const query = Object.fromEntries([...url.searchParams].map(([k, v]) => [k, { value: v }]));
  const result = rewrite({ request: { uri: url.pathname, method: req.method, headers: { host: { value: req.headers.host ?? "" } }, querystring: query } });

  if (result.statusCode) {
    const headers = Object.fromEntries(Object.entries(result.headers ?? {}).map(([k, v]) => [k, v.value]));
    res.writeHead(result.statusCode, headers).end();
    return;
  }

  const found = await tryFile(result.uri);
  if (found) {
    res.writeHead(200, { "Content-Type": found.type }).end(req.method === "HEAD" ? undefined : found.body);
    return;
  }
  const notFound = await tryFile("/404.html");
  res.writeHead(404, { "Content-Type": types[".html"] }).end(notFound?.body ?? "Not found");
}).listen(port, "127.0.0.1", () => console.log(`Serving ${root} at http://127.0.0.1:${port} (CloudFront rewrite emulation)`));
