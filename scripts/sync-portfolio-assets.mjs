#!/usr/bin/env node

import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
} from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { parse } from 'yaml';

const mode = process.argv[2];
if (!['preview', 'production', 'fixtures'].includes(mode)) {
  throw new Error('Use preview, production, or fixtures asset mode.');
}

const sourceRoot = resolve(
  process.env.PORTFOLIO_SOURCE_ROOT ?? '../second-brain/80-Public-Portfolio',
);
const recordsRoot = resolve(sourceRoot, 'records');
const sourcePublic = resolve(sourceRoot, 'public');
const sitePublic = resolve('public');
const manifestPath = resolve(sourceRoot, 'published.json');

if (!existsSync(recordsRoot) || !existsSync(sourcePublic) || !existsSync(manifestPath)) {
  throw new Error('Private portfolio source is missing.');
}
const realSourcePublic = realpathSync(sourcePublic);

const publishedList = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (!Array.isArray(publishedList) || publishedList.some((id) => typeof id !== 'string')) {
  throw new Error('Portfolio published.json must be an array of record IDs.');
}
const published = new Set(publishedList);
if (published.size !== publishedList.length) {
  throw new Error('Portfolio published.json contains duplicate IDs.');
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Symlinked portfolio source: ${path}`);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const records = new Map();
for (const path of walk(recordsRoot).filter((path) => path.endsWith('.md'))) {
  const id = relative(recordsRoot, path).replaceAll(sep, '/').replace(/\.md$/, '');
  const frontmatter = readFileSync(path, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatter) throw new Error(`Missing frontmatter: ${id}`);
  const meta = parse(frontmatter[1]);
  if (meta?.id !== id) throw new Error(`ID/path mismatch: ${id}`);
  records.set(id, meta);
}

for (const id of published) {
  const record = records.get(id);
  if (!record) throw new Error(`Published record does not exist: ${id}`);
  if (!['ready', 'published'].includes(record.publication_status)) {
    throw new Error(`Published record is not ready: ${id}`);
  }
}

const assetPaths = new Set();
for (const [id, meta] of records) {
  if (mode === 'fixtures') continue;
  if (mode === 'production' && !published.has(id)) continue;
  if (mode === 'production' && !['ready', 'published'].includes(meta.publication_status)) continue;
  for (const media of meta.media ?? []) assetPaths.add(media.path);
  if (meta.sketch_source) assetPaths.add(meta.sketch_source);
}

const copies = [];
for (const assetPath of assetPaths) {
  if (
    !/^\/(?:media|sketches)\/[a-z0-9][a-z0-9._/-]*$/.test(assetPath) ||
    assetPath.includes('..')
  ) {
    throw new Error(`Unsafe portfolio asset path: ${assetPath}`);
  }
  const relativePath = assetPath.slice(1);
  const source = resolve(sourcePublic, relativePath);
  const realSource = realpathSync(source);
  if (!realSource.startsWith(`${realSourcePublic}${sep}`) || lstatSync(source).isSymbolicLink()) {
    throw new Error(`Asset escapes private portfolio source: ${assetPath}`);
  }
  copies.push({ source, target: resolve(sitePublic, relativePath) });
}

for (const directory of ['media', 'sketches']) {
  rmSync(resolve(sitePublic, directory), { recursive: true, force: true });
  mkdirSync(resolve(sitePublic, directory), { recursive: true });
}
for (const { source, target } of copies) {
  mkdirSync(resolve(target, '..'), { recursive: true });
  copyFileSync(source, target);
}
console.log(`Portfolio ${mode} assets: ${copies.length} referenced files staged.`);
