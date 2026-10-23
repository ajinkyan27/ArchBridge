# Arcbridge Analytics website

Marketing website for **Arcbridge Analytics**: *Bridging Data. Building Intelligence.*

- **Frontend:** Next.js 16 (App Router) static export: plain HTML/CSS/JS in `out/`, hosted on a private Amazon S3 bucket behind CloudFront.
- **Contact form backend:** a separate serverless API (API Gateway HTTP API → Lambda → Amazon SES) in `backend/contact-api/`.
- **No server, database, CMS, cookies or analytics.**

| Topic | Document |
| --- | --- |
| Deploying the site to S3 + CloudFront, GoDaddy DNS, rollback | [docs/deployment-aws.md](docs/deployment-aws.md) |
| Contact API, Amazon SES, CORS, end-to-end form testing | [docs/contact-backend.md](docs/contact-backend.md) |
| Optional GitHub Actions deployment (OIDC) | [docs/github-actions.md](docs/github-actions.md) |
| Placeholders and decisions the owner still needs to make | [docs/owner-checklist.md](docs/owner-checklist.md) |

---

## 1. Prerequisites (Windows)

| Tool | Version | Install |
| --- | --- | --- |
| Node.js | 24 LTS (22.12+ works) | <https://nodejs.org> LTS installer, or `winget install OpenJS.NodeJS.LTS` |
| npm | Bundled with Node.js | — |
| Git | Any recent | `winget install Git.Git` |
| AWS CLI v2 | For deployment only | `winget install Amazon.AWSCLI` |
| AWS SAM CLI | For the contact API only | `winget install Amazon.SAM-CLI` |
| Claude Code (optional) | Latest | <https://claude.com/claude-code> |

Open a **new** PowerShell window after installing so `node`, `npm` and `git` are on your `PATH`. Check:

```powershell
node -v; npm -v; git --version
```

## 2. Run locally

```powershell
git clone https://github.com/ajinkyan27/ArchBridge.git arcbridge-analytics
cd arcbridge-analytics
npm ci
Copy-Item .env.example .env.local     # then edit .env.local if needed
npm run dev
```

Open <http://localhost:3000>. Pages reload as you edit.

