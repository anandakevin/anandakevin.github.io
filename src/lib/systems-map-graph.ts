import { publicRelationLabel, type MapDomain, type PublicContent } from './public-contract';
import { hrefForPublicRecord } from './content/mappers';

export type MapTerritoryId = 'engineering' | 'learning' | 'knowledge';

export type MapTerritory = {
  id: MapTerritoryId;
  label: string;
  cx: number;
  cy: number;
  focusScale: number;
};

export type MapSubterritory = {
  id: Extract<MapDomain, `engineering/${string}`>;
  parent: 'engineering';
  label: string;
  cx: number;
  cy: number;
  focusScale: number;
};

export type MapArtifactKind =
  'Work' | 'Project' | 'Writing' | 'Contribution' | 'Sketch' | 'Knowledge';
export type MapProminence = 'landmark' | 'normal';

export type SystemsMapArtifact = {
  id: string;
  kind: MapArtifactKind;
  subtype: string;
  /** Human-readable Knowledge domain/area context; derived from the Knowledge taxonomy. */
  subjectPath: string[];
  title: string;
  description: string;
  href: string;
  domains: MapDomain[];
  prominence: MapProminence;
  x: number;
  y: number;
  r: number;
};

export type SystemsMapEdge = {
  a: string;
  b: string;
  source: string;
  target: string;
  label: string;
  reverseLabel: string;
};

export type SystemsMapGraph = {
  home: { id: 'home'; label: string; x: number; y: number };
  territories: MapTerritory[];
  subterritories: MapSubterritory[];
  artifacts: SystemsMapArtifact[];
  edges: SystemsMapEdge[];
};

export const MAP_VIEWBOX = { width: 1800, height: 1200 };
export const MAP_COLORS: Record<MapArtifactKind, string> = {
  Work: '#48c6ff',
  Project: '#4de1a7',
  Writing: '#aa8cff',
  Contribution: '#ffb45f',
  Sketch: '#466b89',
  Knowledge: '#c75f3e',
};

export const HOME = { id: 'home' as const, label: 'Overview', x: 900, y: 640 };

export const TERRITORIES: MapTerritory[] = [
  { id: 'engineering', label: 'Engineering', cx: 650, cy: 355, focusScale: 1 },
  { id: 'learning', label: 'Learning · Education', cx: 1315, cy: 790, focusScale: 1.12 },
  { id: 'knowledge', label: 'Knowledge · Publishing', cx: 590, cy: 925, focusScale: 1.2 },
];

export const SUBTERRITORIES: MapSubterritory[] = [
  {
    id: 'engineering/backend-platform-delivery',
    parent: 'engineering',
    label: 'Backend · Platform · Delivery',
    cx: 330,
    cy: 300,
    focusScale: 1.18,
  },
  {
    id: 'engineering/systems-data-reliability',
    parent: 'engineering',
    label: 'Systems · Data · Reliability',
    cx: 765,
    cy: 290,
    focusScale: 1.16,
  },
  {
    id: 'engineering/applied-ml-product',
    parent: 'engineering',
    label: 'Applied ML · Product',
    cx: 1190,
    cy: 330,
    focusScale: 1.2,
  },
];

const DOMAIN_POSITIONS: Record<MapDomain, { x: number; y: number }> = {
  'engineering/backend-platform-delivery': { x: 330, y: 300 },
  'engineering/systems-data-reliability': { x: 765, y: 290 },
  'engineering/applied-ml-product': { x: 1190, y: 330 },
  'learning-education': { x: 1315, y: 790 },
  'knowledge-publishing': { x: 590, y: 925 },
};

function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function fallbackDomainsForRecord(record: PublicContent): MapDomain[] {
  if (record.content_kind === 'contribution') return ['learning-education'];
  if (record.content_kind === 'project' || record.content_kind === 'work') {
    return ['engineering/systems-data-reliability'];
  }
  if (record.content_kind === 'sketch') return ['knowledge-publishing'];
  if (record.content_kind === 'knowledge' || record.content_kind === 'knowledge_domain') {
    return ['knowledge-publishing'];
  }
  return ['knowledge-publishing'];
}

function domainsForRecord(record: PublicContent): MapDomain[] {
  return record.map?.domains?.length ? record.map.domains : fallbackDomainsForRecord(record);
}

function artifactKindForRecord(record: PublicContent): MapArtifactKind | undefined {
  if (record.content_kind === 'work') return 'Work';
  if (record.content_kind === 'project') return 'Project';
  if (record.content_kind === 'contribution') return 'Contribution';
  if (['article', 'case_study', 'note'].includes(record.content_kind)) return 'Writing';
  if (record.content_kind === 'sketch') return 'Sketch';
  if (record.content_kind === 'knowledge' || record.content_kind === 'knowledge_domain') {
    return 'Knowledge';
  }
  return undefined;
}

function subtypeForRecord(record: PublicContent): string {
  if (record.content_kind === 'work') return record.work_role ?? 'work';
  if (record.content_kind === 'project') return record.project_categories?.join(' · ') ?? 'project';
  if (record.content_kind === 'contribution') {
    return record.contribution_type?.join(' · ') ?? 'contribution';
  }
  if (record.content_kind === 'sketch') return record.sketch_role ?? 'visual artifact';
  if (record.content_kind === 'knowledge_domain') return 'domain map';
  if (record.content_kind === 'knowledge') return record.knowledge_kind ?? 'knowledge page';
  return record.content_kind === 'case_study' ? 'case study' : 'field note';
}

function titleFromSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

type KnowledgeSubjectIndex = {
  domains: Map<string, string>;
  areas: Map<string, string>;
};

