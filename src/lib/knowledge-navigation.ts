import type { KnowledgeArea, PublicContent } from './public-contract';

export interface KnowledgeAreaNode {
  domain: string;
  domainLabel: string;
  area: KnowledgeArea;
  path: string[];
  parentPath: string[];
  href: string;
  labelPath: string[];
}

export function knowledgeAreaHref(domain: string, path: string[]): string {
  return `/knowledge/domain/${domain}/${path.join('/')}`;
}

export function knowledgeAreaAtPath(
  areas: KnowledgeArea[] | undefined,
  path: string[],
): KnowledgeArea | undefined {
  let current = areas ?? [];
  let match: KnowledgeArea | undefined;
  for (const id of path) {
    match = current.find((area) => area.id === id);
    if (!match) return undefined;
    current = match.children;
  }
  return match;
}

export function knowledgeAreaLabels(areas: KnowledgeArea[] | undefined, path: string[]): string[] {
  const labels: string[] = [];
  let current = areas ?? [];
  for (const id of path) {
    const match = current.find((area) => area.id === id);
    if (!match) break;
    labels.push(match.title);
    current = match.children;
  }
  return labels;
}

export function flattenKnowledgeAreas(
  domain: Pick<PublicContent, 'knowledge_domain' | 'title' | 'knowledge_areas'>,
): KnowledgeAreaNode[] {
  const nodes: KnowledgeAreaNode[] = [];
  const visit = (areas: KnowledgeArea[], parentPath: string[], labelPath: string[]) => {
    for (const area of areas) {
      const path = [...parentPath, area.id];
      const nextLabels = [...labelPath, area.title];
      nodes.push({
        domain: domain.knowledge_domain ?? '',
        domainLabel: domain.title,
        area,
        path,
        parentPath,
        href: knowledgeAreaHref(domain.knowledge_domain ?? '', path),
        labelPath: nextLabels,
      });
      visit(area.children, path, nextLabels);
    }
  };
  visit(domain.knowledge_areas ?? [], [], []);
  return nodes;
}

export function knowledgePagesInArea(
  pages: PublicContent[],
  domain: string | undefined,
  path: string[],
): PublicContent[] {
  return pages.filter(
    (page) =>
      page.knowledge_domain === domain &&
      path.every((segment, index) => page.knowledge_area?.[index] === segment),
  );
}

export function knowledgePagesDirectlyInArea(
  pages: PublicContent[],
  domain: string | undefined,
  path: string[],
): PublicContent[] {
  return pages.filter(
    (page) =>
      page.knowledge_domain === domain &&
      JSON.stringify(page.knowledge_area ?? []) === JSON.stringify(path),
  );
}

export function knowledgeAreaPathFromQuery(params: URLSearchParams): string[] {
  const explicitPath = params.get('path') ?? params.get('area-path');
  if (explicitPath) return explicitPath.split('/').filter(Boolean);
  return [params.get('area'), params.get('subarea')].filter((value): value is string =>
    Boolean(value),
  );
}

export function knowledgeAreaQuery(domain: string, path: string[]): string {
  const params = new URLSearchParams();
  params.set('domain', domain);
  if (path.length === 1) params.set('area', path[0]);
  else if (path.length === 2) {
    params.set('area', path[0]);
    params.set('subarea', path[1]);
  } else if (path.length > 2) params.set('path', path.join('/'));
  return `/knowledge/all/?${params.toString()}`;
}
