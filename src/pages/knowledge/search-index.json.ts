import type { APIRoute } from 'astro';
import { getKnowledgeDomainItems, getKnowledgeItems } from '../../lib/content';
import { knowledgeIndexItemFromContent } from '../../lib/knowledge-index';
import { flattenKnowledgeAreas } from '../../lib/knowledge-navigation';

export const GET: APIRoute = async () => {
  const [domains, pages] = await Promise.all([getKnowledgeDomainItems(), getKnowledgeItems()]);
  const domainTitles = new Map(domains.map((domain) => [domain.knowledge_domain, domain.title]));
  const items = pages.map((page) =>
    knowledgeIndexItemFromContent(
      page,
      domainTitles.get(page.knowledge_domain) ?? page.knowledge_domain ?? 'Knowledge',
      flattenKnowledgeAreas(
        domains.find((domain) => domain.knowledge_domain === page.knowledge_domain) ?? {
          title: page.knowledge_domain ?? 'Knowledge',
          knowledge_domain: page.knowledge_domain,
          knowledge_areas: [],
        },
      ).find((node) => JSON.stringify(node.path) === JSON.stringify(page.knowledge_area ?? []))
        ?.labelPath ?? [],
    ),
  );
  const nodes = domains.flatMap((domain) => [
    {
      title: domain.title,
      description: domain.description,
      href: domain.slug,
      type: 'domain',
      domain: domain.knowledge_domain,
      pathLabel: '',
      search: `${domain.title} ${domain.description}`.toLocaleLowerCase(),
    },
    ...flattenKnowledgeAreas(domain).map((node) => ({
      title: node.area.title,
      description: node.area.description,
      href: node.href,
      type: 'area',
      domain: node.domain,
      pathLabel: node.labelPath.join(' · '),
      search:
        `${node.area.title} ${node.area.description} ${node.domainLabel} ${node.labelPath.join(' ')}`.toLocaleLowerCase(),
    })),
  ]);
  return new Response(JSON.stringify({ items, nodes }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
