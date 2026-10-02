import type { PublicContent } from './public-contract';

export type KnowledgeIndexSort = 'title' | 'updated';

export interface KnowledgeIndexEntry {
  title: string;
  search: string;
  domain?: string;
  kind?: string;
  updated?: string;
  areaPath?: string[];
}

export interface KnowledgeIndexFilters {
  query: string;
  domain: string;
  kind: string;
  areaPath?: string[];
}

export interface KnowledgeIndexItem extends KnowledgeIndexEntry {
  href: string;
  description: string;
  domainLabel: string;
  kindLabel: string;
  pathLabel: string;
  areaPath: string[];
  areaLabels: string[];
}

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

export function normalizeKnowledgeSearch(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase()
    .trim();
}

export function knowledgeSearchText(parts: string[]): string {
  return normalizeKnowledgeSearch(parts.filter(Boolean).join(' '));
}

export function filterKnowledgeIndexEntries<T extends KnowledgeIndexEntry>(
  entries: T[],
  filters: KnowledgeIndexFilters,
): T[] {
  const query = normalizeKnowledgeSearch(filters.query);
  return entries.filter((entry) => {
    const matchesQuery = !query || entry.search.includes(query);
    const matchesDomain = filters.domain === 'all' || entry.domain === filters.domain;
    const matchesKind = filters.kind === 'all' || entry.kind === filters.kind;
    const areaPath = filters.areaPath ?? [];
    const matchesArea = areaPath.every((segment, index) => entry.areaPath?.[index] === segment);
    return matchesQuery && matchesDomain && matchesKind && matchesArea;
  });
}

export function sortKnowledgeIndexEntries<T extends KnowledgeIndexEntry>(
  entries: T[],
  sort: KnowledgeIndexSort,
): T[] {
  return [...entries].sort((left, right) => {
    if (sort === 'updated') {
      const byUpdated = (right.updated ?? '').localeCompare(left.updated ?? '');
      if (byUpdated !== 0) return byUpdated;
    }
    return left.title.localeCompare(right.title);
  });
}

export function knowledgeIndexWindow<T>(entries: T[], limit: number): T[] {
  return entries.slice(0, Math.max(0, limit));
}

export function knowledgeIndexItemFromContent(
  item: PublicContent,
  domainLabel: string,
  areaLabels: string[] = [],
): KnowledgeIndexItem {
  const areaPath = item.knowledge_area ?? [];
  const resolvedAreaLabels = areaLabels.length > 0 ? areaLabels : areaPath;
  const pathLabel = knowledgePathLabel(resolvedAreaLabels);
  const kindLabel = knowledgeKindLabel(item.knowledge_kind);
  return {
    href: item.slug,
    title: item.title,
    description: item.description,
    domain: item.knowledge_domain,
    domainLabel,
    kind: item.knowledge_kind,
    kindLabel,
    pathLabel,
    areaPath,
    areaLabels: resolvedAreaLabels,
    updated: item.updated_at,
    search: knowledgeSearchText([
      item.title,
      item.description,
      domainLabel,
      item.knowledge_kind ?? '',
      pathLabel,
      ...item.tags,
    ]),
  };
}
