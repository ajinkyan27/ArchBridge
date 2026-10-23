# Contact form backend (API Gateway → Lambda → Amazon SES)

The website is static, so the enquiry form posts to a separately deployed AWS API:

```
Browser  ──POST JSON──►  API Gateway HTTP API  ──►  Lambda (Node.js 24)  ──►  Amazon SES  ──►  CONTACT_RECIPIENT_EMAIL
           (CORS: your site's origin only; throttled)     validates, rejects spam,           From: CONTACT_FROM_EMAIL
                                                           logs metadata only                  Reply-To: the enquirer
```

| File | Purpose |
| --- | --- |
| `backend/contact-api/src/handler.ts` | Lambda handler: method/origin/content-type/size checks, validation, anti-spam, SES send, safe responses |
| `src/lib/contact/schema.ts` | Zod schema **shared** with the browser form, so client and server validation match |
| `backend/contact-api/src/email.ts` | Plain-text notification email (no HTML, so no injection) |
| `backend/contact-api/src/config.ts` | Reads configuration from environment variables; fails closed if they are missing |
| `backend/contact-api/src/local-server.ts` | Local HTTP wrapper around the real handler (`npm run contact:local`) |
| `backend/contact-api/template.yaml` | AWS SAM template: HTTP API, Lambda, least-privilege IAM, log groups, alarms |
| `backend/contact-api/test/handler.test.ts` | Unit tests (run with `npm test`) |

## Security and abuse controls

| Control | Where |
| --- | --- |
| POST only (OPTIONS answered for CORS preflight) | Lambda; route is `POST /enquiries` |
| CORS limited to listed origins; wildcard `*` refused | API Gateway `CorsConfiguration` + Lambda origin check |
| Requests without an `Origin` header rejected (browsers always send one) | Lambda (`ALLOW_MISSING_ORIGIN=true` only for curl smoke tests) |
| `Content-Type: application/json` required | Lambda |
| Body limit 16 KB (also enforced after base64 decoding) | Lambda (`LIMITS.bodyBytes`) |
| Field validation, length limits, control-character stripping (blocks email header injection) | Shared Zod schema |
| Honeypot field, minimum 3 s fill time, 24 h maximum form age | Form + Lambda |
| Throttling: burst 5, 1 request/second across the API (adjustable parameters) | API Gateway stage |
| Least-privilege IAM: `ses:SendEmail` only, only with `From` = `CONTACT_FROM_EMAIL` | SAM template |
| No AWS keys in Lambda; SES access through the execution role | SAM template |
| Logs: request ID, outcome, enquiry type, SES error *name* only; never names, emails or message text | Lambda; API access logs exclude IPs and bodies |
| Errors: generic codes (`delivery_failed`, `validation_failed`, ...); no stack traces or AWS messages | Lambda |
| Alarms on Lambda errors and API 5xx (optional SNS notification) | SAM template |

**If spam gets through:** lower the throttle, add AWS WAF to the API with rate-based rules (paid), or add a CAPTCHA service such as Cloudflare Turnstile. A CAPTCHA would need a privacy-notice update and a server-side token check in the handler.

## 1. Set up Amazon SES

Use the **same AWS region** for SES and the contact API.

