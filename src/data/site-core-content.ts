import type { PageHero } from '../lib/content/page-presentation';

export const siteAboutHero: PageHero = {
  headline_before: 'I usually start by asking how the ',
  emphasis: 'pieces fit',
  headline_after: ' together.',
};

export const siteAboutLede =
  "I'm a software engineer working mostly on backend services, integrations, and automation. A lot of my work involves changes that cross several services, components, or teams.";

export const siteAboutFallbackParagraphs = [
  'Changes rarely stay inside one ticket. Dependencies, ownership boundaries, and the next recurrence of a problem all need to be visible before the change is safe.',
  'Tests, runbooks, diagrams, and explanations turn that context into something the next person can inspect and use.',
  'In teaching and collaboration, difficult technical problems become diagrams, examples, and trade-off discussions that people can question and reuse.',
];
