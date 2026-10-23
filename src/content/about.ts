/**
 * About page copy.
 *
 * FOUNDER PROFILE: every field marked `placeholder: true` must be replaced with
 * owner-approved facts before launch. Do not add employer names, client names
 * or certifications without explicit approval. Set `founder.show` to false to
 * hide the section entirely.
 */

export const purpose = {
  title: "Why Arcbridge Analytics exists.",
  paragraphs: [
    "Many organisations already have the systems and the data they need. What they lack is the connection between them: pipelines that run reliably, models that reconcile, and definitions people agree on.",
    "Arcbridge Analytics is a specialist consultancy set up to build those connections properly. We focus on the engineering work that makes analytics trustworthy and AI feasible, and we do it in a way your own team can understand and own.",
  ],
};

export const approach = [
  {
    title: "Engineering-led",
    body: "Version control, automated tests, code review, monitoring and documentation are part of the work, not extras.",
  },
  {
    title: "Foundations before features",
    body: "Reliable ingestion, quality checks and well-modelled data come before dashboards and AI, because everything downstream depends on them.",
  },
  {
    title: "Maintainable by design",
    body: "We favour clear, conventional solutions over clever ones, so the result stays operable long after the engagement ends.",
  },
];

export const principles = [
  { title: "Clarity", body: "Plain language, explicit scope, written decisions. You always know what is being built and why." },
  { title: "Reliability", body: "Systems designed to be run: tested, observable and recoverable when something goes wrong." },
  { title: "Security", body: "Least-privilege access, careful handling of sensitive data and no shortcuts with credentials." },
  { title: "Transparency", body: "Honest estimates, visible progress and early warning when something is harder than expected." },
  { title: "Practical delivery", body: "Proportionate solutions that solve the real problem, delivered in small, reviewable increments." },
];

export const collaboration = {
  title: "We work alongside your team.",
  body: "As a specialist consultancy, we join your engineers, analysts and business owners rather than working in isolation. We use your repositories, follow your standards where they exist, help establish them where they do not, and plan the handover from the first week.",
  points: [
    "Shared repositories, tickets and documentation from day one",
    "Regular demonstrations to technical and business stakeholders",
    "Pairing and walkthroughs so knowledge stays with your team",
    "Remote-first, working across time zones by agreement",
  ],
};

export type FounderField = { value: string; placeholder: boolean };

export const founder = {
  show: true,
  name: { value: "[Founder name]", placeholder: true } as FounderField,
  role: { value: "Founder & Principal Data Engineer", placeholder: true } as FounderField,
  bio: [
    { value: "[Short professional summary: areas of focus and the kinds of problems you enjoy solving. Owner to supply.]", placeholder: true },
    { value: "[Relevant experience described in approved, non-confidential terms. Do not name current or past employers without approval.]", placeholder: true },
  ] as FounderField[],
  focusAreas: [
    { value: "[Focus area, e.g. a platform you specialise in]", placeholder: true },
    { value: "[Focus area]", placeholder: true },
    { value: "[Focus area]", placeholder: true },
  ] as FounderField[],
  /** Optional public profile URL. Leave empty to hide. */
  linkedInUrl: "",
};
