import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { ContributionDuration, ContributionSignal, PublicContent } from '../public-contract';
import { entryToPublicContent, type PublicCollection } from './mappers';
import { isFixtureMode, isRecordVisible } from './publication';
import { fixtureContent } from '../../data/fixtures';

const COLLECTION_NAMES: PublicCollection[] = [
  'pages',
  'work',
  'projects',
  'contributions',
  'writing',
  'credentials',
  'sketches',
  'knowledge',
];

function relationKey(relation: PublicContent['public_relations'][number]) {
  return `${relation.relation}:${relation.target}`;
}

function deriveReverseRelations(records: PublicContent[]): PublicContent[] {
  const additions = new Map<string, PublicContent['public_relations']>();
  for (const record of records) {
    for (const relation of record.public_relations) {
      const reverse = { relation: 'related_to' as const, target: record.id };
      const current = additions.get(relation.target) ?? [];
      if (!current.some((entry) => relationKey(entry) === relationKey(reverse)))
        current.push(reverse);
      additions.set(relation.target, current);
    }
  }
  return records.map((record) => {
    const additionsForRecord = additions.get(record.id) ?? [];
    return {
      ...record,
      public_relations: [
        ...record.public_relations,
        ...additionsForRecord.filter(
          (candidate) =>
            !record.public_relations.some((entry) => entry.target === candidate.target),
        ),
      ],
    };
  });
}

function socialLink(post: CollectionEntry<'social'>): PublicContent['public_links'][number] {
  return {
    label: `${post.data.platform === 'linkedin' ? 'LinkedIn' : post.data.platform} — ${post.data.title}`,
    url: post.data.external_url,
    kind: 'article',
    note: post.data.description,
    featured: post.data.featured,
    ...(post.data.published_at ? { published_at: post.data.published_at } : {}),
  };
}

function attachSocialLinks(
  records: PublicContent[],
  socialPosts: CollectionEntry<'social'>[],
): PublicContent[] {
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const additions = new Map<string, PublicContent['public_links']>();
  for (const post of socialPosts) {
    const link = socialLink(post);
    for (const targetId of post.data.related_records) {
      if (!recordsById.has(targetId))
        throw new Error(`Social post ${post.id} references missing record ${targetId}.`);
      const current = additions.get(targetId) ?? [];
      if (!current.some((entry) => entry.url === link.url)) current.push(link);
      additions.set(targetId, current);
    }
  }
  return records.map((record) => ({
    ...record,
    public_links: [
      ...record.public_links,
      ...(additions.get(record.id) ?? []).filter(
        (candidate) => !record.public_links.some((entry) => entry.url === candidate.url),
      ),
    ],
  }));
}

function formatMetric(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
}

function formatRating(value: number) {
  return value === 5 ? '5.0' : formatMetric(value);
}

const contributionSignalMetricLabels = {
  instruction_ratings: 'Teaching/tutoring ratings',
  mentoring_ratings: 'Mentoring ratings',
} as const;

