import type { ContributionSignal } from '../public-contract';
import { getRecordsById } from './repository';
import { getPageEntryById } from './pages';

export const CONTRIBUTIONS_HOME_SIGNAL_PAGE_ID = 'pages/contributions-home-signal';

export async function getContributionsHomeSignal(): Promise<ContributionSignal | undefined> {
  const records = await getRecordsById();
  return records.get(CONTRIBUTIONS_HOME_SIGNAL_PAGE_ID)?.contribution_signal;
}

export async function getContributionsHomeSignalCurationIds(): Promise<string[]> {
  const entry = await getPageEntryById(CONTRIBUTIONS_HOME_SIGNAL_PAGE_ID);
  return entry?.data.curation?.selected_contributions ?? [];
}
