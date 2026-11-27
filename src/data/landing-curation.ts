/**
 * Landing-page editorial choices live here so featured content remains
 * deliberate and easy to review. Latest content is derived separately.
 */
export const portfolioCuration = {
  work: [
    'work/infinid-platform-engineering',
    'work/csg-product-rd-engineering',
    'work/bca-ledger-and-data-pipelines',
  ],
  caseStudies: [
    'writing/krakend-repeatable-gateway-delivery',
    'writing/domain-expert-configuration-playground',
    'writing/legacy-batch-to-sql-pipelines',
  ],
  projects: [
    'projects/public-knowledge-hub',
    'projects/krakend-iac-toolkit',
    'projects/applied-cv-thesis-system',
  ],
  contributions: [
    'contributions/dicoding-partner-programs',
    'contributions/enterprise-it-operations-instruction',
    'contributions/student-mentoring-programs',
    'contributions/community-technical-contribution',
  ],
  credentials: [
    'credentials/bachelor-computer-science',
    'credentials/peer-reviewed-cv-publication',
    'credentials/aws-certified-cloud-practitioner',
  ],
} as const;

export const corpusCuration = {
  featured: [
    'writing/krakend-repeatable-gateway-delivery',
    'knowledge/idempotency-as-a-system-property',
    'sketches/krakend-iac-workflow',
    'writing/domain-expert-configuration-playground',
    'knowledge/reasoning-about-boundaries',
    'sketches/oauth-authorization-code-flow',
  ],
} as const;

export const iconOverrides: Record<string, string> = {
  'projects/public-knowledge-hub': 'publishing',
  'projects/krakend-iac-toolkit': 'network',
  'projects/applied-cv-thesis-system': 'research',
  'contributions/global-one-on-one-mentoring': 'mentoring',
  'contributions/community-technical-contribution': 'community',
  'credentials/peer-reviewed-cv-publication': 'research',
};
