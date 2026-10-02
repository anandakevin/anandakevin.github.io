import type { ExternalWritingOverlay } from '../data/external-writing';

export type ExternalWritingSource = 'devto' | 'medium' | 'linkedin';
export type ExternalWritingAuthorship = 'self' | 'third-party';

export type ExternalWritingItem = {
  source: ExternalWritingSource;
  sourceId: string;
  title: string;
  description?: string;
  url: string;
  canonicalUrl: string;
  publishedAt?: string;
  tags: string[];
  authorship: ExternalWritingAuthorship;
  relatedRecords: string[];
  featured: boolean;
  /** Provider-supplied HTML is reader-only and is never copied into Markdown. */
  bodyHtml?: string;
};

export type ExternalWritingProviderItem = Omit<ExternalWritingItem, 'relatedRecords' | 'featured'>;

export function normalizeExternalUrl(value: string): string {
  const parsed = new URL(value.startsWith('http') ? value : `https://${value}`);
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

function cleanText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const text = value
    .replace(/<[^>]+>/g, ' ')
    .replace(
      /&(?:amp|lt|gt|quot|#39);/g,
      (entity) =>
        ({
          '&amp;': '&',
          '&lt;': '<',
          '&gt;': '>',
          '&quot;': '"',
          '&#39;': "'",
        })[entity] ?? entity,
    )
    .replace(/\s+/g, ' ')
    .trim();
  return text || undefined;
}

function providerDescription(
  source: ExternalWritingSource,
  title: string,
  description?: string,
): string {
  return (
    description ||
    `Originally published on ${source === 'devto' ? 'DEV' : source === 'medium' ? 'Medium' : 'LinkedIn'} — ${title}`
  );
}

function tagsFromValue(value: unknown): string[] {
  const values = Array.isArray(value) ? value : String(value ?? '').split(',');
  return values.map((tag) => String(tag).trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);
}

function isoDate(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString().slice(0, 10);
}

function xmlText(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cdata = value.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/i);
  return (cdata?.[1] ?? value).trim() || undefined;
}

function devtoItem(value: Record<string, unknown>): ExternalWritingProviderItem | undefined {
  const id = value.id;
  const title = typeof value.title === 'string' ? value.title.trim() : '';
  const urlValue = typeof value.url === 'string' ? value.url : '';
  if ((!Number.isInteger(id) && typeof id !== 'string') || !title || !urlValue) return undefined;
  const url = normalizeExternalUrl(urlValue);
  const canonicalUrl = normalizeExternalUrl(
    typeof value.canonical_url === 'string' ? value.canonical_url : url,
  );
  const bodyHtml =
    typeof value.body_html === 'string' ? value.body_html.trim() || undefined : undefined;
  return {
    source: 'devto',
    sourceId: `devto:${String(id)}`,
    title,
    description: providerDescription(
      'devto',
      title,
      cleanText(value.description ?? value.description_html),
    ),
    url,
    canonicalUrl,
    publishedAt: isoDate(value.published_at),
    tags: tagsFromValue(value.tag_list ?? value.tags),
    authorship: 'self',
    ...(bodyHtml ? { bodyHtml } : {}),
  };
}

