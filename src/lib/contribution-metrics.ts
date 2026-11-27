import type { ContributionDuration } from './public-contract';

export interface FormattedContributionMetric {
  value: string;
  estimated: boolean;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(3)));
}

function formatRating(value: number) {
  return value === 5 ? '5.0' : formatNumber(value);
}

function formatRatingSummary(values: number[]) {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = min === max ? formatRating(min) : `${formatRating(min)}–${formatRating(max)}`;
  return `${range} / 5`;
}

function formatDuration(duration: Exclude<ContributionDuration, 'unknown'>) {
  const min = typeof duration === 'number' ? duration : duration.min;
  const max = typeof duration === 'number' ? duration : duration.max;
  const estimated = typeof duration === 'number' ? false : duration.estimated;
  const useMinutes = max <= 1 && min < 1;
  const unit = useMinutes ? 'min' : min === 1 && max === 1 ? 'hour' : 'hours';
  const lower = formatNumber(useMinutes ? min * 60 : min);
  const upper = formatNumber(useMinutes ? max * 60 : max);
  const value = min === max ? `${lower} ${unit}` : `${lower}–${upper} ${unit}`;

  return { value, estimated };
}

export function formatContributionMetric(
  value: unknown,
  { duration = false }: { duration?: boolean } = {},
): FormattedContributionMetric | null {
  if (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && ['unknown', 'tbd'].includes(value.trim().toLowerCase()))
  ) {
    return null;
  }

  if (Array.isArray(value)) {
    const formatted = formatRatingSummary(
      value.filter((item): item is number => typeof item === 'number'),
    );
    return formatted ? { value: formatted, estimated: false } : null;
  }

  if (
    duration &&
    (typeof value === 'number' ||
      (typeof value === 'object' && value !== null && 'min' in value && 'max' in value))
  ) {
    return formatDuration(value as Exclude<ContributionDuration, 'unknown'>);
  }

  return { value: String(value), estimated: false };
}
