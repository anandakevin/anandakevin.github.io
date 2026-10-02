import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import test from 'node:test';

const checker = resolve(new URL('./check-public-content.mjs', import.meta.url).pathname);

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), 'portfolio-public-content-'));
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, path);
    mkdirSync(resolve(target, '..'), { recursive: true });
    writeFileSync(target, content);
  }
  return root;
}

function run(root) {
  return spawnSync(process.execPath, [checker], { cwd: root, encoding: 'utf8' });
}

test('accepts a minimal direct public record', () => {
  const root = fixture({
    'src/content/public/pages/home.md': `---
id: pages/home
slug: home
title: Home
---

Public copy.
`,
  });
  try {
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Public content check passed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects private boundary metadata in a public record', () => {
  const root = fixture({
    'src/content/public/pages/home.md': `---
id: pages/home
slug: home
title: Home
source_notes: private note
---
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Private or obsolete provenance/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a public media reference that does not exist', () => {
  const root = fixture({
    'src/content/public/contributions/example.md': `---
id: contributions/example
slug: example
title: Example
media:
  - path: /media/contributions/example/photo.webp
    kind: photo
    alt: Example photo
---
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Missing media/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects publication status outside portfolio-authored writing', () => {
  const root = fixture({
    'src/content/public/pages/home.md': `---
id: pages/home
slug: home
publication_status: ready
title: Home
---
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /only valid on writing records/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('accepts editorial writing without reference metadata', () => {
  const root = fixture({
    'src/content/public/writing/example.md': `---
id: writing/example
slug: /writing/example
title: Example
description: Example writing
content_kind: article
publication_status: ready
---

## Context

Public copy.
`,
  });
  try {
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('accepts a Knowledge domain and stable document route', () => {
  const root = fixture({
    'src/content/public/knowledge/domains/computing.md': `---
id: knowledge/domains/computing
slug: /knowledge/domain/computing
title: Computing
description: A fixture domain
content_kind: knowledge_domain
publication_status: draft
knowledge_kind: domain
knowledge_domain: computing
knowledge_area: []
knowledge_areas:
  - id: systems
    title: Systems
    description: Systems area
    children: []
---

Fixture domain.
`,
    'src/content/public/knowledge/system-boundaries.md': `---
id: knowledge/system-boundaries
slug: /knowledge/system-boundaries
title: System boundaries
description: A fixture page
content_kind: knowledge
publication_status: draft
knowledge_kind: concept
knowledge_domain: computing
knowledge_area:
  - systems
---

## Boundary

Fixture page.
`,
  });
  try {
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a Knowledge page outside the configured area hierarchy', () => {
  const root = fixture({
    'src/content/public/knowledge/domains/computing.md': `---
id: knowledge/domains/computing
slug: /knowledge/domain/computing
title: Computing
description: A fixture domain
content_kind: knowledge_domain
publication_status: draft
knowledge_kind: domain
knowledge_domain: computing
knowledge_area: []
knowledge_areas:
  - id: systems
    title: Systems
    description: Systems area
    children: []
---

Fixture domain.
`,
    'src/content/public/knowledge/system-boundaries.md': `---
id: knowledge/system-boundaries
slug: /knowledge/system-boundaries
title: System boundaries
description: A fixture page
content_kind: knowledge
publication_status: draft
knowledge_kind: concept
knowledge_domain: computing
knowledge_area:
  - missing-area
---

## Boundary

Fixture page.
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /missing area missing-area/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('accepts fixture-only Knowledge curation before publication', () => {
  const root = fixture({
    'src/content/public/pages/knowledge.md': `---
id: pages/knowledge
slug: /knowledge
title: Knowledge
description: Fixture Knowledge page
content_kind: page
fixture_only: true
curation:
  selected_knowledge:
    - knowledge/example
---

Fixture page.
`,
    'src/content/public/knowledge/domains/computing.md': `---
id: knowledge/domains/computing
slug: /knowledge/domain/computing
title: Computing
description: A fixture domain
content_kind: knowledge_domain
publication_status: draft
knowledge_kind: domain
knowledge_domain: computing
knowledge_area: []
knowledge_areas:
  - id: systems
    title: Systems
    description: Systems area
    children: []
---

Fixture domain.
`,
    'src/content/public/knowledge/example.md': `---
id: knowledge/example
slug: /knowledge/example
title: Example
description: A fixture page
content_kind: knowledge
publication_status: draft
knowledge_kind: concept
knowledge_domain: computing
knowledge_area:
  - systems
---

Fixture page.
`,
  });
  try {
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects incomplete reference writing metadata', () => {
  const root = fixture({
    'src/content/public/writing/example.md': `---
id: writing/example
slug: /writing/example
title: Example
description: Example writing
content_kind: note
writing_mode: reference
publication_status: ready
---

## Context

Public copy.
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /valid field_note_section/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects invalid field note sections', () => {
  const root = fixture({
    'src/content/public/writing/one.md': `---
id: writing/one
slug: /writing/one
title: One
description: One writing
content_kind: note
writing_mode: reference
field_note_section: engineering-systems
field_note_order: 10
last_verified: 2026-09-28
publication_status: ready
---

## Context

Public copy.
`,
    'src/content/public/writing/two.md': `---
id: writing/two
slug: /writing/two
title: Two
description: Two writing
content_kind: note
writing_mode: reference
field_note_section: invalid-section
field_note_order: 10
last_verified: 2026-09-28
publication_status: ready
---

## Context

Public copy.
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /valid field_note_section/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects duplicate field note ordering within a section', () => {
  const content = (id, title) => `---
id: writing/${id}
slug: /writing/${id}
title: ${title}
description: Example writing
content_kind: note
writing_mode: reference
field_note_section: engineering-systems
field_note_order: 10
last_verified: 2026-09-28
publication_status: ready
---

## Context

Public copy.
`;
  const root = fixture({
    'src/content/public/writing/one.md': content('one', 'One'),
    'src/content/public/writing/two.md': content('two', 'Two'),
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Duplicate field note order/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('requires authorship for manual LinkedIn records', () => {
  const root = fixture({
    'src/content/public/social/post.md': `---
id: social/post
title: Post
description: A post
content_kind: social_post
platform: linkedin
external_url: https://www.linkedin.com/posts/example
---
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /must declare authorship/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects an empty Markdown section', () => {
  const root = fixture({
    'src/content/public/pages/home.md': `---
id: pages/home
slug: /
title: Home
---

## Context

## Decision

The decision is documented.
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Empty Markdown section "Context"/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects a broken internal Markdown link', () => {
  const root = fixture({
    'src/content/public/pages/home.md': `---
id: pages/home
slug: /
title: Home
---

Read [the missing page](/missing-page).
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Broken internal link \/missing-page/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('accepts an external project with a featured destination', () => {
  const root = fixture({
    'src/content/public/projects/example.md': `---
id: projects/example
slug: /projects/example
title: Example project
description: A small project
content_kind: project
project_group: experiments-community
project_destination: external
public_links:
  - label: GitHub repository
    url: https://github.com/example/project
    kind: repository
    featured: true
---

Small project description.
`,
  });
  try {
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejects an external project without a featured destination', () => {
  const root = fixture({
    'src/content/public/projects/example.md': `---
id: projects/example
slug: /projects/example
title: Example project
description: A small project
content_kind: project
project_group: experiments-community
project_destination: external
public_links:
  - label: GitHub repository
    url: https://github.com/example/project
    kind: repository
    featured: false
---

Small project description.
`,
  });
  try {
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /External project needs a featured/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
