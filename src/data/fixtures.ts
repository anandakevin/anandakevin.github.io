import type { PublicContent } from '../lib/public-contract';

export const fixtureNotice =
  'Implementation fixture — reviewed public records are required before production release.';

export const fixtureWork: PublicContent[] = [
  {
    id: 'work/system-foundation',
    title: 'A representative systems context',
    description:
      'Fixture content for validating work-card hierarchy and related-thinking behavior.',
    content_kind: 'work',
    slug: '/work/system-foundation',
    featured: true,
    tags: ['systems', 'testing'],
    public_relations: [],
    public_links: [],
    media: [],
  },
  {
    id: 'work/operational-boundaries',
    title: 'A representative operational context',
    description: 'Fixture content for validating chronology, signals, and contextual technology.',
    content_kind: 'work',
    slug: '/work/operational-boundaries',
    featured: true,
    tags: ['platform', 'automation'],
    public_relations: [],
    public_links: [],
    media: [],
  },
];

export const fixtureWriting: PublicContent[] = [
  {
    id: 'writing/fixture-system-model',
    title: 'Making variation inspectable',
    description: 'Fixture case-study content used solely to validate featured-writing interaction.',
    content_kind: 'case_study',
    slug: '/case-studies/fixture-system-model',
    featured: true,
    tags: ['systems', 'configuration'],
    public_relations: [{ relation: 'extracted_from', target: 'work/system-foundation' }],
    public_links: [],
    media: [],
  },
  {
    id: 'writing/fixture-safe-change',
    title: 'Making a change repeatable',
    description: 'A second fixture deliberately exists only to test the approved multi-item state.',
    content_kind: 'case_study',
    slug: '/case-studies/fixture-safe-change',
    featured: true,
    tags: ['testing', 'automation'],
    public_relations: [{ relation: 'extracted_from', target: 'work/operational-boundaries' }],
    public_links: [],
    media: [],
  },
  {
    id: 'writing/fixture-field-note',
    title: 'A representative field note',
    description: 'Fixture content for validating the reference-oriented writing surface.',
    content_kind: 'note',
    writing_mode: 'reference',
    field_note_section: 'engineering-systems',
    field_note_order: 10,
    slug: '/writing/fixture-field-note',
    publication_status: 'ready',
    featured: false,
    tags: ['systems', 'reference'],
    public_relations: [],
    last_verified: '2026-09-28',
    public_links: [],
    media: [],
  },
];

export const fixtureProjects: PublicContent[] = [
  {
    id: 'projects/fixture-public-artifact',
    title: 'A representative public artifact',
    description: 'Fixture content for project-card structure without implying a launch selection.',
    content_kind: 'project',
    slug: '/projects/fixture-public-artifact',
    featured: true,
    tags: ['artifact', 'systems'],
    project_categories: ['automation'],
    public_relations: [],
    public_links: [],
    media: [],
  },
];

export const fixtureContributions: PublicContent[] = [
  {
    id: 'contributions/fixture-knowledge-transfer',
    title: 'A representative contribution',
    description: 'Fixture content for contribution hierarchy and public-evidence placement.',
    content_kind: 'contribution',
    slug: '/contributions/fixture-knowledge-transfer',
    featured: true,
    contribution_type: ['mentor'],
    tags: ['mentoring', 'knowledge-transfer'],
    public_relations: [],
    public_links: [],
    media: [],
  },
];

/**
 * Retained while the fixture homepage remains available from the foundation
 * commit. These are presentation-only placeholders, not public throughlines.
 */
export const fixtureThroughlines = [
  {
    id: 'model-variation',
    title: 'Model variation explicitly',
    description: 'Fixture throughline for a reviewed future registry.',
    display_order: 1,
  },
  {
    id: 'repeatable-change',
    title: 'Make change repeatable',
    description: 'Fixture throughline for a reviewed future registry.',
    display_order: 2,
  },
  {
    id: 'legible-boundaries',
    title: 'Keep boundaries legible',
    description: 'Fixture throughline for a reviewed future registry.',
    display_order: 3,
  },
];

export const fixtureContent = [
  ...fixtureWork,
  ...fixtureWriting,
  ...fixtureProjects,
  ...fixtureContributions,
];
