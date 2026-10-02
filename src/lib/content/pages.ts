import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { pageCurationSchema } from '../public-contract';
import { getCollectionEntries } from './repository';
import { isFixtureMode } from './publication';

export async function getHomeCuration() {
  return getPageCuration('pages/home');
}

export async function getPageCuration(id: string) {
  const pages = await getCollection('pages');
  const page = pages.find((entry) => entry.data.id === id);
  return page?.data.curation ?? pageCurationSchema.parse({});
}

export async function getPageEntryById(id: string): Promise<CollectionEntry<'pages'> | undefined> {
  if (isFixtureMode) return undefined;
  const pages = await getCollectionEntries('pages');
  return pages.find((entry) => entry.data.id === id);
}
