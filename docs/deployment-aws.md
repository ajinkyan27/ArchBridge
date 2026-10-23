# Deploying the website to AWS (S3 + CloudFront) with a GoDaddy domain

```
Browser ──► GoDaddy DNS ──► Amazon CloudFront ──(OAC, signed)──► private Amazon S3 bucket
                              │  ACM certificate (us-east-1)
                              │  CloudFront Function: clean URLs
                              │  Response headers policy: HSTS, CSP, ...
                              └─ 403/404 → /404.html
Contact form (browser) ──► API Gateway ──► Lambda ──► Amazon SES ──► your mailbox   (docs/contact-backend.md)
```

Nothing in this repository creates AWS resources automatically. Every step below is run by you. CloudFront, S3, ACM certificates, Lambda and SES all have costs or free-tier limits; check current AWS pricing for your region before creating resources.

**Before you start, decide:**

1. **AWS region** for the S3 bucket and contact API, e.g. the region closest to most visitors. The certificate is always in **us-east-1**, whatever you choose.
2. **Canonical hostname.** GoDaddy DNS cannot point the bare domain (`arcbridgeanalytics.com`) at CloudFront, because CloudFront needs a CNAME/ALIAS and GoDaddy does not support ALIAS records at the apex. Choose one option:
   - **Option A (simplest, keep GoDaddy DNS):** serve the site at `https://www.arcbridgeanalytics.com` and use GoDaddy *Forwarding* to send the bare domain to it. Set `NEXT_PUBLIC_SITE_URL=https://www.arcbridgeanalytics.com`.
   - **Option B (bare domain as canonical):** keep the *registration* at GoDaddy but move *DNS hosting* to Amazon Route 53 by changing the nameservers at GoDaddy. Route 53 alias records can then point both the bare domain and `www` at CloudFront. Route 53 hosted zones have a small monthly cost.

   Tell the developer which option you chose so the canonical URL is set correctly. The steps below cover both options.

---

## 1. Install and sign in to the AWS CLI

```powershell
winget install Amazon.AWSCLI
aws configure sso          # recommended: IAM Identity Center; or `aws configure` with a dedicated IAM user
aws sts get-caller-identity --profile <your-profile>
```

Enter credentials only in the AWS CLI prompts or the AWS console. Never in this repository, chat tools or `.env` files.

## 2. Request the TLS certificate (ACM, us-east-1)

1. AWS console → **Certificate Manager**. Switch the region selector to **US East (N. Virginia) us-east-1**.
2. **Request** → *Request a public certificate*.
3. Domain names:
   - Option A: `www.arcbridgeanalytics.com` (adding `arcbridgeanalytics.com` too is harmless).
   - Option B: `arcbridgeanalytics.com` and `www.arcbridgeanalytics.com`.
4. Validation method: **DNS validation**.
5. ACM shows one CNAME record per name (*CNAME name* and *CNAME value*). Add each at GoDaddy (step 5 below explains how), or in Route 53 for option B.
6. Wait until the certificate status is **Issued** (usually minutes, sometimes longer). Copy its **ARN**.

## 3. Create the hosting stack

The template [`infrastructure/hosting/template.yaml`](../infrastructure/hosting/template.yaml) creates:

- a **private S3 bucket** (all four *Block Public Access* settings on, encryption, versioning for rollback, TLS-only bucket policy);
- a **CloudFront Origin Access Control (OAC)**, plus a bucket policy that only lets *this* distribution read objects;
- the **url-rewrite CloudFront Function**: `/services/` serves `/services/index.html`, and `/services` redirects to `/services/`;
- a **response headers policy**: HSTS, Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy;
- the **CloudFront distribution**: HTTPS only, HTTP/2+3, managed *CachingOptimized* cache policy, custom error responses so 403 and 404 both show `/404.html` with status 404.

You need the contact API URL first (for the CSP `connect-src`). Deploy the contact API ([contact-backend.md](contact-backend.md)), then take the origin part of `ContactApiUrl`, e.g. `https://abc123.execute-api.<region>.amazonaws.com`.

Validate, then deploy (PowerShell; replace every `<...>`):

