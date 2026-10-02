import type { FieldNoteSection } from '../lib/public-contract';

export interface FieldNoteSectionDefinition {
  id: FieldNoteSection;
  title: string;
  description: string;
}

export const fieldNoteSections: FieldNoteSectionDefinition[] = [
  {
    id: 'engineering-systems',
    title: 'Engineering systems',
    description: 'Ways to make technical decisions, boundaries, and change easier to reason about.',
  },
  {
    id: 'learning-practice',
    title: 'Learning and practice',
    description: 'Methods for turning technical reading and practice into decisions that last.',
  },
];

export const fieldNoteSectionById = new Map(
  fieldNoteSections.map((section) => [section.id, section]),
);
