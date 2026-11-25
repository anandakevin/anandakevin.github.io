import type { PublicContent } from './public-contract';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatMonthYear(value: string): string {
  const match = /^(\d{4})-(\d{2})/.exec(value);
  if (!match) return value;
  const month = Number.parseInt(match[2], 10);
  return month >= 1 && month <= 12 ? `${MONTHS[month - 1]} ${match[1]}` : value;
}

export function formatProjectPeriod(
  item: Pick<PublicContent, 'project_start' | 'project_end'>,
): string | undefined {
  const { project_start: start, project_end: end } = item;
  if (!start && !end) return undefined;
  if (start && end) {
    const startLabel = formatMonthYear(start);
    const endLabel = formatMonthYear(end);
    return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
  }
  if (start) return `${formatMonthYear(start)} – present`;
  return `Through ${formatMonthYear(end as string)}`;
}
