#!/usr/bin/env node

import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { externalWritingConfig, mediumWritingCachePath } from '../src/data/external-writing.ts';
import { fetchMediumWriting } from '../src/lib/external-writing.ts';

const cachePath = resolve(mediumWritingCachePath);
const temporaryPath = `${cachePath}.tmp`;

try {
  const items = await fetchMediumWriting(externalWritingConfig.medium.feedUrl);
  const snapshot = {
    fetchedAt: new Date().toISOString(),
    items,
  };

  await mkdir(dirname(cachePath), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  await rename(temporaryPath, cachePath);
  console.log(`Medium feed refreshed: ${items.length} article${items.length === 1 ? '' : 's'}.`);
} catch (error) {
  // External writing is supplementary. Preserve a previously fetched cache when
  // available and let the Astro build continue without new Medium cards when it
  // is not. `getMediumWriting` emits the corresponding build warning.
  console.warn(`Medium feed refresh failed; continuing without a refresh: ${String(error)}`);
}
