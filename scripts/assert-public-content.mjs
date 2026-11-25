#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.env.PORTFOLIO_SOURCE_ROOT ?? '../second-brain/80-Public-Portfolio');
if (!existsSync(resolve(root, 'records')) || !existsSync(resolve(root, 'published.json'))) {
  console.error('Production build blocked: private portfolio source is missing.');
  process.exit(1);
}
