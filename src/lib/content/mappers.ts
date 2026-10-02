import type { CollectionEntry } from 'astro:content';
import type { PublicContent } from '../public-contract';

export type PublicCollection =
  | 'pages'
  | 'work'
  | 'projects'
  | 'contributions'
  | 'writing'
  | 'credentials'
  | 'sketches'
  | 'knowledge';
export type PublicEntry = CollectionEntry<PublicCollection>;

export function slugTail(slug: string): string {
  return slug.split('/').filter(Boolean).at(-1) ?? slug;
}

export function entryToPublicContent(entry: PublicEntry): PublicContent {
  const { data } = entry;
  const pageData = entry.collection === 'pages' ? entry.data : undefined;
  const publicationStatus =
    entry.collection === 'writing' || entry.collection === 'knowledge'
      ? entry.data.publication_status
      : undefined;
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    content_kind: data.content_kind as PublicContent['content_kind'],
    featured_label: data.featured_label,
    slug: data.slug,
    ...(publicationStatus ? { publication_status: publicationStatus } : {}),
    writing_mode:
      entry.collection === 'writing' ? (entry.data.writing_mode ?? 'editorial') : undefined,
    field_note_section: entry.collection === 'writing' ? entry.data.field_note_section : undefined,
    field_note_order: entry.collection === 'writing' ? entry.data.field_note_order : undefined,
    featured: data.featured,
    tags: data.tags,
    project_destination: data.project_destination,
    project_group: data.project_group,
    project_order: data.project_order,
    map: data.map,
    knowledge_kind: entry.collection === 'knowledge' ? entry.data.knowledge_kind : undefined,
    knowledge_domain: entry.collection === 'knowledge' ? entry.data.knowledge_domain : undefined,
    knowledge_area: entry.collection === 'knowledge' ? entry.data.knowledge_area : [],
    knowledge_areas: entry.collection === 'knowledge' ? entry.data.knowledge_areas : undefined,
    knowledge_guided_path:
      entry.collection === 'knowledge' ? entry.data.knowledge_guided_path : undefined,
    knowledge_featured_pages:
      entry.collection === 'knowledge' ? entry.data.knowledge_featured_pages : [],
    knowledge_reading: entry.collection === 'knowledge' ? entry.data.knowledge_reading : undefined,
    knowledge_references: entry.collection === 'knowledge' ? entry.data.knowledge_references : [],
    knowledge_sketches: entry.collection === 'knowledge' ? entry.data.knowledge_sketches : [],
    public_relations: data.public_relations as PublicContent['public_relations'],
    curation: data.curation,
    published_at: data.published_at,
    updated_at: data.updated_at,
    last_verified: data.last_verified,
    engagement_start: data.engagement_start,
    engagement_end: data.engagement_end,
    engagement_label: data.engagement_label,
    engagement_type: data.engagement_type,
    work_organization: data.work_organization,
    work_role: data.work_role,
    show_on_homepage: data.show_on_homepage,
    program_provider: data.program_provider,
    contribution_type: data.contribution_type as PublicContent['contribution_type'],
    project_categories: data.project_categories as PublicContent['project_categories'],
    role_label: data.role_label,
    contributions_index: data.contributions_index,
    verification_url: data.verification_url,
    public_links: data.public_links,
    public_metrics: data.public_metrics,
    media: data.media,
    sketch_source: data.sketch_source,
    sketch_role: data.sketch_role,
    contribution_signal: pageData?.contribution_signal,
  };
}

export function credentialHasDetailPage(record: PublicContent): boolean {
  return record.content_kind === 'proof' && !record.verification_url;
}

export function hrefForCredentialDetail(record: PublicContent): string {
  return `/credentials/${slugTail(record.slug)}`;
}

/** Card and relation links: external verification when set, otherwise on-site detail. */
export function hrefForCredentialCard(record: PublicContent): string {
  if (record.content_kind !== 'proof') {
    return hrefForPublicRecord(record);
  }
  if (record.verification_url) {
    return record.verification_url;
  }
  return hrefForCredentialDetail(record);
}

export function hrefForPublicRecord(record: PublicContent): string {
  if (record.content_kind === 'case_study') {
    return `/case-studies/${slugTail(record.slug)}`;
  }
  if (record.content_kind === 'work') {
    return `/work/${slugTail(record.slug)}`;
  }
  if (record.content_kind === 'project') {
    if (record.project_destination === 'external') {
      const destination = record.public_links.find(
        (link) => link.featured && ['repository', 'profile', 'organization'].includes(link.kind),
      );
      if (destination) return destination.url;
    }
    return `/projects/${slugTail(record.slug)}`;
  }
  if (record.content_kind === 'contribution') {
    return `/contributions/${slugTail(record.slug)}`;
  }
  if (record.content_kind === 'article' || record.content_kind === 'note') {
    return `/writing/${slugTail(record.slug)}`;
  }
  if (record.content_kind === 'proof') {
    return hrefForCredentialCard(record);
  }
  if (record.content_kind === 'sketch') {
    return `/sketches/${slugTail(record.slug)}`;
  }
  if (record.content_kind === 'knowledge' || record.content_kind === 'knowledge_domain') {
    return record.slug;
  }
  return record.slug;
}
