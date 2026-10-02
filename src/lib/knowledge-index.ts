export type KnowledgeIndexSort = 'title' | 'updated';

export interface KnowledgeIndexEntry {
  title: string;
  search: string;
  domain?: string;
  kind?: string;
  updated?: string;
}

export interface KnowledgeIndexFilters {
  query: string;
  domain: string;
  kind: string;
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
    return matchesQuery && matchesDomain && matchesKind;
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
