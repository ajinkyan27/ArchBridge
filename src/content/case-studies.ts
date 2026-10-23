/**
 * Case studies.
 *
 * The three entries below are ILLUSTRATIVE DEMONSTRATION PROJECTS. They describe
 * how Arcbridge would approach a representative problem. They were not delivered
 * for a client and contain no client data, results or proprietary detail.
 *
 * To publish a verified case study:
 *   1. Obtain written permission from the client.
 *   2. Set `kind: "client"` and fill `client` with the approved attribution.
 *   3. Put only verified, approved figures in `results`.
 * Demonstration entries must keep `kind: "demonstration"`; the UI labels them.
 */

export type CaseStudy = {
  slug: string;
  kind: "demonstration" | "client";
  /** Approved client attribution. Only for kind "client". */
  client?: string;
  title: string;
  /** Short line for cards. */
  summary: string;
  sector: string;
  services: string[];
  context: string;
  problem: string;
  approach: string[];
  /** Ordered stages of the architecture / data flow. */
  dataFlow: { stage: string; detail: string }[];
  functionality: string[];
  /**
   * Validation performed, or verified results for client work.
   * For demonstrations: describe checks and tests, never business outcomes.
   */
  validation: string[];
  technologies: string[];
  lessons: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "warehouse-reporting-modernisation",
    kind: "demonstration",
    title: "Data warehouse and reporting modernisation",
    summary:
      "Re-platforming a legacy reporting database into a layered cloud warehouse with tested transformations and a documented reporting model.",
    sector: "Representative mid-sized business",
    services: ["Cloud data platforms", "Analytics foundations"],
    context:
      "A representative scenario: a business runs month-end reporting from an on-premises SQL database. Reports are built from stored procedures and spreadsheet adjustments that only a few people understand.",
    problem:
      "Reporting logic is duplicated across procedures and spreadsheets, figures differ between reports, and changes are risky because nothing is tested. Refreshes run overnight with no alerting when they fail.",
    approach: [
      "Inventory existing reports and procedures; identify the business rules that genuinely matter.",
      "Design a layered warehouse: raw landing, cleaned and conformed models, then reporting marts.",
      "Rebuild transformations as version-controlled SQL models with tests for keys, nulls and accepted values.",
      "Run old and new outputs side by side and reconcile differences before switching reports over.",
      "Add orchestration, failure alerting and documentation of every reporting measure.",
    ],
    dataFlow: [
      { stage: "Sources", detail: "Operational database extracts and finance spreadsheets" },
      { stage: "Landing", detail: "Raw, immutable copies loaded incrementally" },
      { stage: "Conformed models", detail: "Cleaned, typed and de-duplicated entities with tests" },
      { stage: "Reporting marts", detail: "Documented facts and dimensions for reporting tools" },
      { stage: "Consumption", detail: "Reports and dashboards reading from one governed layer" },
    ],
    functionality: [
      "Incremental loading with idempotent re-runs",
      "Layered SQL models under version control",
      "Automated data tests on every run",
      "Reconciliation queries comparing legacy and new outputs",
      "Run alerting and a measure dictionary",
    ],
    validation: [
      "Model tests for uniqueness, not-null and referential integrity defined for core entities",
      "Side-by-side reconciliation approach defined for migrated measures before cut-over",
      "Failure scenarios (late file, duplicate load, schema change) included in the test plan",
    ],
    technologies: ["SQL", "Azure Data Factory", "Azure Databricks", "Delta Lake", "Git"],
    lessons: [
      "Reconciliation is the migration; budget time for explaining differences, not just moving code.",
      "Document measures as you rebuild them. It is the cheapest point to capture the business rules.",
    ],
  },
  {
    slug: "enterprise-pipeline-engineering",
    kind: "demonstration",
    title: "Enterprise data pipeline engineering",
    summary:
      "Designing reliable, observable batch and incremental pipelines with explicit data contracts, quality gates and safe re-processing.",
    sector: "Representative enterprise data team",
    services: ["Data engineering"],
    context:
      "A representative scenario: an enterprise data team runs dozens of pipelines built over several years by different people, with inconsistent patterns and limited monitoring.",
    problem:
      "Failures are discovered by report users, re-runs sometimes create duplicates, and late or malformed source files flow straight into downstream tables.",
    approach: [
      "Define a standard pipeline pattern: contract check, land, validate, transform, publish.",
      "Make every load idempotent using watermarks and merge semantics.",
      "Introduce quality gates that quarantine bad records rather than failing silently or loading them.",
      "Emit run metadata (row counts, durations, rejects) to a monitoring table with alerting.",
      "Migrate pipelines to the standard pattern in priority order.",
    ],
    dataFlow: [
      { stage: "Source systems", detail: "Files, databases and APIs with agreed schemas" },
      { stage: "Contract check", detail: "Schema and freshness validated before loading" },
      { stage: "Landing", detail: "Raw data stored by load date for safe replay" },
      { stage: "Quality gate", detail: "Rule checks; failing records quarantined with reasons" },
      { stage: "Curated tables", detail: "Merged incrementally and published for consumers" },
    ],
    functionality: [
      "Reusable pipeline template with configuration per source",
      "Watermark-based incremental loads with merge/upsert",
      "Quarantine tables with rejection reasons",
      "Run-metadata logging and threshold-based alerts",
      "Backfill and replay procedure",
    ],
    validation: [
      "Re-run tests confirming identical results after repeated loads (idempotency)",
      "Negative tests with malformed and late files to confirm quarantine and alerting",
      "Row-count and checksum comparisons between landing and curated layers",
    ],
    technologies: ["Python", "SQL", "AWS Glue", "Amazon Redshift", "Amazon S3", "CloudWatch"],
    lessons: [
      "A consistent pattern is worth more than a clever one; it makes every pipeline reviewable.",
      "Quarantining bad data keeps pipelines running and makes data quality visible to owners.",
    ],
  },
  {
    slug: "erp-crm-integration-foundations",
    kind: "demonstration",
    title: "ERP/CRM integration and analytics foundations",
    summary:
      "Integrating ERP and CRM data into a reconciled customer and revenue model that reporting and future AI use cases can rely on.",
    sector: "Representative B2B services business",
    services: ["Analytics & integration", "AI-ready data"],
    context:
      "A representative scenario: sales activity lives in a CRM, orders and invoices in an ERP. Leadership wants one view of customers and revenue, and is starting to consider AI-assisted analysis.",
    problem:
      "Customer identifiers differ between systems, revenue figures do not match between sales and finance, and there is no agreed definition of an active customer.",
    approach: [
      "Agree core definitions (customer, account, active, revenue) with sales and finance owners.",
      "Extract CRM and ERP data incrementally into a common landing area.",
      "Build a customer matching model with deterministic rules and a reviewable exceptions list.",
      "Produce reconciled customer and revenue models, documented and tested.",
      "Assess which curated data could later support AI use cases, and what governance it would need.",
    ],
    dataFlow: [
      { stage: "CRM", detail: "Accounts, contacts and opportunities" },
      { stage: "ERP", detail: "Customers, orders and invoices" },
      { stage: "Integration layer", detail: "Incremental extracts landed side by side" },
      { stage: "Matching & reconciliation", detail: "Customer matching rules and exception review" },
      { stage: "Analytics foundation", detail: "Governed customer and revenue models" },
    ],
    functionality: [
      "Incremental extraction from both systems",
      "Rule-based customer matching with an exceptions queue",
      "Reconciled revenue model with documented definitions",
      "Access controls separating sensitive fields",
      "AI-readiness assessment of curated datasets",
    ],
    validation: [
      "Reconciliation checks between ERP invoice totals and modelled revenue",
      "Match-rule tests using synthetic customer records, including edge cases",
      "Definition sign-off checklist for each shared business term",
    ],
    technologies: ["SQL", "Python", "Azure Data Factory", "Azure Databricks", "Power BI-ready models"],
    lessons: [
      "Integration is as much about agreeing definitions as moving data.",
      "Make matching exceptions visible to the business; they are a data quality backlog, not an engineering failure.",
    ],
  },
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((c) => c.slug === slug);
}