function deriveContributionSignals(records: PublicContent[]): PublicContent[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  return records.map((record) => {
    const signal = record.contribution_signal;
    const source = signal?.source;
    if (!source) return record;
    const contributions = source.contribution_ids.map((id) => {
      const contribution = byId.get(id);
      if (
        !contribution ||
        contribution.content_kind !== 'contribution' ||
        !contribution.public_metrics
      ) {
        throw new Error(
          `Contribution signal ${record.id} references incomplete contribution ${id}.`,
        );
      }
      return contribution;
    });
    const sum = (key: 'instruction_sessions' | 'mentoring_sessions') => {
      const values = contributions
        .map((contribution) => contribution.public_metrics?.[key])
        .filter((value): value is number => typeof value === 'number');
      if (!values.length)
        throw new Error(`Contribution signal ${record.id} has no public ${key} values.`);
      return values.reduce((total, value) => total + value, 0);
    };
    const durationTotal = (
      sessionKey: 'instruction_sessions' | 'mentoring_sessions',
      durationKey: 'instruction_session_duration_hours' | 'mentoring_session_duration_hours',
    ) => {
      let minimum = 0;
      let maximum = 0;
      let hasDuration = false;
      let hasUnknown = false;
      let hasEstimate = false;
      for (const contribution of contributions) {
        const sessions = contribution.public_metrics?.[sessionKey];
        const duration = contribution.public_metrics?.[durationKey] as
          ContributionDuration | undefined;
        if (typeof sessions !== 'number' || duration === undefined) continue;
        hasDuration = true;
        if (duration === 'unknown') {
          hasUnknown = true;
          continue;
        }
        if (typeof duration === 'number') {
          minimum += sessions * duration;
          maximum += sessions * duration;
          continue;
        }
        minimum += sessions * duration.min;
        maximum += sessions * duration.max;
        hasEstimate ||= duration.estimated;
      }
      if (!hasDuration || (hasUnknown && minimum === 0)) return 'TBD';
      const range =
        minimum === maximum
          ? `${formatMetric(minimum)} hours`
          : `${formatMetric(minimum)}–${formatMetric(maximum)} hours`;
      return hasUnknown || hasEstimate ? `${range} · estimated` : range;
    };
    const ratings = (key: 'instructor_rating_values' | 'mentor_rating_values') =>
      contributions
        .flatMap((contribution) => contribution.public_metrics?.[key] ?? [])
        .filter((value) => value > 4.5);
    const average = (values: number[]) =>
      values.reduce((total, value) => total + value, 0) / values.length;
    const ratingSummary = (values: number[]) =>
      `${formatRating(Math.min(...values))}–${formatRating(Math.max(...values))} / 5 · avg ${formatRating(Number(average(values).toFixed(2)))}`;
    const configuredMetricValue = (label: string) =>
      signal.metrics.find((metric) => metric.label === label)?.value;
    const resolvedDurationTotal = (
      sessionKey: 'instruction_sessions' | 'mentoring_sessions',
      durationKey: 'instruction_session_duration_hours' | 'mentoring_session_duration_hours',
      label: string,
    ) => {
      const calculated = durationTotal(sessionKey, durationKey);
      return calculated === 'TBD' ? (configuredMetricValue(label) ?? calculated) : calculated;
    };
    const derived: ContributionSignal = {
      ...signal,
      metrics: [
        {
          value: formatMetric(sum('instruction_sessions')),
          label: source.metric_labels.instruction_sessions,
          detail: source.metric_details.instruction_sessions,
        },
        {
          value: formatMetric(sum('mentoring_sessions')),
          label: source.metric_labels.mentoring_sessions,
          detail: source.metric_details.mentoring_sessions,
        },
        {
          value: resolvedDurationTotal(
            'instruction_sessions',
            'instruction_session_duration_hours',
            source.metric_labels.instruction_hours,
          ),
          label: source.metric_labels.instruction_hours,
          detail: source.metric_details.instruction_hours,
        },
        {
          value: resolvedDurationTotal(
            'mentoring_sessions',
            'mentoring_session_duration_hours',
            source.metric_labels.mentoring_hours,
          ),
          label: source.metric_labels.mentoring_hours,
          detail: source.metric_details.mentoring_hours,
        },
        {
          value: ratingSummary(ratings('instructor_rating_values')),
          label:
            source.metric_labels.instruction_ratings ??
            contributionSignalMetricLabels.instruction_ratings,
        },
        {
          value: ratingSummary(ratings('mentor_rating_values')),
          label:
            source.metric_labels.mentoring_ratings ??
            contributionSignalMetricLabels.mentoring_ratings,
        },
      ],
    };
    return { ...record, contribution_signal: derived };
  });
}

export async function getCollectionEntries<C extends PublicCollection>(
  name: C,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(name);
  if (isFixtureMode) return entries;
  return name === 'writing' || name === 'knowledge'
    ? entries.filter((entry) =>
        isRecordVisible(entry.data as Pick<PublicContent, 'publication_status'>),
      )
    : entries;
}

export async function loadPublicRecords(): Promise<PublicContent[]> {
  const records: PublicContent[] = [];
  for (const name of COLLECTION_NAMES) {
    const entries = await getCollectionEntries(name);
    records.push(...entries.map(entryToPublicContent));
  }
  const socialPosts = isFixtureMode ? [] : await getCollection('social');
  return deriveContributionSignals(deriveReverseRelations(attachSocialLinks(records, socialPosts)));
}

export async function getCatalogRecords(): Promise<PublicContent[]> {
  if (isFixtureMode) {
    const knowledge = await getCollectionEntries('knowledge');
    return [...fixtureContent, ...knowledge.map(entryToPublicContent)];
  }
  const records = await loadPublicRecords();
  return records.filter((record) => record.content_kind !== 'page');
}

export async function getRecordsById(): Promise<Map<string, PublicContent>> {
  const records = await loadPublicRecords();
  return new Map(records.map((record) => [record.id, record]));
}
