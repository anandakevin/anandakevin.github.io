import type { PublicContent } from './public-contract';

/** Machine IDs are role slugs; visitor copy uses the role title. */
export const CONTRIBUTION_TYPES = [
  'instructor',
  'facilitator',
  'mentor',
  'curriculum-lead',
  'reviewer',
] as const;

export type ContributionType = (typeof CONTRIBUTION_TYPES)[number];

const LABELS: Record<ContributionType, string> = {
  instructor: 'Instructor',
  facilitator: 'Facilitator',
  mentor: 'Mentor',
  'curriculum-lead': 'Curriculum lead',
  reviewer: 'Reviewer',
};

const DESCRIPTIONS: Record<ContributionType, string> = {
  instructor: 'Courses and live sessions where I taught the material directly.',
  facilitator: 'Program sessions where I guided the group, discussion, and progress.',
  mentor: 'Capstone advising, competition teams, academy coaching, and one-to-one guidance.',
  'curriculum-lead': 'Programs where I helped design the syllabus and learning materials.',
  reviewer: 'Code review, localization QA, and feedback on learner submissions.',
};

export const CONTRIBUTION_TYPE_ORDER: ContributionType[] = [
  'instructor',
  'facilitator',
  'mentor',
  'curriculum-lead',
  'reviewer',
];

export function contributionTypeLabel(type: ContributionType): string {
  return LABELS[type];
}

export function contributionTypeLabels(types: ContributionType[] | undefined): string[] {
  return (types ?? []).map(contributionTypeLabel);
}

export function contributionRoleLabel(item: {
  role_label?: string;
  contribution_type?: ContributionType[];
}): string {
  if (item.role_label?.trim()) return item.role_label.trim();
  return contributionTypeLabels(item.contribution_type).join(' + ') || 'Contributor';
}

export function contributionTypeDescription(type: ContributionType): string {
  return DESCRIPTIONS[type];
}

export function groupContributionsByType(
  items: PublicContent[],
): { type: ContributionType; label: string; items: PublicContent[] }[] {
  const buckets = new Map<ContributionType, PublicContent[]>();
  for (const type of CONTRIBUTION_TYPE_ORDER) {
    buckets.set(type, []);
  }
  for (const item of items) {
    for (const type of item.contribution_type ?? []) {
      if (buckets.has(type)) buckets.get(type)!.push(item);
    }
  }
  return CONTRIBUTION_TYPE_ORDER.map((type) => ({
    type,
    label: LABELS[type],
    items: buckets.get(type) ?? [],
  })).filter((group) => group.items.length > 0);
}
