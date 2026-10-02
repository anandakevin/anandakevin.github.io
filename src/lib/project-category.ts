import type { ProjectCategory } from './public-contract';

export const PROJECT_CATEGORY_ORDER: ProjectCategory[] = [
  'backend',
  'platform-devops',
  'automation',
  'ml-research',
  'open-source',
  'applications',
  'publishing',
];

const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  backend: 'Backend',
  'platform-devops': 'Platform / DevOps',
  automation: 'Automation',
  'ml-research': 'ML / Research',
  'open-source': 'Open Source',
  applications: 'Applications',
  publishing: 'Publishing',
};

export function projectCategoryLabel(category: ProjectCategory): string {
  return PROJECT_CATEGORY_LABELS[category];
}
