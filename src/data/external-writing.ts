export type ExternalWritingOverlay = {
  relatedRecords?: string[];
  featured?: boolean;
  hidden?: boolean;
  note?: string;
};

export const externalWritingConfig = {
  devto: {
    username: 'anandakevin',
    apiUrl: 'https://dev.to/api/articles',
  },
  medium: {
    feedUrl: 'https://medium.com/feed/@anandakevinsariputra',
  },
} as const;

export const mediumWritingCachePath = '.cache/medium-writing.json';

/** Portfolio context only. Provider metadata stays owned by each feed. */
export const externalWritingOverlay: Record<string, ExternalWritingOverlay> = {
  'medium:https://medium.com/p/2876df1cfdfa': {
    relatedRecords: ['work/infinid-platform-engineering'],
  },
};
