import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('src/content/generated');
const marker = resolve(root, '.public-content-marker');
if (!existsSync(marker)) throw new Error('Generated-content marker is missing.');

const forbidden = [/source_notes\s*:/i, /last_verified\s*:/i, /\/Users\//, /\[\[[^\]]+\]\]/, /99-Private/i];
const files = [];
const visit = (directory) => readdirSync(directory).forEach((name) => {
  const path = resolve(directory, name);
  if (statSync(path).isDirectory()) visit(path);
  else files.push(path);
});
visit(root);

for (const path of files.filter((file) => /\.(md|json)$/i.test(file))) {
  const body = readFileSync(path, 'utf8');
  if (forbidden.some((pattern) => pattern.test(body))) throw new Error(`Private provenance found in ${path}`);
}

console.log(`Generated contract boundary check passed (${files.length} files).`);
