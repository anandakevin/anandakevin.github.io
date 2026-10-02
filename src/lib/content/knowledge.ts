import { entryToPublicContent, slugTail, type PublicEntry } from './mappers';
import { getCollectionEntries } from './repository';
import type { PublicContent } from '../public-contract';

const isKnowledgeDomain = (entry: PublicEntry) => entry.data.content_kind === 'knowledge_domain';
const isKnowledgePage = (entry: PublicEntry) => entry.data.content_kind === 'knowledge';

export async function getKnowledgeEntries(): Promise<PublicEntry[]> {
  return getCollectionEntries('knowledge');
}

export async function getKnowledgeItems(): Promise<PublicContent[]> {
  const entries = await getKnowledgeEntries();
  return entries.filter(isKnowledgePage).map(entryToPublicContent);
}

export async function getKnowledgeDomainItems(): Promise<PublicContent[]> {
  const entries = await getKnowledgeEntries();
  return entries.filter(isKnowledgeDomain).map(entryToPublicContent);
}

export async function getKnowledgeEntriesForRoutes(): Promise<PublicEntry[]> {
  const entries = await getKnowledgeEntries();
  return entries.filter(isKnowledgePage);
}

export async function getKnowledgeDomainEntriesForRoutes(): Promise<PublicEntry[]> {
  const entries = await getKnowledgeEntries();
  return entries.filter(isKnowledgeDomain);
}

export async function getKnowledgeEntryBySlugTail(tail: string): Promise<PublicEntry | undefined> {
  const entries = await getKnowledgeEntriesForRoutes();
  return entries.find((entry) => slugTail(entry.data.slug) === tail);
}

export async function getKnowledgeDomainEntryBySlugTail(
  tail: string,
): Promise<PublicEntry | undefined> {
  const entries = await getKnowledgeDomainEntriesForRoutes();
  return entries.find((entry) => slugTail(entry.data.slug) === tail);
}