export function mediumItems(xml: string): ExternalWritingProviderItem[] {
  const items: ExternalWritingProviderItem[] = [];
  const pattern = /<item>([\s\S]*?)<\/item>/gi;
  for (let match = pattern.exec(xml); match; match = pattern.exec(xml)) {
    const block = match[1];
    const link = block.match(/<link(?:\s[^>]*)?>([\s\S]*?)<\/link>/i)?.[1];
    const titleMatch = block.match(
      /<title(?:\s[^>]*)?><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i,
    );
    if (!link || !titleMatch) continue;
    const url = normalizeExternalUrl(cleanText(link) ?? link);
    const title = (titleMatch[1] ?? titleMatch[2]).trim();
    const guid = cleanText(block.match(/<guid(?:\s[^>]*)?>([\s\S]*?)<\/guid>/i)?.[1]);
    const description = cleanText(
      xmlText(block.match(/<description(?:\s[^>]*)?>([\s\S]*?)<\/description>/i)?.[1]),
    );
    const bodyHtml = xmlText(
      block.match(/<content:encoded(?:\s[^>]*)?>([\s\S]*?)<\/content:encoded>/i)?.[1],
    );
    const categories = [
      ...block.matchAll(/<category(?:\s[^>]*)?><!\[CDATA\[([\s\S]*?)\]\]><\/category>/gi),
    ].map((entry) => entry[1]);
    const canonicalUrl = normalizeExternalUrl(guid?.startsWith('http') ? guid : url);
    const sourceId = `medium:${guid || canonicalUrl}`;
    items.push({
      source: 'medium',
      sourceId,
      title,
      description: providerDescription('medium', title, description),
      url,
      canonicalUrl,
      publishedAt: isoDate(block.match(/<pubDate(?:\s[^>]*)?>([\s\S]*?)<\/pubDate>/i)?.[1]),
      tags: tagsFromValue(categories),
      authorship: 'self',
      ...(bodyHtml ? { bodyHtml } : {}),
    });
  }
  return items;
}

export function devtoItems(payload: unknown): ExternalWritingProviderItem[] {
  if (typeof payload === 'string') payload = JSON.parse(payload);
  if (!Array.isArray(payload)) throw new Error('DEV response must be an array.');
  return payload.flatMap((article) => {
    if (!article || typeof article !== 'object') return [];
    const item = devtoItem(article as Record<string, unknown>);
    return item ? [item] : [];
  });
}

export function devtoArticle(payload: unknown): ExternalWritingProviderItem {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    throw new Error('DEV article response must be an object.');
  const item = devtoItem(payload as Record<string, unknown>);
  if (!item) throw new Error('DEV article response is missing required article fields.');
  return item;
}

export function mediumReaderSlug(sourceId: string): string | undefined {
  if (!sourceId.startsWith('medium:')) return undefined;
  try {
    const segment = new URL(sourceId.slice('medium:'.length)).pathname
      .split('/')
      .filter(Boolean)
      .pop();
    return segment && /^[a-z0-9-]+$/i.test(segment) ? segment : undefined;
  } catch {
    return undefined;
  }
}

export function devtoReaderHref(sourceId: string, url: string): string | undefined {
  if (!sourceId.startsWith('devto:') || !/^\d+$/.test(sourceId.slice('devto:'.length)))
    return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'dev.to') return undefined;
    return `/writing/external/devto?article=${encodeURIComponent(sourceId.slice('devto:'.length))}&url=${encodeURIComponent(parsed.toString())}`;
  } catch {
    return undefined;
  }
}

export function externalReaderHref(
  item: ExternalWritingProviderItem | ExternalWritingItem,
): string | undefined {
  if (item.authorship !== 'self') return undefined;
  if (item.source === 'medium') {
    const slug = mediumReaderSlug(item.sourceId);
    return slug ? `/writing/external/medium/${slug}` : undefined;
  }
  if (item.source === 'devto') return devtoReaderHref(item.sourceId, item.url);
  return undefined;
}

export function applyExternalWritingOverlay(
  items: ExternalWritingProviderItem[],
  overlay: Record<string, ExternalWritingOverlay>,
): { items: ExternalWritingItem[]; staleKeys: string[] } {
  const seen = new Set<string>();
  const normalized = items.flatMap((item) => {
    const curation = overlay[item.sourceId];
    seen.add(item.sourceId);
    if (curation?.hidden) return [];
    return [
      {
        ...item,
        description: curation?.note || item.description,
        relatedRecords: curation?.relatedRecords ?? [],
        featured: curation?.featured ?? false,
      },
    ];
  });
  return {
    items: normalized,
    staleKeys: Object.keys(overlay).filter((key) => !seen.has(key)),
  };
}

export async function fetchMediumWriting(
  feedUrl: string,
  fetcher: typeof fetch = fetch,
): Promise<ExternalWritingProviderItem[]> {
  const response = await fetcher(feedUrl);
  if (!response.ok) throw new Error(`Medium feed failed: ${response.status}`);
  return mediumItems(await response.text());
}