1. **Verify your domain** (recommended over a single address): SES → *Configuration → Identities → Create identity → Domain* → `arcbridgeanalytics.com`, with Easy DKIM enabled. SES shows **3 CNAME records**. Add them at GoDaddy DNS (or Route 53), as described in [deployment-aws.md](deployment-aws.md#5-connect-the-godaddy-domain). Wait for status **Verified**.
2. Choose a **sender address** on that domain, e.g. `no-reply@` or `website@` your domain. It doesn't need a real mailbox, because replies go to the enquirer via Reply-To. This becomes `ContactFromEmail`.
3. Choose the **recipient**: the business mailbox you're creating on your domain. This becomes `ContactRecipientEmail`.
4. **SES sandbox:** new accounts can only send *to verified addresses*. Either:
   - verify the recipient address too (SES → Create identity → Email address → click the link sent to it). That's enough for this form, because it only ever emails your own mailbox; or
   - request **production access** (SES → *Account dashboard → Request production access*), describing the use: transactional notifications of website enquiries to your own mailbox, low volume, no marketing.
5. Recommended: add SPF and DMARC TXT records for your domain as advised by your mailbox provider and SES, so notifications aren't marked as spam.

## 2. Deploy the API with AWS SAM

```powershell
winget install Amazon.SAM-CLI        # once
npm ci
npm run backend:build                # bundles the handler to backend/contact-api/dist/index.mjs
cd backend/contact-api
sam validate --lint
sam deploy --guided --profile <profile> --region <region>
```

At the `--guided` prompts:

| Prompt | Value |
| --- | --- |
| Stack name | e.g. `arcbridge-contact-api` |
| AWS Region | the region where SES is verified |
| ContactRecipientEmail | your business mailbox |
| ContactFromEmail | the sender address on your verified domain |
| AllowedOrigins | production origin(s), comma-separated, no trailing slash, e.g. `https://www.arcbridgeanalytics.com,https://arcbridgeanalytics.com`. For a separate dev stack you may add `http://localhost:3000`. |
| SesConfigurationSet / AlarmTopicArn | leave empty unless you created them |
| Throttle / LogRetentionDays | keep the defaults |
| Allow SAM CLI IAM role creation | `Y` (creates the least-privilege execution role) |
| Save arguments to samconfig.toml | `Y`. The file is git-ignored. |

Copy the **ContactApiUrl** output, e.g. `https://abc123.execute-api.<region>.amazonaws.com/enquiries`. It's a public URL, not a secret. Use it as `NEXT_PUBLIC_CONTACT_API_URL` when building the site.

To update later: `npm run backend:build`, then `cd backend/contact-api; sam deploy`.

> **Runtime:** the template uses `nodejs24.x` on arm64. If `sam deploy` reports the runtime as unsupported in your region, change `Runtime` to `nodejs22.x`. The bundle targets Node 22+.

## 3. Test end to end

**Locally, without AWS:** see README → *Try the contact form locally*.

**Against the deployed API with curl** (PowerShell; shows the CORS and validation behaviour):

```powershell
$api = "<ContactApiUrl>"
# Missing Origin -> 403 forbidden_origin (expected)
curl.exe -s -i -X POST $api -H "content-type: application/json" -d "{}"
# Allowed origin, invalid body -> 400 rejected (anti-spam fields missing; expected)
curl.exe -s -i -X POST $api -H "origin: https://www.arcbridgeanalytics.com" -H "content-type: application/json" -d "{}"
```

**Real submission:** build the site with `NEXT_PUBLIC_CONTACT_API_URL` set and submit the form from an allowed origin (the deployed site, or `npm run dev` if the stack allows `http://localhost:3000`). Expect:

1. the success message with a reference such as `ARC-20261023-1A2B3C`;
2. an email in the recipient mailbox with that reference, and **Reply** addressed to the enquirer;
3. CloudWatch → Log groups → the function's group: one line with `"outcome":"sent"` and **no personal data**.

**Failure paths worth checking once:**

- Submit with the sandbox recipient unverified → the form says *could not be delivered*, the log shows `"outcome":"delivery_failed","errorName":"MessageRejected"`, and the API 5xx alarm fires.
- Submit from an origin not in `AllowedOrigins` → the browser console shows a CORS error and the form says *couldn't reach the server*.

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| `delivery_failed`, log `MessageRejected` | Sender or (in sandbox) recipient identity not verified in **this region**; or the From address isn't on the verified domain. |
| `delivery_failed`, log `AccessDeniedException` | The From address differs from the `ContactFromEmail` the IAM condition allows; redeploy with matching values. |
| `not_configured` (503) | Lambda environment variables missing or invalid; check the stack parameters. |
| Browser: CORS error, form says *couldn't reach the server* | Site origin missing from `AllowedOrigins` (exact scheme and host, no trailing slash), or wrong API URL. |
| 429 / *too many enquiries* | Throttle reached; raise `ThrottleRateLimit` / `ThrottleBurstLimit` if genuine traffic needs it. |
| Emails land in spam | Add SPF/DMARC records; keep DKIM records in place; use a From address on your own domain. |
