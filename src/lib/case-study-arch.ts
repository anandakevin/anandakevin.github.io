import type { FixtureArch } from '../data/fixture-arch';

const SECTION_HEADINGS = [
  'Context',
  'Constraints',
  'Approach',
  'Trade-offs',
  'Outcomes',
  'Architecture summary',
];

function sectionBody(body: string, heading: string): string | undefined {
  // Keep multiline matching for headings, but use a true end-of-input check;
  // `$` would otherwise match the end of every line in multiline mode.
  const pattern = new RegExp(`^## ${heading}\\s*\\n+([\\s\\S]*?)(?=\\n## |(?![\\s\\S]))`, 'm');
  const match = body.match(pattern);
  return match?.[1]?.trim();
}

function plainTextFromMarkdown(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/[`*_~]/g, '')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

export function archFromCaseStudyBody(body: string): FixtureArch | null {
  const context = sectionBody(body, 'Context');
  const constraints = sectionBody(body, 'Constraints');
  const approach = sectionBody(body, 'Approach');
  if (!context && !approach) return null;

  return {
    archTitle: 'Case-study summary',
    sketchNote: 'from the case study',
    columns: [
      {
        title: 'Context',
        body: context ? plainTextFromMarkdown(context) : 'See case study narrative.',
      },
      {
        title: 'Constraints',
        body: constraints
          ? plainTextFromMarkdown(constraints)
          : 'See constraints section in full case study.',
      },
      {
        title: 'Approach',
        body: approach
          ? plainTextFromMarkdown(approach)
          : 'See approach section in full case study.',
      },
    ],
    stack: SECTION_HEADINGS.filter((heading) => sectionBody(body, heading)).map((h) =>
      h.toLowerCase().replace(/\s+/g, '-'),
    ),
  };
}
