import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const generatedRecord = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content_kind: z.string(),
  slug: z.string(),
  publication_status: z.enum(['ready', 'published']),
  featured: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  public_relations: z.array(z.object({ relation: z.string(), target: z.string() })).default([]),
  throughlines: z.array(z.string()).default([]),
  curation: z.object({
    selected_work: z.array(z.string()).default([]),
    selected_projects: z.array(z.string()).default([]),
    selected_contributions: z.array(z.string()).default([]),
    featured_writing: z.array(z.string()).default([]),
    selected_credentials: z.array(z.string()).default([]),
  }).optional(),
  asset_paths: z.array(z.string()).default([]),
});

const generated = (directory: string) => defineCollection({
  loader: glob({ base: `./src/content/generated/v1/${directory}`, pattern: '**/*.md' }),
  schema: generatedRecord,
});

export const collections = {
  pages: generated('pages'),
  work: generated('work'),
  projects: generated('projects'),
  contributions: generated('contributions'),
  writing: generated('writing'),
  credentials: generated('credentials'),
};
