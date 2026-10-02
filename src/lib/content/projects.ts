import { fixtureProjects } from '../../data/fixtures';
import { entryToPublicContent, slugTail, type PublicEntry } from './mappers';
import { getCollectionEntries } from './repository';
import { isFixtureMode } from './publication';

export async function getProjectItems() {
  if (isFixtureMode) return fixtureProjects;
  const entries = await getCollectionEntries('projects');
  return entries.map(entryToPublicContent);
}

export async function getProjectEntriesForRoutes(): Promise<PublicEntry[]> {
  if (isFixtureMode) return [];
  const entries = await getCollectionEntries('projects');
  return entries.filter((entry) => entry.data.project_destination !== 'external');
}

export async function getProjectEntryBySlugTail(tail: string): Promise<PublicEntry | undefined> {
  const entries = await getCollectionEntries('projects');
  return entries.find((entry) => slugTail(entry.data.slug) === tail);
}