```powershell
aws cloudformation validate-template --template-body file://infrastructure/hosting/template.yaml --profile <profile> --region <region>

aws cloudformation deploy `
  --stack-name arcbridge-site `
  --template-file infrastructure/hosting/template.yaml `
  --parameter-overrides `
      "DomainNames=www.arcbridgeanalytics.com" `
      "AcmCertificateArn=<certificate-arn-from-us-east-1>" `
      "ContactApiOrigin=https://<api-id>.execute-api.<region>.amazonaws.com" `
  --profile <profile> --region <region>

aws cloudformation describe-stacks --stack-name arcbridge-site --query "Stacks[0].Outputs" --output table --profile <profile> --region <region>
```

For option B use `"DomainNames=arcbridgeanalytics.com,www.arcbridgeanalytics.com"`.

Note the outputs: **BucketName**, **DistributionId** and **DistributionDomainName** (`dxxxxxxxx.cloudfront.net`).

**Canonical host redirect (optional).** To have CloudFront itself redirect the non-canonical hostname (e.g. bare → `www` in option B), set `var CANONICAL_HOST = "www.arcbridgeanalytics.com";` in *both* `infrastructure/cloudfront/url-rewrite.js` and the copy embedded in the template (a unit test checks they match), then redeploy the stack.

### Prefer the console?

The same setup by hand:

1. S3 → Create bucket (keep *Block all public access* **on**, ACLs disabled, encryption on, versioning on). Do **not** enable static website hosting.
2. CloudFront → Functions → Create `url-rewrite` (runtime cloudfront-js-2.0) → paste [`infrastructure/cloudfront/url-rewrite.js`](../infrastructure/cloudfront/url-rewrite.js) → Publish.
3. CloudFront → Policies → Response headers → Create policy with the values from the template.
4. CloudFront → Create distribution:
   - Origin = the bucket's **REST endpoint** (not the website endpoint), Origin access = **Origin access control settings** → create OAC.
   - Viewer protocol = Redirect HTTP to HTTPS.
   - Cache policy = CachingOptimized; response headers policy = the one from step 3.
   - Function association: Viewer request → CloudFront Functions → `url-rewrite`.
   - Alternate domain names = your hostname(s); custom SSL certificate = the ACM certificate.
   - Default root object = `index.html`.
5. Copy the bucket policy CloudFront offers after creation into the bucket's permissions.
6. Distribution → Error pages → create custom error responses for **403** and **404**: path `/404.html`, response code **404**.

## 4. Build and upload the site

```powershell
Copy-Item .env.example .env.production.local
# Edit .env.production.local:
#   NEXT_PUBLIC_SITE_URL=https://www.arcbridgeanalytics.com     (or the bare domain for option B)
#   NEXT_PUBLIC_CONTACT_API_URL=<ContactApiUrl output from the contact API stack>
#   NEXT_PUBLIC_CONTACT_EMAIL=<optional public address, once the mailbox exists>
npm ci
npm run check            # lint, types, unit tests, production build
npm run preview          # optional: check out/ at http://127.0.0.1:4173