function buildKnowledgeSubjectIndex(records: PublicContent[]): KnowledgeSubjectIndex {
  const domains = new Map<string, string>();
  const areas = new Map<string, string>();
  const visit = (
    domain: string,
    areasInDomain: PublicContent['knowledge_areas'],
    parent: string[],
  ) => {
    for (const area of areasInDomain ?? []) {
      const path = [...parent, area.id];
      areas.set(`${domain}/${path.join('/')}`, area.title);
      visit(domain, area.children, path);
    }
  };

  records
    .filter((record) => record.content_kind === 'knowledge_domain')
    .forEach((record) => {
      if (!record.knowledge_domain) return;
      domains.set(record.knowledge_domain, record.title);
      visit(record.knowledge_domain, record.knowledge_areas, []);
    });

  return { domains, areas };
}

function subjectPathForRecord(record: PublicContent, index: KnowledgeSubjectIndex): string[] {
  if (record.content_kind === 'knowledge_domain') return [record.title];
  if (record.content_kind !== 'knowledge' || !record.knowledge_domain) return [];

  const domain =
    index.domains.get(record.knowledge_domain) ?? titleFromSlug(record.knowledge_domain);
  const areaPath = record.knowledge_area ?? [];
  const areaLabels = areaPath.map(
    (areaId, position) =>
      index.areas.get(`${record.knowledge_domain}/${areaPath.slice(0, position + 1).join('/')}`) ??
      titleFromSlug(areaId),
  );
  return [domain, ...areaLabels];
}

function topTerritoryForDomain(domain: MapDomain): MapTerritoryId {
  if (domain === 'learning-education') return 'learning';
  if (domain === 'knowledge-publishing') return 'knowledge';
  return 'engineering';
}

function positionForArtifact(
  record: PublicContent,
  domains: MapDomain[],
  index: number,
): { x: number; y: number } {
  const center = domains.reduce(
    (point, domain) => ({
      x: point.x + DOMAIN_POSITIONS[domain].x / domains.length,
      y: point.y + DOMAIN_POSITIONS[domain].y / domains.length,
    }),
    { x: 0, y: 0 },
  );
  const seed = hash(record.id);
  const angle = ((seed % 360) * Math.PI) / 180 + (index % 3) * 0.12;
  const radius = 115 + (index % 5) * 46 + (seed % 23);
  return {
    x: Math.max(95, Math.min(MAP_VIEWBOX.width - 95, center.x + Math.cos(angle) * radius)),
    y: Math.max(80, Math.min(MAP_VIEWBOX.height - 80, center.y + Math.sin(angle) * radius)),
  };
}

function addRelationEdge(
  edges: Map<string, SystemsMapEdge>,
  a: string,
  b: string,
  label: string,
): void {
  if (a === b) return;
  const [first, second] = [a, b].sort();
  const key = `${first}:${second}`;
  const reverseLabels: Record<string, string> = {
    'case study of': 'has case study',
    'derived from': 'produced',
    'part of': 'includes',
    includes: 'part of',
    produced: 'produced by',
    'related implementation': 'implemented by',
    'related context': 'related context',
    verifies: 'verified by',
  };
  if (!edges.has(key) || label !== 'related context') {
    edges.set(key, {
      a: first,
      b: second,
      source: a,
      target: b,
      label,
      reverseLabel: reverseLabels[label] ?? label,
    });
  }
}

export function buildSystemsMapGraph(records: PublicContent[]): SystemsMapGraph {
  const knowledgeSubjectIndex = buildKnowledgeSubjectIndex(records);
  const mapRecords = records
    .map((record) => ({ record, kind: artifactKindForRecord(record) }))
    .filter((item): item is { record: PublicContent; kind: MapArtifactKind } => Boolean(item.kind))
    .sort((left, right) => left.record.id.localeCompare(right.record.id));
  const recordIds = new Set(mapRecords.map(({ record }) => record.id));
  const edges = new Map<string, SystemsMapEdge>();
  const artifacts = mapRecords.map(({ record, kind }, index) => {
    const domains = domainsForRecord(record);
    const position = positionForArtifact(record, domains, index);
    for (const relation of record.public_relations) {
      if (recordIds.has(relation.target)) {
        addRelationEdge(edges, record.id, relation.target, publicRelationLabel(relation.relation));
      }
    }
    return {
      id: record.id,
      kind,
      subtype: subtypeForRecord(record),
      subjectPath: subjectPathForRecord(record, knowledgeSubjectIndex),
      title: record.title,
      description: record.description,
      href: hrefForPublicRecord(record),
      domains,
      prominence: record.map?.prominence ?? 'normal',
      x: position.x,
      y: position.y,
      r: record.map?.prominence === 'landmark' ? 8 : 5.5,
    };
  });

  return {
    home: HOME,
    territories: TERRITORIES,
    subterritories: SUBTERRITORIES,
    artifacts,
    edges: [...edges.values()],
  };
}

export function domainLabel(domain: MapDomain): string {
  return (
    SUBTERRITORIES.find((item) => item.id === domain)?.label ??
    (domain === 'learning-education' ? 'Learning · Education' : 'Knowledge · Publishing')
  );
}

export function domainsForTerritory(territory: MapTerritoryId): MapDomain[] {
  if (territory === 'engineering') return SUBTERRITORIES.map((item) => item.id);
  return [territory === 'learning' ? 'learning-education' : 'knowledge-publishing'];
}

export function artifactBelongsToTerritory(
  artifact: Pick<SystemsMapArtifact, 'domains'>,
  territory: MapTerritoryId,
): boolean {
  return artifact.domains.some((domain) => topTerritoryForDomain(domain) === territory);
}
