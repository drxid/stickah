// Применяет ручные поправки (scripts/overrides.ts) к готовому catalog.json
// без повторного скачивания источника. Запуск: npm run catalog:overrides

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { applyOverrides } from './overrides';
import { validateCatalog } from './validate';
import type { Catalog } from '../src/types/catalog';

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'catalog.json');

async function main() {
  const source = JSON.parse(await readFile(file, 'utf8')) as Catalog;
  const { catalog, changed } = applyOverrides(source);

  const errors = validateCatalog(catalog);
  if (errors.length) {
    console.error('[catalog] ошибки валидации:');
    errors.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }

  await writeFile(file, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log(`[catalog] поправок применено: ${changed}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
