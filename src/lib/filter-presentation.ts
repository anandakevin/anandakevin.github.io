const semanticAccents: Record<string, string> = {
  all: 'var(--ink)',
  case_study: 'var(--rust)',
  note: 'var(--teal)',
  article: 'var(--feed-article)',
  external_publication: 'var(--teal)',
  social_post: 'var(--linkedin)',
  instructor: 'var(--rust)',
  facilitator: 'var(--blue)',
  mentor: 'var(--teal)',
  'curriculum-lead': 'var(--feed-article)',
  reviewer: 'var(--linkedin)',
};

const fallbackAccents = ['var(--rust)', 'var(--teal)', 'var(--blue)', 'var(--feed-article)'];

export function filterAccentFor(id: string): string {
  const semanticAccent = semanticAccents[id];
  if (semanticAccent) return semanticAccent;

  const hash = [...id].reduce((total, character) => total + character.charCodeAt(0), 0);
  return fallbackAccents[hash % fallbackAccents.length];
}
