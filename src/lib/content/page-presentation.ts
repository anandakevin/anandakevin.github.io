import type { CollectionEntry } from 'astro:content';
import type { pageHeroSchema, pagePrincipleSchema } from '../public-contract';
import type { z } from 'astro/zod';

type PageEntry = CollectionEntry<'pages'>;

export type PageHero = z.infer<typeof pageHeroSchema>;
export type PagePrinciple = z.infer<typeof pagePrincipleSchema>;

export function pageHeroFromEntry(entry: PageEntry | undefined): PageHero | undefined {
  return entry?.data.page_hero;
}

export function pagePrinciplesFromEntry(entry: PageEntry | undefined): PagePrinciple[] {
  return entry?.data.page_principles ?? [];
}
