import { fixtureWriting } from '../../data/fixtures';
import { entryToPublicContent, slugTail, type PublicEntry } from './mappers';
import { getCollectionEntries } from './repository';
import { isFixtureMode } from './publication';
import type { PublicContent } from '../public-contract';

const isFieldNote = (item: Pick<PublicContent, 'writing_mode'>) =>
  item.writing_mode === 'reference';

const compareFieldNotes = (
  left: Pick<PublicContent, 'field_note_section' | 'field_note_order' | 'title'>,
  right: Pick<PublicContent, 'field_note_section' | 'field_note_order' | 'title'>,
) =>
  (left.field_note_order ?? Number.MAX_SAFE_INTEGER) -
    (right.field_note_order ?? Number.MAX_SAFE_INTEGER) ||
  (left.field_note_section ?? '').localeCompare(right.field_note_section ?? '') ||
  left.title.localeCompare(right.title);

export async function getWritingItems() {
  if (isFixtureMode) return fixtureWriting;
  const entries = await getCollectionEntries('writing');
  return entries.map(entryToPublicContent);
}

export async function getEditorialWritingItems() {
  return (await getWritingItems()).filter((item) => !isFieldNote(item));
}

export async function getFieldNoteItems() {
  return (await getWritingItems()).filter(isFieldNote).sort(compareFieldNotes);
}

export async function getCaseStudyItems() {
  const writing = await getWritingItems();
  return writing.filter((item) => item.content_kind === 'case_study');
}

export async function getWritingEntriesForRoutes(): Promise<PublicEntry[]> {
  if (isFixtureMode) return [];
  return getCollectionEntries('writing');
}

export async function getCaseStudyEntriesForRoutes(): Promise<PublicEntry[]> {
  const entries = await getWritingEntriesForRoutes();
  return entries.filter((entry) => entry.data.content_kind === 'case_study');
}

export async function getArticleNoteEntriesForRoutes(): Promise<PublicEntry[]> {
  const entries = await getWritingEntriesForRoutes();
  return entries.filter(
    (entry) => entry.data.content_kind === 'article' || entry.data.content_kind === 'note',
  );
}

export async function getFieldNoteItemsForSection(section: string) {
  return (await getFieldNoteItems()).filter((item) => item.field_note_section === section);
}

export async function getWritingEntryBySlugTail(tail: string): Promise<PublicEntry | undefined> {
  const entries = await getCollectionEntries('writing');
  return entries.find((entry) => slugTail(entry.data.slug) === tail);
}
