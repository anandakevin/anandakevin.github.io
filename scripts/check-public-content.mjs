#!/usr/bin/env node

import { existsSync, lstatSync, readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { parse } from 'yaml';

const root = resolve('src/content/public');
const publicRoot = resolve('public');
const forbidden = [
  /source_notes\s*:/i,
  /^visibility\s*:/im,
  /^type\s*:/im,
  /^section\s*:/im,
  /\/Users\//,
  /\/(?:private|Volumes|tmp)\//i,
  /(?:^|\s)[A-Za-z]:[\\/]/,
  /\[\[[^\]]+\]\]/,
  /10-Public-Site/i,
  /99-Private/i,
  /obsidian-second-brain/i,
];
const primaryNamespaces = new Set([
  'pages',
  'work',
  'projects',
  'contributions',
  'writing',
  'credentials',
  'sketches',
  'knowledge',
]);
const fieldNoteSections = new Set(['engineering-systems', 'learning-practice']);
const dateFields = [
  'published_at',
  'updated_at',
  'last_verified',
  'engagement_start',
  'engagement_end',
];
const warnings = [];

function walk(directory) {
  const paths = [];
  for (const name of readdirSync(directory)) {
    const path = resolve(directory, name);
    if (lstatSync(path).isSymbolicLink())
      throw new Error(`Symlinked public content is not allowed: ${path}`);
    if (lstatSync(path).isDirectory()) paths.push(...walk(path));
    else paths.push(path);
  }
  return paths;
}

function readRecord(path) {
  const body = readFileSync(path, 'utf8');
  if (forbidden.some((pattern) => pattern.test(body)))
    throw new Error(`Private or obsolete provenance found in ${path}`);
  const match = body.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) throw new Error(`Missing frontmatter: ${path}`);
  const meta = parse(match[1]) ?? {};
  const id = relative(root, path).replace(/\\/g, '/').replace(/\.md$/, '');
  if (meta.id !== id)
    throw new Error(`ID/path mismatch: ${path} declares ${meta.id ?? '<none>'}, expected ${id}`);
  return { id, path, meta, body: body.slice(match[0].length) };
}

