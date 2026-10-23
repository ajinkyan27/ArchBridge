import Link from "next/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { Container, PageHeader } from "@/components/ui/Layout";
import { StatusMessage } from "@/components/ui/Field";

export const metadata = pageMetadata({
  title: "Privacy notice",
  description: "How Arcbridge Analytics handles the information you submit through this website.",
  path: "/privacy/",
});

/*
 * OWNER: this notice describes how the site is actually built (static pages,
 * no cookies or analytics, contact form → AWS API Gateway/Lambda → Amazon SES →
 * business mailbox). Review it with a qualified adviser for the jurisdictions
 * you operate in, fill the bracketed items, then update `lastUpdated`.
 */
const lastUpdated = "[Date to be confirmed on review]";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy notice" intro={`Last updated: ${lastUpdated}`} />
      <Container className="py-16">
        <div className="max-w-3xl">
          <StatusMessage tone="warning" role="note" title="Draft notice pending review">
            <p>This notice describes how this website currently handles data. It has not yet been reviewed by a legal adviser.</p>
          </StatusMessage>

          <div className="mt-12 space-y-10 leading-relaxed text-fg-muted [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-fg [&_li]:mt-2 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
            <section>
              <h2>Who we are</h2>
              <p>
                This website is operated by {siteConfig.name} ([legal entity name and registered address to be confirmed]). For any
                privacy question, contact us via the <Link href="/contact/" className="text-accent-400 underline underline-offset-4">contact page</Link>
                {siteConfig.contactEmail ? ` or at ${siteConfig.contactEmail}` : ""}.
              </p>
            </section>

            <section>
              <h2>What we collect</h2>
              <p>We only collect information you choose to send through the enquiry form:</p>
              <ul>
                <li>your name and work email address (required);</li>
                <li>your company name, budget range and desired timeline (optional);</li>
                <li>the enquiry type and project summary you write.</li>
              </ul>
              <p>
                Please do not include confidential, sensitive or personal data about other people in your project summary.
              </p>
            </section>

            <section>
              <h2>Cookies and analytics</h2>
              <p>
                This website does not set cookies and does not use analytics, advertising or tracking scripts. Fonts are served from this
                website rather than a third party. If this changes, this notice will be updated first.
              </p>
            </section>

            <section>
              <h2>How we use your information</h2>
              <p>
                We use the details you submit only to read and respond to your enquiry and, if you choose to proceed, to discuss a possible
                engagement. We do not add you to marketing lists or sell or share your details.
              </p>
              <p>[Lawful basis, e.g. legitimate interests in responding to business enquiries, to be confirmed on review.]</p>
            </section>

            <section>
              <h2>How your enquiry is processed</h2>
              <ul>
                <li>The form sends your enquiry over an encrypted (HTTPS) connection to an API hosted on Amazon Web Services (AWS).</li>
                <li>The API validates the enquiry and uses Amazon Simple Email Service (SES) to email it to our business mailbox.</li>
                <li>
                  The API does not store your enquiry in a database. Operational logs record technical details such as the time of the
                  request and whether it succeeded; they are designed not to contain the content of your message.
                </li>
                <li>AWS region(s) used: [to be confirmed]. Email mailbox provider: [to be confirmed].</li>
              </ul>
            </section>

            <section>
              <h2>How long we keep it</h2>
              <p>
                Enquiry emails are kept in our mailbox for as long as needed to handle the enquiry and any resulting engagement, and then
                deleted. [Retention period to be confirmed.] Operational logs are retained for a limited period ([to be confirmed], e.g. 30
                days).
              </p>
            </section>

            <section>
              <h2>Your choices</h2>
              <p>
                You can ask us what information we hold about you, ask us to correct it or ask us to delete it by contacting us. [Add any
                jurisdiction-specific rights and the relevant supervisory authority after review.]
              </p>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
}
