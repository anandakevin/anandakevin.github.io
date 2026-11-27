import { compareEngagementRecency } from '../engagement-period';
import { fixtureContributions } from '../../data/fixtures';
import { entryToPublicContent, slugTail, type PublicEntry } from './mappers';
import { getCollectionEntries } from './repository';
import { isFixtureMode } from './publication';

type ContributionQuery = {
  includeIndexHidden?: boolean;
};

export async function getContributionItems(options: ContributionQuery = {}) {
  if (isFixtureMode) return fixtureContributions;
  const { includeIndexHidden = false } = options;
  const entries = await getCollectionEntries('contributions');
  return entries
    .map(entryToPublicContent)
    .filter((item) => includeIndexHidden || item.contributions_index !== false)
    .sort(compareEngagementRecency);
}

export async function getContributionEntriesForRoutes(): Promise<PublicEntry[]> {
  if (isFixtureMode) return [];
  return getCollectionEntries('contributions');
}

export async function getContributionEntryBySlugTail(
  tail: string,
): Promise<PublicEntry | undefined> {
  const entries = await getCollectionEntries('contributions');
  return entries.find((entry) => slugTail(entry.data.slug) === tail);
}
