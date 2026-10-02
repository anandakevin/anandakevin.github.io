import type { PublicContent } from '../public-contract';
import { getContributionsHomeSignalCurationIds } from './contributions-signal';
import { getHomeCuration, getPageCuration } from './pages';
import { isFixtureMode } from './publication';
import {
  fixtureContributions,
  fixtureProjects,
  fixtureWork,
  fixtureWriting,
} from '../../data/fixtures';
import { getContributionItems } from './contributions';
import { getCredentialItems } from './credentials';
import { getProjectItems } from './projects';
import { getWorkItems } from './work';
import { getEditorialWritingItems, getFieldNoteItems } from './writing';
import { getKnowledgeItems } from './knowledge';
import { compareEngagementRecency } from '../engagement-period';

function resolveOrdered(ids: string[], pool: PublicContent[]): PublicContent[] {
  if (!ids.length) return [];
  const byId = new Map(pool.map((item) => [item.id, item]));
  return ids.map((id) => byId.get(id)).filter((item): item is PublicContent => Boolean(item));
}

export async function getCuratedWorkForHome(limit = 3): Promise<PublicContent[]> {
  if (isFixtureMode) return fixtureWork.slice(0, limit);
  const curation = await getHomeCuration();
  const all = await getWorkItems();
  return resolveOrdered(curation.selected_work, all)
    .filter((item) => item.show_on_homepage !== false)
    .sort(compareEngagementRecency)
    .slice(0, limit);
}

export async function getCuratedProjectsForHome(limit = 3): Promise<PublicContent[]> {
  if (isFixtureMode) return fixtureProjects.slice(0, limit);
  const curation = await getHomeCuration();
  const all = await getProjectItems();
  return resolveOrdered(curation.selected_projects, all).slice(0, limit);
}

export async function getCuratedContributionsForHome(limit = 4): Promise<PublicContent[]> {
  if (isFixtureMode) return fixtureContributions.slice(0, limit);
  const signalIds = await getContributionsHomeSignalCurationIds();
  const curation = await getHomeCuration();
  const ids = signalIds.length > 0 ? signalIds : curation.selected_contributions;
  const all = await getContributionItems({ includeIndexHidden: true });
  return resolveOrdered(ids, all).slice(0, limit);
}

export async function getCuratedFeaturedWriting(): Promise<PublicContent[]> {
  if (isFixtureMode) return fixtureWriting.filter((item) => item.writing_mode !== 'reference');
  const curation = await getHomeCuration();
  const writing = await getEditorialWritingItems();
  return resolveOrdered(curation.featured_writing, writing);
}

export async function getCuratedWritingForHome(limit = 3): Promise<PublicContent[]> {
  if (isFixtureMode) return fixtureWriting.slice(0, limit);
  const curation = await getHomeCuration();
  const writing = await getEditorialWritingItems();
  return resolveOrdered(curation.selected_writing, writing).slice(0, limit);
}

export async function getCuratedFieldNotesForPage(
  pageId: string,
  limit?: number,
): Promise<PublicContent[]> {
  if (isFixtureMode) {
    const notes = fixtureWriting.filter((item) => item.writing_mode === 'reference');
    return limit === undefined ? notes : notes.slice(0, limit);
  }
  const curation = await getPageCuration(pageId);
  const notes = await getFieldNoteItems();
  const selected = resolveOrdered(curation.selected_field_notes, notes);
  return limit === undefined ? selected : selected.slice(0, limit);
}

export async function getCuratedCredentialsForHome(): Promise<PublicContent[]> {
  if (isFixtureMode) return [];
  const curation = await getHomeCuration();
  const all = await getCredentialItems();
  return resolveOrdered(curation.selected_credentials, all);
}

export async function getCuratedKnowledgeStartHere(limit = 3): Promise<PublicContent[]> {
  const curation = await getPageCuration('pages/knowledge');
  const all = await getKnowledgeItems();
  return resolveOrdered(curation.selected_knowledge, all).slice(0, limit);
}
