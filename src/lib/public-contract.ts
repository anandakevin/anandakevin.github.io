import { z } from 'astro/zod';

export const publicIdSchema = z
  .string()
  .regex(
    /^(pages|work|projects|contributions|writing|credentials|social|sketches|knowledge)\/[a-z0-9]+(?:[a-z0-9_-]*[a-z0-9])?(?:\/[a-z0-9]+(?:[a-z0-9_-]*[a-z0-9])?)*$/,
    'Invalid public content ID.',
  );

export const publicRelationSchema = z.object({
  relation: z.enum([
    'extracted_from',
    'case_study_of',
    'derived_from',
    'part_of',
    'includes',
    'produced',
    'related_implementation',
    'related_to',
    'verifies',
    'used_in',
  ]),
  target: publicIdSchema,
});

export const contributionTypeValueSchema = z.enum([
  'instructor',
  'facilitator',
  'mentor',
  'curriculum-lead',
  'reviewer',
]);

export const contributionTypeSchema = z.array(contributionTypeValueSchema).min(1);

export const projectCategoryValueSchema = z.enum([
  'backend',
  'platform-devops',
  'automation',
  'ml-research',
  'open-source',
  'applications',
  'publishing',
]);

export const projectCategorySchema = z.array(projectCategoryValueSchema).min(1);
export type ProjectCategory = z.infer<typeof projectCategoryValueSchema>;

export const projectDestinationSchema = z.enum(['detail', 'external']);
export const projectGroupSchema = z.enum(['core-engineering', 'experiments-community']);

export const mapDomainSchema = z.enum([
  'engineering/backend-platform-delivery',
  'engineering/systems-data-reliability',
  'engineering/applied-ml-product',
  'learning-education',
  'knowledge-publishing',
]);
export const mapProminenceSchema = z.enum(['landmark', 'normal']);
export const mapMetadataSchema = z.object({
  domains: z.array(mapDomainSchema).min(1),
  prominence: mapProminenceSchema.default('normal'),
});
export type MapDomain = z.infer<typeof mapDomainSchema>;
export type MapMetadata = z.infer<typeof mapMetadataSchema>;

export const PUBLIC_RELATION_LABELS: Record<
  z.infer<typeof publicRelationSchema>['relation'],
  string
> = {
  extracted_from: 'derived from',
  case_study_of: 'case study of',
  derived_from: 'derived from',
  part_of: 'part of',
  includes: 'includes',
  produced: 'produced',
  related_implementation: 'related implementation',
  related_to: 'related context',
  verifies: 'verifies',
  used_in: 'used in',
};

export function publicRelationLabel(relation: string): string {
  return (
    PUBLIC_RELATION_LABELS[relation as keyof typeof PUBLIC_RELATION_LABELS] ??
    relation.replaceAll('_', ' ')
  );
}

export const contentKindSchema = z.enum([
  'page',
  'work',
  'project',
  'contribution',
  'article',
  'note',
  'case_study',
  'proof',
  'social_post',
  'sketch',
  'knowledge',
  'knowledge_domain',
]);

export type KnowledgeArea = {
  id: string;
  title: string;
  description: string;
  children: KnowledgeArea[];
};

export const knowledgeAreaSchema: z.ZodType<KnowledgeArea> = z.lazy(() =>
  z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: z.string().min(1),
    description: z.string().min(1),
    children: z.array(z.lazy(() => knowledgeAreaSchema)).default([]),
  }),
);

export const knowledgeReadingSchema = z.object({
  parent: publicIdSchema.optional(),
  prerequisites: z.array(publicIdSchema).default([]),
  previous: publicIdSchema.optional(),
  next: publicIdSchema.optional(),
  nearby: z.array(publicIdSchema).default([]),
});

export const knowledgePathStepSchema = z.object({
  page: publicIdSchema,
  label: z.string().min(1).optional(),
});

