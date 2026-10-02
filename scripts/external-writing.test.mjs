import assert from 'node:assert/strict';
import test from 'node:test';
import {
  devtoArticle,
  devtoItems,
  devtoReaderHref,
  externalReaderHref,
  mediumItems,
  mediumReaderSlug,
  applyExternalWritingOverlay,
  fetchMediumWriting,
  normalizeExternalUrl,
} from '../src/lib/external-writing.ts';
import { feedCardMatchesFilter } from '../src/lib/writing-feed.ts';

test('normalizes provider URLs without changing the owned path', () => {
  assert.equal(
    normalizeExternalUrl('https://example.com/article/?utm_source=feed#top'),
    'https://example.com/article',
  );
});

test('normalizes Medium RSS entries and ignores malformed items', () => {
  const items = mediumItems(`
    <rss><channel>
      <item>
        <title><![CDATA[API Traffic Management]]></title>
        <link>https://medium.com/@kevin/api-traffic-management-abcdef123456?source=feed</link>
        <guid isPermaLink="false">https://medium.com/p/abcdef123456</guid>
        <pubDate>Sun, 11 May 2025 00:00:00 GMT</pubDate>
        <category><![CDATA[Software Architecture]]></category>
      </item>
      <item><link>https://medium.com/@kevin/incomplete</link></item>
    </channel></rss>
  `);
  assert.deepEqual(items, [
    {
      source: 'medium',
      sourceId: 'medium:https://medium.com/p/abcdef123456',
      title: 'API Traffic Management',
      description: 'Originally published on Medium — API Traffic Management',
      url: 'https://medium.com/@kevin/api-traffic-management-abcdef123456',
      canonicalUrl: 'https://medium.com/p/abcdef123456',
      publishedAt: '2025-05-11',
      tags: ['software-architecture'],
      authorship: 'self',
    },
  ]);
});

test('keeps a Medium RSS body only for the on-site reader', () => {
  const [item] = mediumItems(`
    <rss><channel><item>
      <title><![CDATA[Reader body]]></title>
      <link>https://medium.com/@kevin/reader-body-abcdef123456</link>
      <guid>https://medium.com/p/abcdef123456</guid>
      <content:encoded><![CDATA[<p>Provider <strong>body</strong></p><script>alert(1)</script>]]></content:encoded>
    </item></channel></rss>
  `);
  assert.equal(item.bodyHtml, '<p>Provider <strong>body</strong></p><script>alert(1)</script>');
  assert.equal(mediumReaderSlug(item.sourceId), 'abcdef123456');
  assert.equal(
    externalReaderHref({ ...item, relatedRecords: [], featured: false }),
    '/writing/external/medium/abcdef123456',
  );
});

test('normalizes DEV articles and merges stable-ID curation', () => {
  const [item] = devtoItems(
    JSON.stringify([
      {
        id: 42,
        title: 'A DEV article',
        url: 'https://dev.to/kevin/a-dev-article?utm_source=feed',
        canonical_url: 'https://kevin.example/a-dev-article',
        published_at: '2025-06-01T12:00:00Z',
        tag_list: ['backend', 'systems'],
        slug: 'a-dev-article',
      },
    ]),
  );
  const result = applyExternalWritingOverlay([item], {
    'devto:42': {
      note: 'Reviewed description',
      featured: true,
      relatedRecords: ['projects/krakend-iac-toolkit'],
    },
  });
  assert.equal(item.url, 'https://dev.to/kevin/a-dev-article');
  assert.equal(item.canonicalUrl, 'https://kevin.example/a-dev-article');
  assert.equal(result.items[0].description, 'Reviewed description');
  assert.equal(result.items[0].featured, true);
  assert.deepEqual(result.items[0].relatedRecords, ['projects/krakend-iac-toolkit']);
  assert.deepEqual(result.staleKeys, []);
});

test('normalizes a DEV reader response and only creates safe reader URLs', () => {
  const article = devtoArticle({
    id: 42,
    title: 'A DEV article',
    url: 'https://dev.to/kevin/a-dev-article',
    canonical_url: 'https://dev.to/kevin/a-dev-article',
    body_html: '<p>Reader body</p>',
  });
  assert.equal(article.bodyHtml, '<p>Reader body</p>');
  assert.equal(
    devtoReaderHref(article.sourceId, article.url),
    '/writing/external/devto?article=42&url=https%3A%2F%2Fdev.to%2Fkevin%2Fa-dev-article',
  );
  assert.equal(devtoReaderHref('devto:42', 'https://example.com/article'), undefined);
  assert.equal(devtoReaderHref('devto:not-an-id', article.url), undefined);
});

test('hides curated provider items and reports stale overlay keys', () => {
  const result = applyExternalWritingOverlay(
    [
      {
        source: 'devto',
        sourceId: 'devto:42',
        title: 'Hidden',
        description: 'Hidden',
        url: 'https://dev.to/example/hidden',
        canonicalUrl: 'https://dev.to/example/hidden',
        tags: [],
        authorship: 'self',
      },
    ],
    { 'devto:42': { hidden: true }, 'devto:999': { hidden: true } },
  );
  assert.deepEqual(result.items, []);
  assert.deepEqual(result.staleKeys, ['devto:999']);
});

test('surfaces provider failures to the non-fatal build wrapper', async () => {
  await assert.rejects(
    fetchMediumWriting('https://medium.example/feed', async () => ({
      ok: false,
      status: 503,
      text: async () => '',
    })),
    /Medium feed failed: 503/,
  );
  assert.throws(() => devtoItems({ nope: true }), /DEV response must be an array/);
});

test('applies the selected filter to cards inserted after initial page load', () => {
  const cards = ['case_study', 'external_publication', 'note'];
  assert.deepEqual(
    cards.filter((kind) => feedCardMatchesFilter(kind, 'external_publication')),
    ['external_publication'],
  );
  assert.equal(feedCardMatchesFilter('external_publication', 'all'), true);
});
