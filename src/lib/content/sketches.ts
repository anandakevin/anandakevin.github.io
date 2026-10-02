import { entryToPublicContent, slugTail, type PublicEntry } from './mappers';
import { getCollectionEntries, getRecordsById } from './repository';
import { isFixtureMode } from './publication';
import type { PublicContent } from '../public-contract';

export async function getSketchItems(): Promise<PublicContent[]> {
  if (isFixtureMode) return [];
  const entries = await getCollectionEntries('sketches');
  return entries
    .map(entryToPublicContent)
    .sort((left, right) => (right.published_at ?? '').localeCompare(left.published_at ?? ''));
}

export async function getSketchEntriesForRoutes(): Promise<PublicEntry[]> {
  if (isFixtureMode) return [];
  return getCollectionEntries('sketches');
}

export async function getSketchEntryBySlugTail(tail: string): Promise<PublicEntry | undefined> {
  const entries = await getCollectionEntries('sketches');
  return entries.find((entry) => slugTail(entry.data.slug) === tail);
}

export async function getSketchesUsedIn(recordId: string): Promise<PublicContent[]> {
  const records = await getRecordsById();
  return [...records.values()].filter(
    (record) =>
      record.content_kind === 'sketch' &&
      record.public_relations.some(
        (relation) => relation.relation === 'used_in' && relation.target === recordId,
      ),
  );
}

export function sketchesUsedIn(records: PublicContent[], recordId: string): PublicContent[] {
  return records.filter(
    (record) =>
      record.content_kind === 'sketch' &&
      record.public_relations.some(
        (relation) => relation.relation === 'used_in' && relation.target === recordId,
      ),
  );
}
