export type FixtureArchColumn = {
  title: string;
  body: string;
  boxes?: string[];
};

export type FixtureArch = {
  archTitle: string;
  sketchNote: string;
  columns: FixtureArchColumn[];
  stack: string[];
};

export const fixtureArchByWritingId: Record<string, FixtureArch> = {
  'writing/fixture-system-model': {
    archTitle: 'Fixture architecture stage (not production evidence)',
    sketchNote: 'labeled fixture — no real system topology',
    columns: [
      {
        title: 'Context',
        body: 'Fixture column for layout parity only.',
        boxes: ['input A', 'input B'],
      },
      {
        title: 'Decision surface',
        body: 'Shows how constraints meet a single decision point.',
        boxes: ['rule eval', 'trace hook'],
      },
      {
        title: 'Outcome',
        body: 'Repeatable knowledge without asserting a real deployment.',
        boxes: ['contract', 'tests'],
      },
    ],
    stack: ['fixture', 'layout-only', 'no-claims'],
  },
  'writing/fixture-safe-change': {
    archTitle: 'Fixture architecture stage (second item)',
    sketchNote: 'second tab · same fixture rules',
    columns: [
      {
        title: 'Trigger',
        body: 'Represents an operational change request.',
        boxes: ['change ticket'],
      },
      {
        title: 'Guardrails',
        body: 'Automation and boundaries before promotion.',
        boxes: ['CI gate', 'env matrix'],
      },
      {
        title: 'Reuse',
        body: 'What the next team should not rediscover.',
        boxes: ['runbook', 'template'],
      },
    ],
    stack: ['fixture', 'parity', 'typed-contract'],
  },
};

export const defaultProductionArch: FixtureArch = {
  archTitle: 'Architecture summary',
  sketchNote: 'from the case study when sections exist',
  columns: [
    { title: 'Context', body: 'Open the full case study for environment and constraint detail.' },
    { title: 'Decisions', body: 'Trade-offs and system shape live in the reviewed narrative.' },
    { title: 'Retrospective', body: 'What changed, what was learned, and what became reusable.' },
  ],
  stack: ['case-study'],
};
