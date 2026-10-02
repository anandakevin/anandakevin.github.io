#!/usr/bin/env node

import { existsSync } from 'node:fs';

const root = new URL('../src/content/public/', import.meta.url);
if (!existsSync(root)) {
  console.error('Production build blocked: direct public content is missing.');
  process.exit(1);
}
