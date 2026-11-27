import { getCollection } from 'astro:content';
import { isFixtureMode, isPublicIdApproved, isRecordVisible } from './publication';
import type { PublicMedia } from '../public-contract';

export type SocialPostRecord = {
  id: string;
  title: string;
  description: string;
  platform: string;
  url: string;
  published_at?: string;
  publication_status: 'draft' | 'review' | 'ready' | 'published';
  tags: string[];
  authorship: 'self' | 'third-party';
  related_records: string[];
  media: PublicMedia[];
};

export async function getSocialPosts(): Promise<SocialPostRecord[]> {
  if (isFixtureMode) return [];
  const records = (await getCollection('social')).filter(
    (entry) => isPublicIdApproved(entry.data.id) && isRecordVisible(entry.data),
  );
  return records.map((record) => ({
    id: record.data.id,
    title: record.data.title,
    description: record.data.description,
    platform: record.data.platform,
    url: record.data.external_url,
    published_at: record.data.published_at,
    publication_status: record.data.publication_status,
    tags: record.data.tags,
    authorship: record.data.authorship,
    related_records: record.data.related_records,
    media: record.data.media,
  }));
}
