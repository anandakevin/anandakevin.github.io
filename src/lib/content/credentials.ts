import { entryToPublicContent, slugTail, type PublicEntry } from './mappers';
import { getCollectionEntries } from './repository';
import { isFixtureMode } from './publication';

export async function getCredentialItems() {
  if (isFixtureMode) return [];
  const entries = await getCollectionEntries('credentials');
  return entries.map(entryToPublicContent);
}

export async function getCredentialEntriesForRoutes(): Promise<PublicEntry[]> {
  if (isFixtureMode) return [];
  return getCollectionEntries('credentials');
}

/** Credentials with on-site detail pages only (no external verification_url). */
export async function getCredentialDetailEntriesForRoutes(): Promise<PublicEntry[]> {
  if (isFixtureMode) return [];
  const entries = await getCollectionEntries('credentials');
  return entries.filter((entry) => !entry.data.verification_url);
}

export async function getCredentialEntryBySlugTail(tail: string): Promise<PublicEntry | undefined> {
  const entries = await getCollectionEntries('credentials');
  return entries.find((entry) => slugTail(entry.data.slug) === tail);
}
