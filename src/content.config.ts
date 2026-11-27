import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { resolve } from 'node:path';
import {
  contributionMetricsSchema,
  contributionSignalSchema,
  contributionTypeSchema,
  engagementTypeSchema,
  pageHeroSchema,
  pagePrincipleSchema,
  projectCategorySchema,
  projectDestinationSchema,
  projectGroupSchema,
  publicIdSchema,
  publicRelationSchema,
  publicLinkSchema,
  publicMediaSchema,
  mapMetadataSchema,
  knowledgeAreaSchema,
  knowledgePathStepSchema,
  knowledgeReadingSchema,
  knowledgeReferenceSchema,
  fieldNoteSectionSchema,
  writingModeSchema,
} from './lib/public-contract';

const portfolioRecordsRoot = resolve(
  process.env.PORTFOLIO_SOURCE_ROOT ?? '../second-brain/80-Public-Portfolio',
  'records',
);

/** YAML loaders may parse bare ISO dates as Date objects. */
const isoDateField = z.preprocess((value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}, z.string());
const externalUrlField = z
  .string()
  .refine((value) => /^https?:\/\//.test(value), 'URL must use http(s).');

const authoredRecord = z.object({
  id: publicIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  content_kind: z.string(),
  publication_status: z.enum(['draft', 'review', 'ready', 'published']),
  writing_mode: writingModeSchema.optional(),
  field_note_section: fieldNoteSectionSchema.optional(),
  field_note_order: z.number().int().nonnegative().optional(),
  featured_label: z.string().min(1).optional(),
  slug: z.string(),
  featured: z.boolean().default(false),
  /** Internal marker for committed fixture records that must not ship in production. */
  fixture_only: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  project_destination: projectDestinationSchema.optional(),
  project_group: projectGroupSchema.optional(),
  project_order: z.number().int().nonnegative().optional(),
  project_start: isoDateField.optional(),
  project_end: isoDateField.optional(),
  map: mapMetadataSchema.optional(),
  /** Parent-owned artifact IDs; currently consumed as Work children. */
  children: z.array(publicIdSchema).default([]),
  /** Optional ownership pointer for a child artifact's navigation/provenance. */
  parent_work: publicIdSchema.optional(),
  public_relations: z.array(publicRelationSchema).default([]),
  curation: z
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
    .optional(),
  published_at: isoDateField.optional(),
  updated_at: isoDateField.optional(),
  last_verified: isoDateField.optional(),
  engagement_start: isoDateField.optional(),
  engagement_end: isoDateField.optional(),
  engagement_label: z.string().optional(),
  engagement_type: engagementTypeSchema.optional(),
  work_organization: z.string().optional(),
  work_role: z.string().optional(),
  show_on_homepage: z.boolean().optional(),
  program_provider: z.string().optional(),
  contribution_type: contributionTypeSchema.optional(),
  project_categories: projectCategorySchema.optional(),
  role_label: z.string().optional(),
  contributions_index: z.boolean().optional(),
  verification_url: z
    .string()
    .refine((value) => value.startsWith('https://'), 'verification_url must be https.')
    .optional(),
  public_links: z.array(publicLinkSchema).default([]),
  public_metrics: contributionMetricsSchema.optional(),
  media: z.array(publicMediaSchema).default([]),
  sketch_source: z
    .string()
    .regex(/^\/sketches\/[a-z0-9][a-z0-9_-]*\.excalidraw$/)
    .optional(),
  sketch_role: z
    .enum(['architecture', 'debugging', 'teaching', 'content-model', 'working-model'])
    .optional(),
});

const pages = defineCollection({
  loader: glob({ base: resolve(portfolioRecordsRoot, 'pages'), pattern: '**/*.md' }),
  schema: authoredRecord.extend({
    page_hero: pageHeroSchema.optional(),
    page_lede: z.string().min(1).optional(),
    page_principles: z.array(pagePrincipleSchema).optional(),
    contribution_signal: contributionSignalSchema.optional(),
  }),
});

const authored = (directory: string) =>
  defineCollection({
    loader: glob({ base: resolve(portfolioRecordsRoot, directory), pattern: '**/*.md' }),
    schema: authoredRecord,
  });

const sketches = defineCollection({
  loader: glob({ base: resolve(portfolioRecordsRoot, 'sketches'), pattern: '**/*.md' }),
  schema: authoredRecord.extend({
    content_kind: z.literal('sketch'),
    sketch_source: z.string().regex(/^\/sketches\/[a-z0-9][a-z0-9_-]*\.excalidraw$/),
    sketch_role: z.enum([
      'architecture',
      'debugging',
      'teaching',
      'content-model',
      'working-model',
    ]),
  }),
});

const writing = defineCollection({
  loader: glob({ base: resolve(portfolioRecordsRoot, 'writing'), pattern: '**/*.md' }),
  schema: authoredRecord
    .extend({
      writing_mode: writingModeSchema.default('editorial'),
    })
    .superRefine((record, context) => {
      const reference = record.writing_mode === 'reference';
      if (reference && !record.field_note_section) {
        context.addIssue({
          code: 'custom',
          path: ['field_note_section'],
          message: 'Reference writing needs a field_note_section.',
        });
      }
      if (reference && record.field_note_order === undefined) {
        context.addIssue({
          code: 'custom',
          path: ['field_note_order'],
          message: 'Reference writing needs a field_note_order.',
        });
      }
      if (reference && !record.last_verified) {
        context.addIssue({
          code: 'custom',
          path: ['last_verified'],
          message: 'Reference writing needs a last_verified date.',
        });
      }
      if (!reference && (record.field_note_section || record.field_note_order !== undefined)) {
        context.addIssue({
          code: 'custom',
          path: ['writing_mode'],
          message: 'Field note metadata is only valid for reference writing.',
        });
      }
    }),
});

const knowledge = defineCollection({
  loader: glob({ base: resolve(portfolioRecordsRoot, 'knowledge'), pattern: '**/*.md' }),
  schema: authoredRecord.extend({
    content_kind: z.enum(['knowledge', 'knowledge_domain']),
    knowledge_kind: z.string().min(1),
    knowledge_domain: z.string().min(1),
    knowledge_area: z.array(z.string().min(1)).default([]),
    knowledge_areas: z.array(knowledgeAreaSchema).optional(),
    knowledge_guided_path: z.array(knowledgePathStepSchema).optional(),
    knowledge_featured_pages: z.array(publicIdSchema).default([]),
    knowledge_reading: knowledgeReadingSchema.optional(),
    knowledge_references: z.array(knowledgeReferenceSchema).default([]),
    knowledge_sketches: z.array(publicIdSchema).default([]),
  }),
});

const social = defineCollection({
  loader: glob({ base: resolve(portfolioRecordsRoot, 'social'), pattern: '**/*.md' }),
  schema: z.object({
    id: publicIdSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    content_kind: z.literal('social_post'),
    publication_status: z.enum(['draft', 'review', 'ready', 'published']),
    platform: z.string().min(1),
    external_url: externalUrlField,
    authorship: z.enum(['self', 'third-party']),
    published_at: isoDateField.optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    related_records: z.array(publicIdSchema).default([]),
    media: z.array(publicMediaSchema).default([]),
    last_verified: isoDateField.optional(),
  }),
});

export const collections = {
  pages,
  work: authored('work'),
  projects: authored('projects'),
  contributions: authored('contributions'),
  writing,
  credentials: authored('credentials'),
  sketches,
  knowledge,
  social,
};
