import assert from 'node:assert/strict';
import test from 'node:test';
import {
  filterKnowledgeIndexEntries,
  knowledgeIndexWindow,
  knowledgeSearchText,
  sortKnowledgeIndexEntries,
} from '../src/lib/knowledge-index.ts';

const entries = [
  {
    title: 'Évent processing',
    search: knowledgeSearchText(['Évent processing', 'A guide to messages', 'computing']),
    domain: 'computing',
    kind: 'guide',
    updated: '2026-09-20',
  },
  {
    title: 'Counting principles',
    search: knowledgeSearchText(['Counting principles', 'Combinatorics', 'mathematics']),
    domain: 'mathematics',
    kind: 'concept',
    updated: '2026-09-21',
  },
  {
    title: 'System boundaries',
    search: knowledgeSearchText(['System boundaries', 'Computing systems', 'computing']),
    domain: 'computing',
    kind: 'concept',
    updated: '2026-09-21',
  },
];

test('matches normalized terms across Knowledge search text', () => {
  const matches = filterKnowledgeIndexEntries(entries, {
    query: 'event',
    domain: 'all',
    kind: 'all',
  });
  assert.deepEqual(
    matches.map((entry) => entry.title),
    ['Évent processing'],
  );
});

test('combines domain and kind filters', () => {
  const matches = filterKnowledgeIndexEntries(entries, {
    query: '',
    domain: 'computing',
    kind: 'concept',
  });
  assert.deepEqual(
    matches.map((entry) => entry.title),
    ['System boundaries'],
  );
});

test('sorts updated pages newest first with a title tie-breaker', () => {
  const sorted = sortKnowledgeIndexEntries(entries, 'updated');
  assert.deepEqual(
    sorted.map((entry) => entry.title),
    ['Counting principles', 'System boundaries', 'Évent processing'],
  );
});

test('windows a 10,000-page result set without changing its order', () => {
  const largeIndex = Array.from({ length: 10_000 }, (_, index) => ({
    title: `Page ${String(index + 1).padStart(4, '0')}`,
    search: `page ${index + 1}`,
  }));
  const window = knowledgeIndexWindow(largeIndex, 40);
  assert.equal(window.length, 40);
  assert.equal(window[0].title, 'Page 0001');
  assert.equal(window.at(-1)?.title, 'Page 0040');
});