function assertMarkdownStructure(record) {
  const lines = record.body.split(/\r?\n/);
  const headings = [];
  let lastHeadingTitle;
  let previousHeading;
  let contentSinceHeading = [];
  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      if (
        previousHeading &&
        heading[1].length <= previousHeading.level &&
        contentSinceHeading.join('').trim() === ''
      ) {
        throw new Error(`Empty Markdown section "${previousHeading.title}" on ${record.id}`);
      }
      const title = heading[2].trim();
      if (lastHeadingTitle === title)
        warnings.push(`Adjacent duplicate Markdown heading "${title}" on ${record.id}`);
      lastHeadingTitle = title;
      headings.push(title);
      previousHeading = { title, level: heading[1].length };
      contentSinceHeading = [];
      continue;
    }
    if (previousHeading) contentSinceHeading.push(line.replace(/<!--.*?-->/g, ''));
  }
  if (previousHeading && contentSinceHeading.join('').trim() === '' && previousHeading.level > 1) {
    throw new Error(`Empty Markdown section "${previousHeading.title}" on ${record.id}`);
  }

  const blocks = record.body
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .replace(/^#{1,6}\s+/, '')
        .replace(/[*_`>#\-\d.\s]/g, '')
        .toLowerCase(),
    )
    .filter(Boolean);
  for (let index = 1; index < blocks.length; index += 1) {
    if (blocks[index] === blocks[index - 1] && blocks[index].length >= 30) {
      warnings.push(`Adjacent duplicate paragraphs may be present on ${record.id}`);
    }
  }

  const visibleBody = record.body.replace(/\]\([^)]*\)/g, '');
  if (
    /\b(?:pages|work|projects|contributions|writing|credentials|social|knowledge)\/[a-z0-9][a-z0-9_-]*\b/.test(
      visibleBody,
    )
  ) {
    throw new Error(`Machine identifier appears as reader-facing text on ${record.id}`);
  }
}

if (!existsSync(root)) throw new Error('Direct public-content root is missing.');
const records = walk(root)
  .filter((path) => path.endsWith('.md'))
  .map(readRecord);
const ids = new Set();
const slugs = new Set();
const primary = records.filter((record) => primaryNamespaces.has(record.id.split('/')[0]));
const byId = new Map(records.map((record) => [record.id, record]));
const fieldNoteOrders = new Map();
const knowledgeDomainAreaPaths = new Map();

function collectKnowledgeAreaPaths(areas, parentPath, recordId, paths = new Set()) {
  if (!Array.isArray(areas)) {
    throw new Error(`Knowledge domain areas must be an array: ${recordId}`);
  }
  const siblingIds = new Set();
  for (const area of areas) {
    if (!area || typeof area !== 'object' || typeof area.id !== 'string') {
      throw new Error(`Knowledge area needs an id: ${recordId}`);
    }
    if (siblingIds.has(area.id)) {
      throw new Error(`Duplicate Knowledge area ${area.id}: ${recordId}`);
    }
    siblingIds.add(area.id);
    const path = [...parentPath, area.id].join('/');
    if (paths.has(path)) throw new Error(`Duplicate Knowledge area path ${path}: ${recordId}`);
    paths.add(path);
    collectKnowledgeAreaPaths(area.children ?? [], [...parentPath, area.id], recordId, paths);
  }
  return paths;
}

function assertKnowledgeTarget(target, recordId, field) {
  if (typeof target !== 'string' || !target.startsWith('knowledge/') || !byId.has(target)) {
    throw new Error(`Invalid Knowledge ${field} target ${String(target)} on ${recordId}`);
  }
}

for (const record of records.filter((entry) => entry.id.startsWith('knowledge/'))) {
  const meta = record.meta;
  const isDomain = meta.content_kind === 'knowledge_domain';
  const isPage = meta.content_kind === 'knowledge';
  if (!isDomain && !isPage) {
    throw new Error(
      `Knowledge record needs content_kind knowledge or knowledge_domain: ${record.id}`,
    );
  }
  const slugPattern = isDomain
    ? /^\/knowledge\/domain\/[a-z0-9]+(?:-[a-z0-9]+)*$/
    : /^\/knowledge\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(meta.slug ?? '')) {
    throw new Error(`Knowledge record needs a stable Knowledge slug: ${record.id}`);
  }
  if (typeof meta.knowledge_domain !== 'string' || !meta.knowledge_domain) {
    throw new Error(`Knowledge record needs knowledge_domain: ${record.id}`);
  }
  if (isDomain) {
    const paths = collectKnowledgeAreaPaths(meta.knowledge_areas, [], record.id);
    knowledgeDomainAreaPaths.set(meta.knowledge_domain, paths);
    for (const target of meta.knowledge_featured_pages ?? []) {
      assertKnowledgeTarget(target, record.id, 'featured page');
    }
    for (const step of meta.knowledge_guided_path ?? []) {
      assertKnowledgeTarget(step?.page, record.id, 'guided path');
    }
  } else {
    if (!Array.isArray(meta.knowledge_area)) {
      throw new Error(`Knowledge page needs knowledge_area: ${record.id}`);
    }
    if (meta.knowledge_areas !== undefined || meta.knowledge_guided_path !== undefined) {
      throw new Error(`Only Knowledge domains may define areas or guided paths: ${record.id}`);
    }
  }
  const reading = meta.knowledge_reading;
  if (reading) {
    for (const field of ['parent', 'previous', 'next']) {
      if (reading[field] !== undefined) assertKnowledgeTarget(reading[field], record.id, field);
    }
    for (const field of ['prerequisites', 'nearby']) {
      for (const target of reading[field] ?? []) assertKnowledgeTarget(target, record.id, field);
    }
  }
  for (const reference of meta.knowledge_references ?? []) {
    if (!reference?.title || !/^https?:\/\//.test(reference.url ?? '')) {
      throw new Error(`Knowledge references need a title and http(s) URL: ${record.id}`);
    }
  }
  for (const target of meta.knowledge_sketches ?? []) {
    if (!target.startsWith('sketches/') || !byId.has(target)) {
      throw new Error(`Invalid Knowledge Sketch target ${target}: ${record.id}`);
    }
  }
}

for (const record of records.filter((entry) => entry.id.startsWith('knowledge/'))) {
  if (record.meta.content_kind !== 'knowledge') continue;
  const areaPaths = knowledgeDomainAreaPaths.get(record.meta.knowledge_domain);
  if (!areaPaths) throw new Error(`Knowledge page references missing domain: ${record.id}`);
  const areaPath = (record.meta.knowledge_area ?? []).join('/');
  if (!areaPaths.has(areaPath)) {
    throw new Error(`Knowledge page references missing area ${areaPath}: ${record.id}`);
  }
}
const productionVisible = (record) =>
  record.id.startsWith('writing/') || record.id.startsWith('knowledge/')
    ? ['ready', 'published'].includes(record.meta.publication_status)
    : true;

for (const record of records) {
  assertMarkdownStructure(record);
  for (const field of dateFields) {
    const value = record.meta[field];
    if (value === undefined) continue;
    if (
      typeof value !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      Number.isNaN(Date.parse(`${value}T00:00:00Z`))
    ) {
      throw new Error(`Invalid ISO date ${field} on ${record.id}: ${String(value)}`);
    }
  }
  if (primaryNamespaces.has(record.id.split('/')[0])) {
    for (const required of ['id', 'title', 'description', 'content_kind', 'slug']) {
      if (!record.meta[required]) warnings.push(`Missing metadata ${required} on ${record.id}`);
    }
  }
  if (
    record.id.startsWith('projects/') &&
    record.meta.project_destination !== 'external' &&
    record.body.replace(/\s+/g, ' ').trim().length < 220 &&
    /https:\/\/github\.com\//.test(record.body)
  ) {
    warnings.push(`Thin project detail page; consider enriching or linking directly: ${record.id}`);
  }
  if (record.meta.project_destination !== undefined && !record.id.startsWith('projects/')) {
    throw new Error(`project_destination is only valid on project records: ${record.id}`);
  }
  if (record.meta.project_group !== undefined && !record.id.startsWith('projects/')) {
    throw new Error(`project_group is only valid on project records: ${record.id}`);
  }
  if (record.meta.project_order !== undefined && !record.id.startsWith('projects/')) {
    throw new Error(`project_order is only valid on project records: ${record.id}`);
  }
  if (record.id.startsWith('projects/')) {
    if (!['core-engineering', 'experiments-community'].includes(record.meta.project_group)) {
      throw new Error(`Project needs a valid project_group: ${record.id}`);
    }
    if (
      record.meta.project_order !== undefined &&
      (!Number.isInteger(record.meta.project_order) || record.meta.project_order < 0)
    ) {
      throw new Error(`Project order must be a non-negative integer: ${record.id}`);
    }
  }
  if (record.id.startsWith('projects/') && record.meta.project_destination === 'external') {
    const hasFeaturedDestination = (record.meta.public_links ?? []).some(
      (link) =>
        link.featured === true && ['repository', 'profile', 'organization'].includes(link.kind),
    );
    if (!hasFeaturedDestination) {
      throw new Error(
        `External project needs a featured repository, profile, or organization link: ${record.id}`,
      );
    }
  }
  if (ids.has(record.id)) throw new Error(`Duplicate public ID: ${record.id}`);
  ids.add(record.id);
  const namespace = record.id.split('/')[0];
  if (
    (namespace === 'writing' || namespace === 'knowledge') &&
    !['draft', 'review', 'ready', 'published'].includes(record.meta.publication_status)
  ) {
    throw new Error(
      `Knowledge and writing records must have a valid publication status: ${record.id}`,
    );
  }
  if (namespace === 'writing') {
    const mode = record.meta.writing_mode ?? 'editorial';
    if (!['editorial', 'reference'].includes(mode))
      throw new Error(`Writing record must have a valid writing_mode: ${record.id}`);
    const hasSection = record.meta.field_note_section !== undefined;
    const hasOrder = record.meta.field_note_order !== undefined;
    if (mode === 'reference') {
      if (!fieldNoteSections.has(record.meta.field_note_section))
        throw new Error(`Reference writing needs a valid field_note_section: ${record.id}`);
      if (!Number.isInteger(record.meta.field_note_order) || record.meta.field_note_order < 0)
        throw new Error(`Reference writing needs a non-negative field_note_order: ${record.id}`);
      if (!record.meta.last_verified)
        throw new Error(`Reference writing needs last_verified: ${record.id}`);
      const key = `${record.meta.field_note_section}:${record.meta.field_note_order}`;
      if (fieldNoteOrders.has(key))
        throw new Error(
          `Duplicate field note order ${key}: ${record.id} and ${fieldNoteOrders.get(key)}`,
        );
      fieldNoteOrders.set(key, record.id);
    } else if (hasSection || hasOrder) {
      throw new Error(`Field note metadata is only valid for reference writing: ${record.id}`);
    }
  } else if (
    record.meta.writing_mode !== undefined ||
    record.meta.field_note_section !== undefined ||
    record.meta.field_note_order !== undefined
  ) {
    throw new Error(`Field note metadata is only valid on writing records: ${record.id}`);
  }
  if (
    namespace !== 'writing' &&
    namespace !== 'knowledge' &&
    record.meta.publication_status !== undefined
  ) {
    throw new Error(`publication_status is only valid on writing records: ${record.id}`);
  }
  if (namespace === 'social' && !['self', 'third-party'].includes(record.meta.authorship)) {
    throw new Error(`Social record must declare authorship: ${record.id}`);
  }
  if (namespace === 'sketches') {
    if (record.meta.content_kind !== 'sketch')
      throw new Error(`Sketch record must use content_kind: sketch: ${record.id}`);
    if (!/^\/sketches\/[a-z0-9][a-z0-9_-]*\.excalidraw$/.test(record.meta.sketch_source ?? ''))
      throw new Error(`Sketch needs a valid sketch_source: ${record.id}`);
    const sourcePath = resolve(publicRoot, `.${record.meta.sketch_source}`);
    if (!sourcePath.startsWith(`${publicRoot}/`) || !existsSync(sourcePath))
      throw new Error(`Missing Excalidraw source ${record.meta.sketch_source} on ${record.id}`);
    if (
      !/^(architecture|debugging|teaching|content-model|working-model)$/.test(
        record.meta.sketch_role ?? '',
      )
    )
      throw new Error(`Sketch needs a valid sketch_role: ${record.id}`);
  }
  for (const media of record.meta.media ?? []) {
    if (!/^\/media\/[a-z0-9][a-z0-9._/-]*$/.test(media.path))
      throw new Error(`Media must use a safe /media/ path: ${record.id}`);
    const mediaPath = resolve(publicRoot, `.${media.path}`);
    if (!mediaPath.startsWith(`${publicRoot}/`))
      throw new Error(`Media escapes public root: ${media.path}`);
    if (!existsSync(mediaPath)) throw new Error(`Missing media ${media.path} on ${record.id}`);
    if (lstatSync(mediaPath).isSymbolicLink())
      throw new Error(`Symlinked media is not allowed: ${media.path}`);
    if (!['photo', 'certificate', 'diagram'].includes(media.kind))
      throw new Error(`Unsupported media kind on ${record.id}`);
    if (!/\.(avif|gif|jpe?g|pdf|png|svg|webp)$/i.test(mediaPath))
      throw new Error(`Unsupported media type on ${record.id}: ${media.path}`);
    if (!media.alt) throw new Error(`Media needs alt text on ${record.id}`);
  }
}

const routePaths = new Set([
  '/',
  '/about',
  '/contributions',
  '/credentials',
  '/projects',
  '/explore',
  '/work',
  '/writing',
  '/writing/notes',
  '/sketches',
  '/knowledge',
  '/knowledge/all',
  '/knowledge/domain',
]);
for (const record of primary) {
  if (!(record.id.startsWith('projects/') && record.meta.project_destination === 'external')) {
    routePaths.add(record.meta.slug);
  }
}
for (const record of records) {
  for (const match of record.body.matchAll(/\]\((\/[^)#\s]+)(?:#[^)]*)?\)/g)) {
    if (!routePaths.has(match[1]))
      throw new Error(`Broken internal link ${match[1]} on ${record.id}`);
  }
}

for (const record of primary) {
  if (slugs.has(record.meta.slug)) throw new Error(`Duplicate slug: ${record.meta.slug}`);
  slugs.add(record.meta.slug);
  for (const relation of record.meta.public_relations ?? []) {
    if (!byId.has(relation.target))
      throw new Error(`Unresolved relation ${relation.target} on ${record.id}`);
    if (!productionVisible(byId.get(relation.target)))
      throw new Error(`Production relation ${relation.target} is not visible on ${record.id}`);
  }
  for (const targets of Object.values(record.meta.curation ?? {})) {
    for (const target of targets) {
      if (!byId.has(target))
        throw new Error(`Unresolved curation target ${target} on ${record.id}`);
      const fixtureKnowledgeCuration =
        record.meta.fixture_only === true &&
        record.id.startsWith('pages/') &&
        target.startsWith('knowledge/');
      if (!productionVisible(byId.get(target)) && !fixtureKnowledgeCuration)
        throw new Error(`Production curation target ${target} is not visible on ${record.id}`);
    }
  }
}

for (const record of records.filter((entry) => entry.id.startsWith('social/'))) {
  for (const target of record.meta.related_records ?? []) {
    if (!byId.has(target))
      throw new Error(`Social card ${record.id} references missing record ${target}`);
    if (!productionVisible(byId.get(target)))
      throw new Error(`Social card ${record.id} references a non-production record ${target}`);
  }
}

const externalUrls = new Set();
for (const record of records.filter((entry) => entry.id.startsWith('social/'))) {
  if (!record.meta.external_url) continue;
  if (externalUrls.has(record.meta.external_url))
    throw new Error(`Duplicate external URL: ${record.meta.external_url}`);
  externalUrls.add(record.meta.external_url);
}

console.log(
  `Public content check passed (${primary.length} site records, ${records.length - primary.length} catalog records).`,
);
for (const warning of [...new Set(warnings)]) console.warn(`Content warning: ${warning}`);
