import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import test from 'node:test';

const script = resolve(new URL('./sync-portfolio-assets.mjs', import.meta.url).pathname);

test('production stages only media referenced by approved records', () => {
  const root = mkdtempSync(join(tmpdir(), 'portfolio-asset-gate-'));
  const source = join(root, 'source');
  const records = join(source, 'records/projects');
  const media = join(source, 'public/media/projects');
  mkdirSync(records, { recursive: true });
  mkdirSync(media, { recursive: true });
  writeFileSync(join(source, 'published.json'), '["projects/approved"]\n');
  for (const id of ['approved', 'private']) {
    writeFileSync(
      join(records, `${id}.md`),
      `---\nid: projects/${id}\nmedia:\n  - path: /media/projects/${id}.jpg\n---\n`,
    );
    writeFileSync(join(media, `${id}.jpg`), id);
  }
  try {
    const env = { ...process.env, PORTFOLIO_SOURCE_ROOT: source };
    const preview = spawnSync(process.execPath, [script, 'preview'], {
      cwd: root,
      env,
      encoding: 'utf8',
    });
    assert.equal(preview.status, 0, preview.stderr);
    assert.equal(readFileSync(join(root, 'public/media/projects/private.jpg'), 'utf8'), 'private');

    const production = spawnSync(process.execPath, [script, 'production'], {
      cwd: root,
      env,
      encoding: 'utf8',
    });
    assert.equal(production.status, 0, production.stderr);
    assert.equal(
      readFileSync(join(root, 'public/media/projects/approved.jpg'), 'utf8'),
      'approved',
    );
    assert.equal(existsSync(join(root, 'public/media/projects/private.jpg')), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
