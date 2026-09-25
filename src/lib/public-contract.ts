import { z } from 'astro/zod';

export const CONTRACT_VERSION = 1;

export const publicIdSchema = z
  .string()
  .regex(/^(pages|work|projects|contributions|writing|credentials)\/[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid public content ID.');

export const publicRelationSchema = z.object({
  relation: z.enum(['extracted_from', 'related_to', 'verifies']),
  target: publicIdSchema,
});

export const contentKindSchema = z.enum([
  'page',
  'work',
  'project',
  'contribution',
  'article',
  'note',
  'case_study',
  'proof',
  'external_publication',
  'social_post',
]);

// Curated presentation is page-owned: record IDs here select and order content
// for a specific surface. Individual records intentionally have no global order.
export const pageCurationSchema = z.object({
  selected_work: z.array(publicIdSchema).default([]),
  selected_projects: z.array(publicIdSchema).default([]),
  selected_contributions: z.array(publicIdSchema).default([]),
  featured_writing: z.array(publicIdSchema).default([]),
  selected_credentials: z.array(publicIdSchema).default([]),
}).default({
  selected_work: [],
  selected_projects: [],
  selected_contributions: [],
  featured_writing: [],
  selected_credentials: [],
});

export const publicContentSchema = z.object({
  id: publicIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  content_kind: contentKindSchema,
  slug: z.string().regex(/^\/[a-z0-9]+(?:[/-][a-z0-9]+)*$/),
  publication_status: z.enum(['ready', 'published']),
  featured: z.boolean().default(false),
  tags: z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)),
  public_relations: z.array(publicRelationSchema).default([]),
  throughlines: z.array(z.string()).default([]),
  curation: pageCurationSchema.optional(),
  published_at: z.iso.date().optional(),
  updated_at: z.iso.date().optional(),
  asset_paths: z.array(z.string().startsWith('/content-assets/v1/')).default([]),
});

export const throughlineSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1),
  description: z.string().min(1),
  display_order: z.number().int().nonnegative(),
});

export const publicContractManifestSchema = z.object({
  contract_version: z.literal(CONTRACT_VERSION),
  mode: z.literal('production'),
  generated_at: z.iso.datetime(),
  records: z.array(publicContentSchema),
  throughlines: z.array(throughlineSchema),
});

export type PublicContent = z.infer<typeof publicContentSchema>;
export type Throughline = z.infer<typeof throughlineSchema>;
