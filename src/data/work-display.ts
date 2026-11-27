import { formatEngagementPeriod, formatEngagementType } from '../lib/engagement-period';
import type { PublicContent } from '../lib/public-contract';
import { hrefForPublicRecord, slugTail } from '../lib/content';

export type RelatedWritingLink = {
  title: string;
  href: string;
  contentKind: PublicContent['content_kind'];
};

export type WorkCardDisplay = {
  organization: string;
  roleLine: string;
  engagementType?: string;
  contextLine: string;
  stack?: string[];
};

const fixtureWorkDisplay: Record<string, WorkCardDisplay> = {
  'work/system-foundation': {
    organization: 'Fixture context',
    roleLine: 'Representative role',
    engagementType: undefined,
    contextLine: 'Representative role · dates TBD',
    stack: ['systems', 'testing', 'fixture-labeled'],
  },
  'work/operational-boundaries': {
    organization: 'Fixture context',
    roleLine: 'Representative role',
    engagementType: undefined,
    contextLine: 'Representative role · dates TBD',
    stack: ['platform', 'automation', 'fixture-labeled'],
  },
};

export function workCardDisplayFor(item: PublicContent, fixtureMode: boolean): WorkCardDisplay {
  if (fixtureMode && fixtureWorkDisplay[item.id]) {
    return fixtureWorkDisplay[item.id];
  }
  const stack = item.tags.length ? item.tags : [];
  const period = formatEngagementPeriod(item);
  return {
    organization: fixtureMode
      ? 'Fixture context'
      : (item.work_organization ?? 'Organization not listed'),
    roleLine: fixtureMode ? 'Representative role' : (item.work_role ?? 'Role not listed'),
    engagementType: fixtureMode ? undefined : formatEngagementType(item.engagement_type),
    contextLine: fixtureMode ? 'Public record pending' : (period ?? 'Dates not listed'),
    stack,
  };
}

export type WorkDetailDisplay = {
  anchorId: string;
  organization: string;
  roleLine: string;
  engagementType?: string;
  periodLine: string;
  roleTitle: string;
  body: string;
  tags: string[];
};

const fixtureWorkDetail: Record<string, WorkDetailDisplay> = {
  'work/system-foundation': {
    anchorId: 'fixture-system-foundation',
    organization: 'Fixture context',
    roleLine: 'Representative role',
    engagementType: undefined,
    periodLine: 'Representative role',
    roleTitle: 'A representative systems context',
    body: 'Fixture chronology row for detail-list layout, anchor links, and tag placement — not a production employment claim.',
    tags: ['systems', 'testing', 'fixture-labeled'],
  },
  'work/operational-boundaries': {
    anchorId: 'fixture-operational-boundaries',
    organization: 'Fixture context',
    roleLine: 'Representative role',
    engagementType: undefined,
    periodLine: 'Representative role',
    roleTitle: 'A representative operational context',
    body: 'Second fixture row exercises chronology spacing and related-depth links without prototype employer names.',
    tags: ['platform', 'automation', 'fixture-labeled'],
  },
};

export function workDetailDisplayFor(item: PublicContent, fixtureMode: boolean): WorkDetailDisplay {
  if (fixtureMode && fixtureWorkDetail[item.id]) {
    return fixtureWorkDetail[item.id];
  }
  const stack = item.tags.length ? item.tags : [];
  return {
    anchorId: slugTail(item.slug),
    organization: item.work_organization ?? 'Organization not listed',
    roleLine: item.work_role ?? 'Role not listed',
    engagementType: formatEngagementType(item.engagement_type),
    periodLine: formatEngagementPeriod(item) ?? item.tags.join(' · '),
    roleTitle: item.title,
    body: item.description,
    tags: stack,
  };
}

export function workDetailHref(item: PublicContent): string {
  if (item.content_kind === 'work') {
    return `/work/${slugTail(item.slug)}`;
  }
  return item.slug;
}

/**
 * Resolve the writing records related to a work record. The relation list is
 * already part of the exported public record, so adding another case study is
 * a metadata-only change in the source Markdown.
 */
export function relatedWritingFor(
  item: PublicContent,
  records: PublicContent[],
): RelatedWritingLink[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  return item.public_relations
    .filter((relation) => relation.target.startsWith('writing/'))
    .map((relation) => byId.get(relation.target))
    .filter((record): record is PublicContent => Boolean(record))
    .map((record) => ({
      title: record.title,
      href: hrefForPublicRecord(record),
      contentKind: record.content_kind,
    }));
}

export function relatedCaseStudiesFor(
  item: PublicContent,
  records: PublicContent[],
): RelatedWritingLink[] {
  return relatedWritingFor(item, records).filter((link) => link.contentKind === 'case_study');
}
