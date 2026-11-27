import type { PublicContent } from '../public-contract';
import { hrefForPublicRecord } from './mappers';

export type LandingContentType =
  | 'work'
  | 'case-study'
  | 'project'
  | 'contribution'
  | 'credential'
  | 'writing'
  | 'knowledge'
  | 'sketches';

export interface LandingContentEntry {
  id: string;
  type: LandingContentType;
  title: string;
  summary: string;
  href: string;
  publishedAt?: string;
  updatedAt?: string;
  iconKey?: string;
}

const typeFor = (record: PublicContent): LandingContentType | undefined => {
  if (record.content_kind === 'work') return 'work';
  if (record.content_kind === 'case_study') return 'case-study';
  if (record.content_kind === 'project') return 'project';
  if (record.content_kind === 'contribution') return 'contribution';
  if (record.content_kind === 'proof') return 'credential';
  if (record.content_kind === 'article' || record.content_kind === 'note') return 'writing';
  if (record.content_kind === 'knowledge') return 'knowledge';
  if (record.content_kind === 'sketch') return 'sketches';
  return undefined;
};

export function landingEntryFor(
  record: PublicContent,
  iconKey?: string,
): LandingContentEntry | undefined {
  const type = typeFor(record);
  if (!type) return undefined;
  return {
    id: record.id,
    type,
    title: record.title,
    summary: record.description,
    href: hrefForPublicRecord(record),
    publishedAt: record.published_at,
    updatedAt: record.updated_at,
    iconKey,
  };
}

export function resolveLandingEntries(
  ids: readonly string[],
  records: PublicContent[],
  iconOverrides: Record<string, string> = {},
): LandingContentEntry[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  return ids
    .map((id) => {
      const record = byId.get(id);
      return record ? landingEntryFor(record, iconOverrides[id]) : undefined;
    })
    .filter((entry): entry is LandingContentEntry => Boolean(entry));
}

function meaningfulDate(entry: Pick<LandingContentEntry, 'publishedAt' | 'updatedAt'>): string {
  return entry.updatedAt ?? entry.publishedAt ?? '';
}

export function sortLatestEntries(entries: LandingContentEntry[]): LandingContentEntry[] {
  return [...entries].sort(
    (left, right) =>
      meaningfulDate(right).localeCompare(meaningfulDate(left)) ||
      (right.publishedAt ?? '').localeCompare(left.publishedAt ?? '') ||
      left.title.localeCompare(right.title),
  );
}

export function latestEntriesFor(
  records: PublicContent[],
  types: readonly LandingContentType[],
  limit: number,
  iconOverrides: Record<string, string> = {},
): LandingContentEntry[] {
  const allowed = new Set(types);
  const entries = records
    .map((record) => landingEntryFor(record, iconOverrides[record.id]))
    .filter(
      (entry): entry is LandingContentEntry => entry !== undefined && allowed.has(entry.type),
    );
  return sortLatestEntries(entries).slice(0, limit);
}

export function labelForLandingType(type: LandingContentType): string {
  return {
    work: 'Work',
    'case-study': 'Case Study',
    project: 'Project',
    contribution: 'Contribution',
    credential: 'Credentials',
    writing: 'Writing',
    knowledge: 'Knowledge',
    sketches: 'Sketches',
  }[type];
}
