/** Home page copy. Edit freely; keep claims factual and avoid promised outcomes. */

export const hero = {
  eyebrow: "Data engineering · Cloud platforms · AI-ready data",
  headline: "Bridge the gap between your data and your next breakthrough.",
  body: "We build reliable cloud data platforms, connect enterprise systems, and create AI-ready data foundations for ambitious businesses.",
  primaryCta: "Discuss your project",
  secondaryCta: "Explore our services",
} as const;

export const valueProposition = {
  eyebrow: "Why Arcbridge",
  statement: "Most data problems are connection problems.",
  body: "Numbers disagree because systems disagree. Reports break because pipelines were never designed to be run. AI projects stall because the data underneath them is not ready. We work at those connection points, between systems, between teams and between data and decisions.",
  points: [
    {
      title: "Engineering-led",
      body: "Tested, version-controlled, observable data systems, built to be operated, not just demonstrated.",
    },
    {
      title: "Business-aware",
      body: "We start from the decisions your data needs to support, and agree definitions before writing code.",
    },
    {
      title: "Foundations first",
      body: "Reliable pipelines and trusted models come before dashboards and AI, because everything else depends on them.",
    },
  ],
} as const;

export const outcomes = {
  eyebrow: "What we work towards",
  title: "Outcomes that hold up after we leave.",
  intro: "Every engagement is scoped against outcomes like these, with acceptance criteria agreed up front. We don't promise savings or results we cannot measure with you.",
  items: [
    {
      title: "Dependable pipelines",
      body: "Data that arrives on schedule, is validated on the way in, and alerts the right people when something goes wrong.",
    },
    {
      title: "Connected enterprise systems",
      body: "ERP, CRM and operational data integrated with clear ownership, agreed definitions and reconciliation built in.",
    },
    {
      title: "Trusted reporting",
      body: "One documented model behind your reports, so meetings are spent on decisions rather than on whose numbers are right.",
    },
    {
      title: "Maintainable platforms",
      body: "Architecture, code and documentation your own team can understand, operate and extend.",
    },
    {
      title: "Foundations for AI",
      body: "Governed, well-described data that future analytics and AI use cases can build on safely.",
    },
  ],
} as const;

export const homeProcess = [
  { title: "Discover", body: "Understand your goals, systems, data and constraints. Identify what matters most and what is getting in the way." },
  { title: "Design", body: "Agree scope, architecture and acceptance criteria. Make trade-offs explicit before building anything." },
  { title: "Build", body: "Deliver in small, tested increments with regular reviews, so progress is visible and course-correction is cheap." },
  { title: "Improve", body: "Hand over with documentation and knowledge transfer, then refine based on how the solution is actually used." },
] as const;
