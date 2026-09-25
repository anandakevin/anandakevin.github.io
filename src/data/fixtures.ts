import type { PublicContent, Throughline } from '../lib/public-contract';

export const fixtureNotice = 'Implementation fixture — reviewed public records are required before production release.';

export const fixtureWork: PublicContent[] = [
  {
    id: 'work/system-foundation', title: 'A representative systems context',
    description: 'Fixture content for validating work-card hierarchy and related-thinking behavior.',
    content_kind: 'work', slug: '/work/system-foundation', publication_status: 'ready', featured: true,
    tags: ['systems', 'testing'], public_relations: [], throughlines: ['repeatable-change'], asset_paths: [],
  },
  {
    id: 'work/operational-boundaries', title: 'A representative operational context',
    description: 'Fixture content for validating chronology, signals, and contextual technology.',
    content_kind: 'work', slug: '/work/operational-boundaries', publication_status: 'ready', featured: true,
    tags: ['platform', 'automation'], public_relations: [], throughlines: ['legible-boundaries'], asset_paths: [],
  },
];

export const fixtureWriting: PublicContent[] = [
  {
    id: 'writing/fixture-system-model', title: 'Making variation inspectable',
    description: 'Fixture case-study content used solely to validate featured-writing interaction.',
    content_kind: 'case_study', slug: '/case-studies/fixture-system-model', publication_status: 'ready', featured: true,
    tags: ['systems', 'configuration'],
    public_relations: [{ relation: 'extracted_from', target: 'work/system-foundation' }],
    throughlines: ['model-variation', 'repeatable-change'], asset_paths: [],
  },
  {
    id: 'writing/fixture-safe-change', title: 'Making a change repeatable',
    description: 'A second fixture deliberately exists only to test the approved multi-item state.',
    content_kind: 'case_study', slug: '/case-studies/fixture-safe-change', publication_status: 'ready', featured: true,
    tags: ['testing', 'automation'],
    public_relations: [{ relation: 'extracted_from', target: 'work/operational-boundaries' }],
    throughlines: ['repeatable-change', 'legible-boundaries'], asset_paths: [],
  },
];

export const fixtureProjects: PublicContent[] = [
  {
    id: 'projects/fixture-public-artifact', title: 'A representative public artifact',
    description: 'Fixture content for project-card structure without implying a launch selection.',
    content_kind: 'project', slug: '/projects/fixture-public-artifact', publication_status: 'ready', featured: true,
    tags: ['artifact', 'systems'], public_relations: [], throughlines: ['legible-boundaries'], asset_paths: [],
  },
];

export const fixtureContributions: PublicContent[] = [
  {
    id: 'contributions/fixture-knowledge-transfer', title: 'A representative contribution',
    description: 'Fixture content for contribution hierarchy and public-evidence placement.',
    content_kind: 'contribution', slug: '/contributions/fixture-knowledge-transfer', publication_status: 'ready', featured: true,
    tags: ['mentoring', 'knowledge-transfer'], public_relations: [], throughlines: ['repeatable-change'], asset_paths: [],
  },
];

export const fixtureThroughlines: Throughline[] = [
  { id: 'model-variation', title: 'Model variation explicitly', description: 'Fixture throughline for a reviewed future registry.', display_order: 1 },
  { id: 'repeatable-change', title: 'Make change repeatable', description: 'Fixture throughline for a reviewed future registry.', display_order: 2 },
  { id: 'legible-boundaries', title: 'Keep boundaries legible', description: 'Fixture throughline for a reviewed future registry.', display_order: 3 },
];

export const fixtureContent = [...fixtureWork, ...fixtureWriting, ...fixtureProjects, ...fixtureContributions];
