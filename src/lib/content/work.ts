import { compareEngagementRecency } from '../engagement-period';
import { fixtureWork } from '../../data/fixtures';
import { entryToPublicContent, slugTail, type PublicEntry } from './mappers';
import { getCollectionEntries } from './repository';
import { isFixtureMode } from './publication';

export async function getWorkItems() {
  if (isFixtureMode) return fixtureWork;
  const entries = await getCollectionEntries('work');
  return entries.map(entryToPublicContent).sort(compareEngagementRecency);
}

export async function getWorkEntriesForRoutes(): Promise<PublicEntry[]> {
  if (isFixtureMode) return [];
  return getCollectionEntries('work');
}

export async function getWorkEntryBySlugTail(tail: string): Promise<PublicEntry | undefined> {
  const entries = await getCollectionEntries('work');
  return entries.find((entry) => slugTail(entry.data.slug) === tail);
}
