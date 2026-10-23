/**
 * Local development server for the contact API. Wraps the real Lambda handler
 * in a tiny HTTP server so the site can be tested end to end without AWS.
 *
 *   npm run contact:local
 *
 * Defaults to CONTACT_DELIVERY_MODE=log: requests are fully validated but no
 * email is sent, and the site shows a "local development mode" confirmation.
 * Set CONTACT_DELIVERY_MODE=ses plus AWS credentials to send real email via SES.
 */
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { createHandler } from "./handler";

const port = Number(process.env.CONTACT_LOCAL_PORT ?? 8787);
process.env.CONTACT_DELIVERY_MODE ??= "log";
process.env.ALLOWED_ORIGINS ??= "http://localhost:3000,http://127.0.0.1:3000";

const handler = createHandler();

createServer(async (req, res) => {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > 64 * 1024) {
      res.writeHead(413).end();
      return;
    }
    chunks.push(chunk as Buffer);
  }

  const headers = Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(",") : (v ?? "")]));
  const event = {
    version: "2.0",
    routeKey: "POST /enquiries",
    rawPath: req.url ?? "/",
    rawQueryString: "",
    headers,
    isBase64Encoded: false,
    body: Buffer.concat(chunks).toString("utf8"),
    requestContext: { requestId: randomUUID(), http: { method: req.method ?? "GET", path: req.url ?? "/" } },
  } as unknown as APIGatewayProxyEventV2;

  const result = await handler(event);
  res.writeHead(result.statusCode ?? 500, result.headers as Record<string, string>);
  res.end(result.body ?? "");
}).listen(port, () => {
  console.log(`Contact API (mode: ${process.env.CONTACT_DELIVERY_MODE}) listening on http://localhost:${port}/enquiries`);
  console.log(`Set NEXT_PUBLIC_CONTACT_API_URL=http://localhost:${port}/enquiries in .env.local and restart "npm run dev".`);
});
