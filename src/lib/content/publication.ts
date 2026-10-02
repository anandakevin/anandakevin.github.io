import type { PublicContent } from '../public-contract';

export type PublicPublicationStatus = NonNullable<PublicContent['publication_status']>;

/** Local staging: every committed public record is safe to inspect in Git. */
export const PREVIEW_VISIBLE_STATUSES = new Set<PublicPublicationStatus>([
  'draft',
  'review',
  'ready',
  'published',
]);

/** Production site and `dev:production`: display only ready/published records. */
export const PRODUCTION_VISIBLE_STATUSES = new Set<PublicPublicationStatus>(['ready', 'published']);

/** Manual local publishing: include reviewed, in-progress, and draft public records. */
export const PUBLISH_VISIBLE_STATUSES = PREVIEW_VISIBLE_STATUSES;

export type ContentVisibilityMode = 'fixtures' | 'preview' | 'publish' | 'production';

export const isFixtureMode = import.meta.env.PUBLIC_CONTENT_MODE === 'fixtures';

export function contentVisibilityMode(): ContentVisibilityMode {
  const envMode = import.meta.env.PUBLIC_CONTENT_MODE;
  if (envMode === 'fixtures') return 'fixtures';
  if (envMode === 'publish') return 'publish';
  if (envMode === 'production') return 'production';
  if (envMode === 'preview') return 'preview';
  return import.meta.env.DEV ? 'preview' : 'production';
}

export function visibleStatuses(): Set<PublicPublicationStatus> {
  if (contentVisibilityMode() === 'preview' || contentVisibilityMode() === 'publish') {
    return PREVIEW_VISIBLE_STATUSES;
  }
  return PRODUCTION_VISIBLE_STATUSES;
}

export function isRecordVisible<T extends { publication_status?: PublicPublicationStatus }>(
  record: T,
): boolean {
  if (isFixtureMode) return true;
  if (!record.publication_status) return true;
  return visibleStatuses().has(record.publication_status);
}

export function filterVisibleRecords<T extends { publication_status?: PublicPublicationStatus }>(
  records: T[],
): T[] {
  if (isFixtureMode) return records;
  return records.filter(isRecordVisible);
}
