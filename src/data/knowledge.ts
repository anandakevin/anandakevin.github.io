export const knowledgeKindLabels: Record<string, string> = {
  concept: 'Concept',
  guide: 'Guide',
  reference: 'Reference',
  playbook: 'Playbook',
  overview: 'Overview',
  'course-note': 'Course Note',
};

export function knowledgeKindLabel(kind?: string): string {
  if (!kind) return 'Knowledge';
  return knowledgeKindLabels[kind] ?? kind.replaceAll('-', ' ');
}

export function knowledgePathLabel(path: string[]): string {
  return path
    .map((part) => part.replaceAll('-', ' '))
    .map((part) => part.replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(' · ');
}