Keep the project **outside OneDrive** (for example `C:\Users\<you>\dev\`). Syncing `node_modules` and `.next` causes file-lock errors.

### Environment variables

All configuration lives in [`src/config/site.ts`](src/config/site.ts), which reads these variables from `.env.local` (development) or `.env.production.local` (production builds). They are compiled into the public site, so **never put secrets in them**.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, e.g. `https://arcbridgeanalytics.com`. Used for canonical links, Open Graph, sitemap and robots. |
| `NEXT_PUBLIC_CONTACT_API_URL` | Public URL of the contact API. When empty, the form shows an honest "not enabled yet" message and cannot be submitted. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Optional public email shown on the contact page and footer. |
| `NEXT_PUBLIC_LINKEDIN_URL` | Optional LinkedIn page. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `false` for staging builds (adds `noindex` and a disallow-all robots.txt). |

Restart `npm run dev` after changing them.

### Try the contact form locally (no AWS needed)

```powershell
# Terminal 1: the real Lambda handler behind a local HTTP server; validates but does not send email
npm run contact:local

# Terminal 2: set NEXT_PUBLIC_CONTACT_API_URL=http://localhost:8787/enquiries in .env.local, then
npm run dev
```

Submit the form. You'll get a "local development mode" confirmation with a reference number, and the API terminal logs metadata only.

## 3. Quality checks

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` (strict mode) |
| `npm test` | Vitest unit tests: form schema, submission client, Lambda handler, CloudFront function, content and template integrity |
| `npm run test:e2e` | Builds a test export into `.e2e-site/` and runs Playwright (desktop + mobile Chromium) against a local server that emulates CloudFront |
| `npm run check` | lint + typecheck + unit tests + production build |

First-time Playwright setup: `npx playwright install chromium`.

`npm run test:e2e` intercepts calls to a fake contact API, so it never sends email. It writes to `.e2e-site/`, never to `out/`, so a test build can't be deployed by mistake.

## 4. Production build

```powershell
Copy-Item .env.example .env.production.local   # fill in production values
npm run build
npm run preview                                # serves out/ at http://127.0.0.1:4173 with CloudFront-style routing
```

`out/` then contains the complete site:

```
out/index.html, out/404.html
out/services/index.html, out/about/index.html, out/contact/index.html, out/privacy/index.html
out/case-studies/index.html, out/case-studies/<slug>/index.html
out/sitemap.xml, out/robots.txt, out/icon.svg, out/apple-icon.png, out/opengraph-image.png
out/_next/static/...                            (hashed JS/CSS/fonts, safe to cache forever)
```

> **Windows note:** Next.js 16.4.2 writes some prefetch files into the wrong folders when building on Windows. `npm run build` runs `scripts/fix-export-segments.mjs` afterwards to correct this. It does nothing on Linux/macOS.

## 5. Deploy

Summary only. Follow [docs/deployment-aws.md](docs/deployment-aws.md) the first time.

1. Deploy the contact API with SAM and note its `ContactApiUrl` ([docs/contact-backend.md](docs/contact-backend.md)).
2. Create the hosting stack (S3 + CloudFront + OAC + ACM certificate in us-east-1).
3. Build with production values, then upload:
   ```powershell
   npm run build
   .\scripts\deploy-site.ps1 -Bucket <bucket-name> -DistributionId <distribution-id> -Profile <aws-profile> -DryRun
   .\scripts\deploy-site.ps1 -Bucket <bucket-name> -DistributionId <distribution-id> -Profile <aws-profile>
   ```
4. Point the GoDaddy DNS records at CloudFront.

## 6. Project structure

```
src/
  app/                 Routes: page.tsx (home), services/, case-studies/ (+ [slug]/), about/, contact/, privacy/,
                       not-found.tsx, sitemap.ts, robots.ts, icon.svg, apple-icon.png, opengraph-image.png, globals.css
  config/site.ts       Site settings and environment-driven configuration
  content/             Editable copy: home.ts, services.ts, case-studies.ts, about.ts
  components/
    brand/             Logo and SVG artwork (arc/bridge motif)
    layout/            Header, desktop and mobile navigation, footer
    sections/          Service cards, case study cards, process track, CTA panel
    contact/           Contact form (the only sizeable client component)
    ui/                Buttons, layout primitives, form fields, status messages
  lib/                 Contact schema (shared with the Lambda), submission client, metadata helpers
backend/contact-api/   Lambda handler, SES email builder, local dev server, SAM template, tests
infrastructure/        CloudFront function, hosting CloudFormation template, GitHub OIDC role template
scripts/               Deploy script, e2e build, CloudFront-emulating static server, screenshots
tests/                 unit/ (Vitest) and e2e/ (Playwright)
.github/workflows/     ci.yml (checks on push/PR), deploy-site.yml (manual, OIDC)
```

Design tokens (colours, fonts, radii, motion) are defined once in `src/app/globals.css` under `@theme` and used through Tailwind utilities such as `bg-ink-950`, `text-fg-muted` and `border-line`.

### Editing content

- **Services:** `src/content/services.ts`
- **Case studies:** `src/content/case-studies.ts`. Read the header comment before publishing a real client case study.
- **About and founder profile:** `src/content/about.ts`. Placeholders are highlighted on the page until replaced.
- **Home page copy:** `src/content/home.ts`
- **Privacy notice:** `src/app/privacy/page.tsx`

## 7. Troubleshooting

| Problem | Fix |
| --- | --- |
| `node` / `npm` not recognised | Open a new terminal after installing Node.js; check `$env:Path`. |
| `EPERM` / file locked during build | Stop `npm run dev` first; keep the project out of OneDrive; exclude it from antivirus real-time scanning if needed. |
| "Another next dev server is already running" | Stop the other `npm run dev`, or `taskkill /PID <pid> /F` using the PID it prints. |
| Contact form says "not enabled yet" | `NEXT_PUBLIC_CONTACT_API_URL` is empty. Set it and restart dev / rebuild. |
| Form shows "couldn't reach the server" | Wrong API URL, API not deployed, or the site's origin is missing from the API's `AllowedOrigins` (CORS). Check the browser console. |
| Form shows "could not be delivered" | SES rejected the email. See [docs/contact-backend.md](docs/contact-backend.md#troubleshooting). |
| Playwright: "Executable doesn't exist" | `npx playwright install chromium` |
| Deep links return 403/AccessDenied on CloudFront | The url-rewrite CloudFront Function isn't attached, or the 403→`/404.html` custom error response is missing. |
