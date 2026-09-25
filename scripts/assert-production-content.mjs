import { existsSync, readFileSync } from 'node:fs';

const manifest = new URL('../src/content/generated/v1/data/manifest.json', import.meta.url);
if (!existsSync(manifest)) {
  console.error('Production build blocked: no reviewed generated public-content manifest exists. Use npm run build:fixtures for foundation verification.');
  process.exit(1);
}

let contract;
try {
  contract = JSON.parse(readFileSync(manifest, 'utf8'));
} catch {
  console.error('Production build blocked: the generated public-content manifest is not valid JSON.');
  process.exit(1);
}

const hasProductionManifest = contract.contract_version === 1
  && contract.mode === 'production'
  && typeof contract.generated_at === 'string'
  && Array.isArray(contract.records)
  && Array.isArray(contract.throughlines);

if (!hasProductionManifest) {
  console.error('Production build blocked: the generated manifest does not satisfy public-content contract v1.');
  process.exit(1);
}
