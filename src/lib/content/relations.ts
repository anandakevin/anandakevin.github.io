import type { PublicContent } from '../public-contract';
import { hrefForPublicRecord } from './mappers';

export type ResolvedRelation = {
  relation: PublicContent['public_relations'][number]['relation'];
  targetId: string;
  record: PublicContent;
  href: string;
};

export function resolveRelations(
  record: PublicContent,
  byId: Map<string, PublicContent>,
): ResolvedRelation[] {
  const resolved: ResolvedRelation[] = [];
  const resolvedTargetIds = new Set<string>();
  const resolvedRecord = byId.get(record.id) ?? record;
  for (const link of resolvedRecord.public_relations) {
    const target = byId.get(link.target);
    if (!target) continue;
    if (resolvedTargetIds.has(target.id)) continue;
    resolvedTargetIds.add(target.id);
    resolved.push({
      relation: link.relation,
      targetId: link.target,
      record: target,
      href: hrefForPublicRecord(target),
    });
  }
  return resolved;
}

export function relationsOfKind(
  resolved: ResolvedRelation[],
  relation: ResolvedRelation['relation'],
): ResolvedRelation[] {
  return resolved.filter((item) => item.relation === relation);
}
