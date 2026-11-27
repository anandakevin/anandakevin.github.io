import type { PublicContent } from '../public-contract';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type PublicPublicationStatus = NonNullable<PublicContent['publication_status']>;

/** Local staging reads the private editorial source, including records under review. */
export const PREVIEW_VISIBLE_STATUSES = new Set<PublicPublicationStatus>([
  'draft',
  'review',
  'ready',
  'published',
]);

/** Production site and `dev:production`: display only ready/published records. */
export const PRODUCTION_VISIBLE_STATUSES = new Set<PublicPublicationStatus>(['ready', 'published']);

/** Manual publishing uses the same reviewed record set as production. */
export const PUBLISH_VISIBLE_STATUSES = PRODUCTION_VISIBLE_STATUSES;

export type ContentVisibilityMode = 'fixtures' | 'preview' | 'publish' | 'production';

export const isFixtureMode = import.meta.env.PUBLIC_CONTENT_MODE === 'fixtures';

let publishedIds: Set<string> | undefined;

export function isPublicIdApproved(id: string): boolean {
  const mode = contentVisibilityMode();
  if (mode === 'fixtures' || mode === 'preview') return true;
  if (!publishedIds) {
    const path = resolve(
      process.env.PORTFOLIO_SOURCE_ROOT ?? '../second-brain/80-Public-Portfolio',
      'published.json',
    );
    const ids: unknown = JSON.parse(readFileSync(path, 'utf8'));
    if (!Array.isArray(ids) || ids.some((value) => typeof value !== 'string')) {
      throw new Error('Portfolio published.json must be an array of record IDs.');
    }
    publishedIds = new Set(ids);
  }
  return publishedIds.has(id);
}

export function contentVisibilityMode(): ContentVisibilityMode {
  const envMode = import.meta.env.PUBLIC_CONTENT_MODE;
  if (envMode === 'fixtures') return 'fixtures';
  if (envMode === 'publish') return 'publish';
  if (envMode === 'production') return 'production';
  if (envMode === 'preview') return 'preview';
  return import.meta.env.DEV ? 'preview' : 'production';
}

export function visibleStatuses(): Set<PublicPublicationStatus> {
  if (contentVisibilityMode() === 'preview') {
    return PREVIEW_VISIBLE_STATUSES;
  }
  return PRODUCTION_VISIBLE_STATUSES;
}

export function isRecordVisible<T extends { publication_status?: PublicPublicationStatus }>(
  record: T,
): boolean {
  if (isFixtureMode) return true;
  return (
    record.publication_status !== undefined && visibleStatuses().has(record.publication_status)
  );
}

export function filterVisibleRecords<T extends { publication_status?: PublicPublicationStatus }>(
  records: T[],
): T[] {
  if (isFixtureMode) return records;
  return records.filter(isRecordVisible);
}
