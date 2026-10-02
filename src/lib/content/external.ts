import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  externalWritingConfig,
  externalWritingOverlay,
  mediumWritingCachePath,
} from '../../data/external-writing';
import {
  applyExternalWritingOverlay,
  fetchMediumWriting,
  type ExternalWritingProviderItem,
  type ExternalWritingItem,
} from '../external-writing';
import { isFixtureMode } from './publication';
import { getRecordsById } from './repository';

const mediumCachePath = resolve(mediumWritingCachePath);

async function getMediumProviderItems(): Promise<ExternalWritingProviderItem[]> {
  try {
    const raw = await readFile(mediumCachePath, 'utf8');
    const snapshot = JSON.parse(raw) as { items?: unknown };
    if (!Array.isArray(snapshot.items))
      throw new Error('Medium cache does not contain an items array.');
    return snapshot.items as ExternalWritingProviderItem[];
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
      console.warn(
        `[external-writing] Medium cache unavailable; fetching feed directly: ${String(error)}`,
      );
    }
    return fetchMediumWriting(externalWritingConfig.medium.feedUrl);
  }
}

export async function getMediumWriting(): Promise<ExternalWritingItem[]> {
  if (isFixtureMode) return [];
  const recordsById = await getRecordsById();
  for (const [key, curation] of Object.entries(externalWritingOverlay)) {
    for (const target of curation.relatedRecords ?? []) {
      if (!recordsById.has(target))
        throw new Error(`External-writing overlay ${key} references missing record ${target}.`);
    }
  }
  try {
    const providerItems = await getMediumProviderItems();
    const result = applyExternalWritingOverlay(providerItems, externalWritingOverlay);
    if (result.staleKeys.length)
      console.warn(`[external-writing] stale overlay keys: ${result.staleKeys.join(', ')}`);
    return result.items;
  } catch (error) {
    console.warn(
      `[external-writing] Medium feed unavailable; continuing without Medium cards: ${String(error)}`,
    );
    return [];
  }
}