export const knowledgeReferenceSchema = z.object({
  title: z.string().min(1),
  url: z.string().refine((value) => /^https?:\/\//.test(value), 'URL must use http(s).'),
  note: z.string().min(1).optional(),
});

export const writingModeSchema = z.enum(['editorial', 'reference']);
export const fieldNoteSectionSchema = z.enum(['engineering-systems', 'learning-practice']);
export type WritingMode = z.infer<typeof writingModeSchema>;
export type FieldNoteSection = z.infer<typeof fieldNoteSectionSchema>;

export const engagementTypeSchema = z.enum([
  'full_time',
  'part_time',
  'volunteer',
  'contract',
  'freelance',
  'internship',
  'other',
]);

export const verificationUrlSchema = z
  .string()
  .refine((value) => value.startsWith('https://'), 'verification_url must be https.');

const publicLinkDateSchema = z.preprocess((value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}, z.iso.date());

export const publicLinkKindSchema = z.enum([
  'verification',
  'announcement',
  'profile',
  'article',
  'repository',
  'credential',
  'presentation',
  'demo',
  'organization',
]);

export const publicLinkSchema = z.object({
  label: z.string().min(1),
  url: verificationUrlSchema,
  kind: publicLinkKindSchema,
  note: z.string().min(1).optional(),
  published_at: publicLinkDateSchema.optional(),
  featured: z.boolean().default(false),
});

export const publicMediaKindSchema = z.enum(['photo', 'certificate', 'diagram']);

export const publicMediaSchema = z.object({
  path: z
    .string()
    .regex(/^\/media\/[a-z0-9]+(?:[a-z0-9._/-])*$/, 'Media must be served from /media/.'),
  kind: publicMediaKindSchema,
  alt: z.string().min(1),
  caption: z.string().min(1).optional(),
  credit: z.string().min(1).optional(),
});

export type PublicMedia = z.infer<typeof publicMediaSchema>;

export const pageHeroSchema = z.object({
  headline_before: z.string(),
  emphasis: z.string().min(1),
  headline_after: z.string().default(''),
});

export const pagePrincipleSchema = z.object({
  cap: z.string().default('Principle'),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const contributionSignalMetricSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
  detail: z.string().min(1).optional(),
});

export const contributionDurationSchema = z.union([
  z.number().positive(),
  z
    .object({
      min: z.number().positive(),
      max: z.number().positive(),
      estimated: z.boolean().default(false),
    })
    .refine((duration) => duration.max >= duration.min, {
      message: 'Duration maximum must be greater than or equal to the minimum.',
    }),
  z.literal('unknown'),
]);

export const contributionMetricsSchema = z
  .object({
    instruction_sessions: z.number().int().nonnegative().optional(),
    mentoring_sessions: z.number().int().nonnegative().optional(),
    teams_mentored: z.number().int().nonnegative().optional(),
    instruction_session_duration_hours: contributionDurationSchema.optional(),
    mentoring_session_duration_hours: contributionDurationSchema.optional(),
    typical_attendees_per_session: z.string().min(1).optional(),
    scholarship_participants_supported: z.number().int().nonnegative().optional(),
    instructor_rating_values: z.array(z.number().min(0).max(5)).min(1).optional(),
    mentor_rating_values: z.array(z.number().min(0).max(5)).min(1).optional(),
  })
  .refine(
    (metrics) => Object.keys(metrics).length > 0,
    'Contribution metrics must contain at least one value.',
  );

export const contributionSignalSourceSchema = z.object({
  contribution_ids: z.array(publicIdSchema).min(1),
  metric_labels: z.object({
    instruction_sessions: z.string().min(1),
    mentoring_sessions: z.string().min(1),
    instruction_hours: z.string().min(1),
    mentoring_hours: z.string().min(1),
    instruction_ratings: z.string().min(1),
    mentoring_ratings: z.string().min(1),
  }),
  metric_details: z.object({
    instruction_sessions: z.string().min(1),
    mentoring_sessions: z.string().min(1),
    instruction_hours: z.string().min(1),
    mentoring_hours: z.string().min(1),
    instruction_ratings: z.string().min(1).optional(),
    mentoring_ratings: z.string().min(1).optional(),
  }),
});

export const contributionSignalSchema = z.object({
  index_label: z.string().min(1).default('Selected signal'),
  counter: z.string().optional(),
  headline: pageHeroSchema,
  metrics: z.array(contributionSignalMetricSchema).min(1).max(6),
  source: contributionSignalSourceSchema.optional(),
});

export const pageCurationSchema = z
  .object({
    selected_work: z.array(publicIdSchema).default([]),
    selected_projects: z.array(publicIdSchema).default([]),
    selected_contributions: z.array(publicIdSchema).default([]),
    selected_writing: z.array(publicIdSchema).default([]),
    selected_field_notes: z.array(publicIdSchema).default([]),
    selected_knowledge: z.array(publicIdSchema).default([]),
    featured_writing: z.array(publicIdSchema).default([]),
    selected_credentials: z.array(publicIdSchema).default([]),
  })
  .default({
    selected_work: [],
    selected_projects: [],
    selected_contributions: [],
    selected_writing: [],
    selected_field_notes: [],
    selected_knowledge: [],
    featured_writing: [],
    selected_credentials: [],
  });

export const publicContentSchema = z.object({
  id: publicIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  content_kind: contentKindSchema,
  /** Short, surface-specific label used by the homepage featured-writing selector. */
  featured_label: z.string().min(1).optional(),
  slug: z.string().regex(/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/),
  publication_status: z.enum(['draft', 'review', 'ready', 'published']).optional(),
  writing_mode: writingModeSchema.optional(),
  field_note_section: fieldNoteSectionSchema.optional(),
  field_note_order: z.number().int().nonnegative().optional(),
  featured: z.boolean().default(false),
  tags: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)),
  /** Sends a project card to its curated external artifact instead of a detail route. */
  project_destination: projectDestinationSchema.optional(),
  /** Editorial group used to separate primary engineering work from smaller or collaborative work. */
  project_group: projectGroupSchema.optional(),
  project_order: z.number().int().nonnegative().optional(),
  map: mapMetadataSchema.optional(),
  knowledge_kind: z.string().min(1).optional(),
  knowledge_domain: z.string().min(1).optional(),
  knowledge_area: z.array(z.string().min(1)).optional(),
  knowledge_areas: z.array(knowledgeAreaSchema).optional(),
  knowledge_guided_path: z.array(knowledgePathStepSchema).optional(),
  knowledge_featured_pages: z.array(publicIdSchema).optional(),
  knowledge_reading: knowledgeReadingSchema.optional(),
  knowledge_references: z.array(knowledgeReferenceSchema).optional(),
  knowledge_sketches: z.array(publicIdSchema).optional(),
  public_relations: z.array(publicRelationSchema).default([]),
  curation: pageCurationSchema.optional(),
  published_at: z.iso.date().optional(),
  updated_at: z.iso.date().optional(),
  last_verified: z.iso.date().optional(),
  /** Inclusive start of role, program, or engagement (ISO date; day may be approximate). */
  engagement_start: z.iso.date().optional(),
  /** Inclusive end; omit when ongoing. */
  engagement_end: z.iso.date().optional(),
  /** Normalized engagement classification, kept separate from the visitor-facing role title. */
  engagement_type: engagementTypeSchema.optional(),
  /** Optional display override when a single range is misleading (rollups, overlapping programs). */
  engagement_label: z.string().min(1).optional(),
  /** Company or organization shown for a work record. */
  work_organization: z.string().min(1).optional(),
  /** Visitor-facing title for a work record. */
  work_role: z.string().min(1).optional(),
  /** Excludes a work record from homepage Selected Work without hiding it from `/work`. */
  show_on_homepage: z.boolean().optional(),
  /** Vendor or program operator shown with engagement dates (`content_kind: contribution`). */
  program_provider: z.string().min(1).optional(),
  contribution_type: contributionTypeSchema.optional(),
  project_categories: projectCategorySchema.optional(),
  role_label: z.string().min(1).optional(),
  contributions_index: z.boolean().optional(),
  verification_url: verificationUrlSchema.optional(),
  public_links: z.array(publicLinkSchema).default([]),
  public_metrics: contributionMetricsSchema.optional(),
  contribution_signal: contributionSignalSchema.optional(),
  media: z.array(publicMediaSchema).default([]),
  page_hero: pageHeroSchema.optional(),
  page_principles: z.array(pagePrincipleSchema).optional(),
  sketch_source: z
    .string()
    .regex(/^\/sketches\/[a-z0-9][a-z0-9_-]*\.excalidraw$/)
    .optional(),
  sketch_role: z
    .enum(['architecture', 'debugging', 'teaching', 'content-model', 'working-model'])
    .optional(),
});

export type PublicContent = z.infer<typeof publicContentSchema>;
export type PageHero = z.infer<typeof pageHeroSchema>;
export type PagePrinciple = z.infer<typeof pagePrincipleSchema>;
export type PublicLink = z.infer<typeof publicLinkSchema>;
export type ContributionMetrics = z.infer<typeof contributionMetricsSchema>;
export type ContributionDuration = z.infer<typeof contributionDurationSchema>;
export type ContributionSignal = z.infer<typeof contributionSignalSchema>;
export type KnowledgeReading = z.infer<typeof knowledgeReadingSchema>;
export type KnowledgePathStep = z.infer<typeof knowledgePathStepSchema>;
export type KnowledgeReference = z.infer<typeof knowledgeReferenceSchema>;
