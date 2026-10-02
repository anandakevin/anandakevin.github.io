import type { PublicContent } from './public-contract';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseIsoDate(iso: string): { year: string; month: number } | null {
  const match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(iso);
  if (!match) return null;
  const month = Number.parseInt(match[2], 10);
  if (month < 1 || month > 12) return null;
  return { year: match[1], month };
}

export function formatEngagementMonthYear(iso: string): string {
  const parts = parseIsoDate(iso);
  if (!parts) return iso;
  return `${MONTHS[parts.month - 1]} ${parts.year}`;
}

/** Provider plus engagement window for contribution list rows and detail chrome. */
export function formatProgramEngagementMeta(
  item: Pick<
    PublicContent,
    'program_provider' | 'engagement_start' | 'engagement_end' | 'engagement_label'
  >,
): { provider?: string; period?: string; combined?: string } {
  const provider = item.program_provider?.trim();
  const period = formatEngagementPeriod(item);
  if (provider && period) {
    return { provider, period, combined: `${provider} · ${period}` };
  }
  if (provider) return { provider, combined: provider };
  if (period) return { period, combined: period };
  return {};
}

/** Visitor-facing range; `engagement_label` wins when set. */
export function formatEngagementPeriod(
  item: Pick<PublicContent, 'engagement_start' | 'engagement_end' | 'engagement_label'>,
): string | undefined {
  if (item.engagement_label?.trim()) return item.engagement_label.trim();
  const { engagement_start: start, engagement_end: end } = item;
  if (!start && !end) return undefined;
  if (start && end) {
    const startLabel = formatEngagementMonthYear(start);
    const endLabel = formatEngagementMonthYear(end);
    if (startLabel === endLabel) return startLabel;
    return `${startLabel} – ${endLabel}`;
  }
  if (start && !end) {
    return `${formatEngagementMonthYear(start)} – present`;
  }
  if (end) {
    return `Through ${formatEngagementMonthYear(end)}`;
  }
  return undefined;
}

const ENGAGEMENT_TYPE_LABELS: Record<NonNullable<PublicContent['engagement_type']>, string> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  volunteer: 'Volunteer',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
  other: 'Other',
};

export function formatEngagementType(type: PublicContent['engagement_type']): string | undefined {
  return type ? ENGAGEMENT_TYPE_LABELS[type] : undefined;
}

/** Newest engagements first; open-ended roles sort above closed ones that ended earlier. */
export function engagementRecencyTimestamp(
  item: Pick<PublicContent, 'engagement_start' | 'engagement_end'>,
): number {
  const endIso = item.engagement_end ?? (item.engagement_start ? '9999-12-31' : '0000-01-01');
  const endTs = Date.parse(endIso);
  const startTs = item.engagement_start ? Date.parse(item.engagement_start) : 0;
  return (Number.isNaN(endTs) ? 0 : endTs) * 1_000_000 + (Number.isNaN(startTs) ? 0 : startTs);
}

export function compareEngagementRecency(
  a: Pick<PublicContent, 'engagement_start' | 'engagement_end' | 'title'>,
  b: Pick<PublicContent, 'engagement_start' | 'engagement_end' | 'title'>,
): number {
  const delta = engagementRecencyTimestamp(b) - engagementRecencyTimestamp(a);
  if (delta !== 0) return delta;
  return a.title.localeCompare(b.title);
}
