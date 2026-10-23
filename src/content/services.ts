/**
 * Service catalogue. Edit copy here; the Home, Services and footer components
 * render from this list. `id` is used as the in-page anchor on /services/.
 */

export type ServiceIcon = "pipeline" | "cloud" | "integration" | "foundation" | "leadership";

export type Service = {
  id: string;
  index: string;
  title: string;
  shortTitle: string;
  icon: ServiceIcon;
  /** One-line summary used on the home page pillars. */
  summary: string;
  /** Longer description used on /services/. */
  description: string;
  deliverables: string[];
  idealFor: string[];
  value: string;
  /** Shown as one of the four pillars on the home page. */
  pillar: boolean;
};

export const services: Service[] = [
  {
    id: "data-engineering",
    index: "01",
    title: "Data Engineering",
    shortTitle: "Data engineering",
    icon: "pipeline",
    summary: "Batch and incremental pipelines, ETL/ELT and data models that are tested, observable and easy to change.",
    description:
      "Well-engineered pipelines are the difference between reporting people trust and reporting people re-check by hand. We design and build pipelines with explicit contracts, automated checks and the monitoring you need to run them with confidence.",
    deliverables: [
      "Batch and incremental data pipelines",
      "ETL/ELT development",
      "SQL engineering and data modelling",
      "Data quality checks and reconciliation",
      "Reliability, monitoring and performance optimisation",
    ],
    idealFor: [
      "Teams whose pipelines fail silently or need frequent manual fixes",
      "Organisations moving from scripts and spreadsheets to engineered pipelines",
      "Data teams that need senior capacity for a defined build",
    ],
    value: "Data arrives on time, is validated on the way in, and problems surface before they reach a report.",
    pillar: true,
  },
  {
    id: "cloud-data-platforms",
    index: "02",
    title: "Cloud Data Platforms",
    shortTitle: "Cloud data platforms",
    icon: "cloud",
    summary: "Architecture, migration and modernisation on Azure and AWS, including Databricks, Data Factory, Redshift and Glue.",
    description:
      "A cloud data platform should be understandable, secure and proportionate to the problem. We help you choose and shape the architecture, plan migrations in safe increments, and review existing platforms for reliability, performance and cost.",
    deliverables: [
      "Azure Databricks and Azure Data Factory",
      "Amazon Redshift and AWS Glue",
      "Cloud data platform architecture",
      "Platform migration and modernisation",
      "Performance, reliability and cost reviews",
    ],
    idealFor: [
      "Businesses planning a move from on-premises databases to the cloud",
      "Teams with an existing platform that has grown hard to operate",
      "Leaders who want an independent review before a major investment",
    ],
    value: "A platform your team can operate and extend, with clear environments, deployment practices and cost visibility.",
    pillar: true,
  },
  {
    id: "analytics-integration",
    index: "03",
    title: "Analytics & Data Integration",
    shortTitle: "Analytics & integration",
    icon: "integration",
    summary: "ERP and CRM integration, warehouse modernisation and reporting models that reconcile across systems.",
    description:
      "Most reporting problems start where systems meet. We integrate ERP, CRM and operational sources into maintainable data models, reconcile them against each other, and build the analytics foundations your reports and dashboards depend on.",
    deliverables: [
      "ERP and CRM data integration",
      "Data warehouse modernisation",
      "Reporting and analytics foundations",
      "Cross-system data quality and consistency",
      "Maintainable data models",
    ],
    idealFor: [
      "Finance and operations teams reconciling figures across systems",
      "Organisations replacing an ageing warehouse or reporting stack",
      "Businesses adding a new ERP or CRM to an existing data estate",
    ],
    value: "One consistent, documented view of the business that reporting tools can build on.",
    pillar: true,
  },
  {
    id: "ai-ready-data",
    index: "04",
    title: "AI-Ready Data Foundations",
    shortTitle: "AI-ready data",
    icon: "foundation",
    summary: "Reliable ingestion, governed access and prepared knowledge sources: the groundwork AI applications depend on.",
    description:
      "AI applications are only as dependable as the data behind them. We start with discovery to understand the use case, then prepare the ingestion, access controls, quality checks and knowledge sources needed to support it. We don't promise outcomes the data cannot support.",
    deliverables: [
      "Reliable data ingestion and preparation",
      "Governed access to appropriate data",
      "Knowledge-source preparation for AI applications",
      "Discovery-led AI data architecture",
      "Data quality and operational foundations",
    ],
    idealFor: [
      "Organisations exploring AI use cases and unsure if their data is ready",
      "Teams building retrieval or assistant features on internal knowledge",
      "Leaders who want an honest assessment before committing budget",
    ],
    value: "A clear view of what your data can support today, and the foundations to support more tomorrow.",
    pillar: true,
  },
  {
    id: "contract-engineering",
    index: "05",
    title: "Contract Engineering & Technical Leadership",
    shortTitle: "Technical leadership",
    icon: "leadership",
    summary: "Senior data engineering capacity, architecture reviews and mentoring, alongside your existing team.",
    description:
      "Sometimes the need is for experienced hands rather than a project. We provide specialist data engineering delivery and technical leadership on a contract basis, working inside your team, your tools and your standards.",
    deliverables: [
      "Specialist data engineering delivery",
      "Architecture reviews",
      "Short-term senior engineering capacity",
      "Technical mentoring and engineering standards",
    ],
    idealFor: [
      "Teams that need senior experience without a permanent hire",
      "Projects that need an architecture review or second opinion",
      "Growing data teams establishing engineering standards",
    ],
    value: "Senior judgement where it matters most, with knowledge left behind in your team.",
    pillar: false,
  },
];

export const engagementSteps = [
  {
    title: "Discovery conversation",
    body: "A short call to understand your goals, systems, constraints and what success looks like. No obligation.",
  },
  {
    title: "Requirements and scope",
    body: "We agree the problem to solve, the systems involved, the boundaries of the work and any open questions.",
  },
  {
    title: "Proposal and acceptance criteria",
    body: "A written proposal with deliverables, approach, assumptions, pricing and the criteria we will both use to judge completion.",
  },
  {
    title: "Implementation and review",
    body: "Delivery in small, reviewable increments, with regular demonstrations and decisions recorded as we go.",
  },
  {
    title: "Handover and optional support",
    body: "Documentation, walkthroughs and knowledge transfer so your team can own the result. Ongoing support is available if useful.",
  },
] as const;
