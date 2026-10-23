# Owner checklist: placeholders, decisions and external setup

Everything below needs owner input before (or soon after) launch. Nothing here was invented. Where a fact was unknown, the site shows a clearly marked placeholder or hides the element.

## Decisions

- [ ] **Canonical hostname:** `www.arcbridgeanalytics.com` (keep GoDaddy DNS, forward the bare domain) or `arcbridgeanalytics.com` (move DNS hosting to Route 53). See deployment-aws.md. Then set `NEXT_PUBLIC_SITE_URL`. The code default is `https://arcbridgeanalytics.com`.
- [ ] **AWS region** for S3, the contact API and SES.
- [ ] **CloudFront price class:** `PriceClass_100` (default, North America and Europe edges) or `PriceClass_All` for clients in Asia-Pacific.
- [ ] **Founder profile:** publish it, or hide it by setting `founder.show = false` in `src/content/about.ts`.

## Content to supply (`src/content/about.ts`)

Placeholders are highlighted in amber on the About page until replaced.

- [ ] Founder name
- [ ] Role/title (currently a suggested "Founder & Principal Data Engineer"; confirm or change)
- [ ] Short professional summary (no employer names unless approved)
- [ ] Relevant experience, in non-confidential terms
- [ ] 3 focus areas
- [ ] Optional: approved portrait. Replace the logo placeholder in `src/app/about/page.tsx` and add descriptive alt text.
- [ ] Optional: founder LinkedIn URL (`founder.linkedInUrl`)

## Privacy notice (`src/app/privacy/page.tsx`)

- [ ] Legal entity name and registered address
- [ ] Lawful basis for processing enquiries (depends on jurisdiction)
- [ ] AWS region(s) used and mailbox provider
- [ ] Email retention period; CloudWatch log retention (template default: 30 days)
- [ ] Jurisdiction-specific rights and supervisory authority
- [ ] `lastUpdated` date
- [ ] **Review by a qualified adviser.** Remove the "draft" banner only after review.

## Environment and accounts (no secrets go in the repository)

- [ ] Business mailbox on your domain → `ContactRecipientEmail` (SAM parameter)
- [ ] Sender address on your domain → `ContactFromEmail` (SAM parameter)
- [ ] SES domain verification (DKIM CNAMEs at GoDaddy) and production access or a verified recipient
- [ ] ACM certificate in **us-east-1** for your hostname(s), with validation CNAMEs at GoDaddy
- [ ] `NEXT_PUBLIC_CONTACT_API_URL` = the contact API stack output
- [ ] Optional `NEXT_PUBLIC_CONTACT_EMAIL` (public address shown on the site)
- [ ] Optional `NEXT_PUBLIC_LINKEDIN_URL` (company page)
- [ ] AWS Budget alert

## Content you may want to revisit

- **Case studies** (`src/content/case-studies.ts`) are labelled *Illustrative demonstration projects* on every card, list page and detail page. Replace them with verified client case studies only with written client permission. Follow the steps in that file's header comment.
- **Budget ranges** on the contact form (`src/lib/contact/schema.ts → budgetRanges`) are generic bands with no currency. Adjust them to how you price.
- **Social sharing image** (`src/app/opengraph-image.png`) was generated from the brand artwork. Replace it with a designed 1200×630 PNG if preferred, and update `opengraph-image.alt.txt`.
- **Analytics:** none installed. If you add a provider later, update the privacy notice and consider whether you need a consent banner first.

## Not yet verified (requires your AWS account)

- Deploying the SAM contact API and sending real email through SES
- Deploying the hosting CloudFormation stack, the CloudFront Function and the response headers policy (including whether the CSP produces any console warnings in production)
- GoDaddy DNS, forwarding and certificate validation
- The GitHub Actions deploy workflow (CI workflow runs on the first push)