.\scripts\deploy-site.ps1 -Bucket <BucketName> -DistributionId <DistributionId> -Profile <profile> -DryRun
.\scripts\deploy-site.ps1 -Bucket <BucketName> -DistributionId <DistributionId> -Profile <profile>
```

The script:

1. refuses to run without a fresh `out/`, if the build came from the e2e tests, or if the contact API URL is missing (override with `-AllowUnconfiguredContact`);
2. uploads `out/_next/static/**` with `Cache-Control: public, max-age=31536000, immutable`. These filenames are content-hashed, and old ones are kept so pages still cached in browsers keep working;
3. uploads everything else (HTML, RSC `.txt` payloads, sitemap, icons) with `public, max-age=0, s-maxage=300, must-revalidate`, and **deletes** objects no longer in the build (except old hashed assets);
4. creates a CloudFront invalidation for `/*`.

Test the CloudFront domain before changing DNS: open `https://<DistributionDomainName>/`. Expect a certificate-name warning because the certificate is for your domain; the content should still load. Also check `/services/`, `/services` (should redirect) and `/nope/` (should show the 404 page).

### Cache and invalidation strategy

| Content | Cache-Control | Why |
| --- | --- | --- |
| `/_next/static/*` | 1 year, immutable | Filenames change whenever content changes |
| HTML, `.txt` RSC payloads, sitemap, robots, icons | browser revalidates every time; CloudFront ≤ 5 min | Updates appear quickly |

Each deploy invalidates `/*`. CloudFront includes a monthly allowance of free invalidation paths, and a wildcard counts as one path. To invalidate by hand:

```powershell
aws cloudfront create-invalidation --distribution-id <DistributionId> --paths "/*" --profile <profile>
```

## 5. Connect the GoDaddy domain

GoDaddy → **My Products** → your domain → **DNS** (Manage DNS).

**Certificate validation:** for each ACM CNAME, *Add New Record* → Type **CNAME** → *Name* = the ACM CNAME name **without** the trailing `.arcbridgeanalytics.com.` (GoDaddy appends the domain) → *Value* = the ACM CNAME value. Keep these records after the certificate is issued; ACM needs them for automatic renewal.

**Option A: keep GoDaddy DNS, `www` canonical**

1. Find any existing `www` record (often a CNAME to `@` or a parking page) and edit or replace it: Type **CNAME**, Name `www`, Value `<DistributionDomainName>` (e.g. `d1234abcd.cloudfront.net`), TTL 1 hour.
2. Domain → **Forwarding** → *Add forwarding* for `arcbridgeanalytics.com` → destination `https://www.arcbridgeanalytics.com`, type **Permanent (301)**, *Forward only* (no masking).
3. After it propagates, check that `http://arcbridgeanalytics.com` and `https://arcbridgeanalytics.com` both reach `https://www.arcbridgeanalytics.com`. If GoDaddy's forwarding does not serve HTTPS for the bare domain on your plan, use option B.

**Option B: Route 53 DNS hosting, registration stays at GoDaddy**

1. Route 53 → Hosted zones → Create `arcbridgeanalytics.com`. Note its four NS servers.
2. Recreate any existing GoDaddy records you need (especially **MX/TXT for email**, so mail keeps working) in Route 53 first.
3. Add **A** and **AAAA** *Alias* records for `arcbridgeanalytics.com` and `www` → the CloudFront distribution. Add the ACM validation CNAMEs.
4. GoDaddy → domain → **Nameservers** → *Change* → *I'll use my own nameservers* → enter the four Route 53 NS values.

DNS changes can take from minutes up to 48 hours. Check with `Resolve-DnsName www.arcbridgeanalytics.com`.

**Email records:** the contact form sends through SES, and SES domain verification adds DKIM CNAME records (see contact-backend.md). These sit alongside your mailbox provider's MX/SPF records. Don't delete existing MX records.

## 6. Test the production deployment

- [ ] `https://<your-host>/` loads with a valid padlock; `http://` redirects to `https://`.
- [ ] The bare domain and `www` both end up on the canonical host.
- [ ] Load each page directly: `/services/`, `/case-studies/`, `/case-studies/enterprise-pipeline-engineering/`, `/about/`, `/contact/`, `/privacy/`.
- [ ] `/services` (no slash) redirects to `/services/`; `/does-not-exist/` shows the branded 404 page.
- [ ] Header and footer links work and the mobile menu opens on a phone.
- [ ] `/sitemap.xml` and `/robots.txt` load and list the canonical host.
- [ ] Response headers (DevTools → Network → document) include `strict-transport-security` and `content-security-policy`.
- [ ] Browser console shows no errors (CSP violations would appear here).
- [ ] Send a real enquiry. It arrives in the mailbox and **Reply** goes to the sender (see contact-backend.md).
- [ ] Optional: run a Lighthouse audit in Chrome DevTools.

## 7. Roll back

Choose the fastest option that fits:

1. **Redeploy a previous commit** (recommended): `git checkout <good-commit>` → `npm ci` → `npm run build` → `deploy-site.ps1`. Then `git checkout main`.
2. **Restore object versions** (bucket versioning is enabled): in the S3 console, *Show versions*, restore the previous versions of the affected objects, then invalidate `/*`.
3. **GitHub Actions:** re-run the *Deploy website* workflow on an earlier commit (see github-actions.md).

Old `_next/static` assets are never deleted by the deploy script, so rolled-back HTML always finds its assets. To clean up, delete only hashed assets older than your oldest deploy you might roll back to.

## 8. Ongoing operations

- **Certificate renewal** is automatic while the ACM validation CNAMEs stay in DNS.
- **Costs:** S3 storage for a few MB, CloudFront requests and transfer, and Lambda/API Gateway/SES per enquiry. All are low for a brochure site, but set an **AWS Budget** alert anyway.
- **Logs:** CloudFront standard logging is off by default. If you enable it, consider the privacy notice (logs include IP addresses).
