// Точечно добавляет бренд или отдельные его вкусы с htreviews в готовый catalog.json,
// не трогая остальные бренды. Добавляется только недостающее, затем — ручные поправки.
// Запуск: npm run catalog:add-brand <бренд> [вкус…]
//   бренд — slug из адреса htreviews.org/tobaccos/<бренд>;
//   вкус  — slug из адреса …/<бренд>/<линейка>/<вкус> или название вкуса. Без вкусов — весь бренд.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fetchBrandBySlug } from './adapters/htreviews';
import { normalize } from './normalize';
import { applyOverrides } from './overrides';
import { validateCatalog } from './validate';
import type { Catalog, Flavor } from '../src/types/catalog';

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'catalog.json');

/** Элементы, которых ещё нет в списке (по id). */
function missingFrom<T extends { id: string }>(list: T[]) {
  const ids = new Set(list.map((x) => x.id));
  return (x: T) => !ids.has(x.id);
}

/** Вкус по slug из адреса сайта (он же хвост id) или по названию. */
function matches(f: Flavor, query: string): boolean {
  const q = query.trim().toLowerCase();
  return f.id.endsWith(`--${q}`) || f.name.trim().toLowerCase() === q;
}

async function main() {
  const [slug, ...only] = process.argv.slice(2);
  if (!slug) {
    console.error('Укажи slug бренда: npm run catalog:add-brand baza [вкус…]');
    process.exit(1);
  }

  // Та же нормализация, что у полной сборки, — id и акценты совпадут с будущей пересборкой.
  const brand = normalize(await fetchBrandBySlug(slug));
  const notFound = only.filter((q) => !brand.flavors.some((f) => matches(f, q)));
  if (notFound.length) {
    console.error(`[catalog] на htreviews нет вкусов: ${notFound.join(', ')}`);
    process.exit(1);
  }
  const picked = only.length
    ? brand.flavors.filter((f) => only.some((q) => matches(f, q)))
    : brand.flavors;
  const pickedLines = new Set(picked.map((f) => f.lineId));

  const current = JSON.parse(await readFile(file, 'utf8')) as Catalog;
  const newLines = brand.lines
    .filter((l) => pickedLines.has(l.id))
    .filter(missingFrom(current.lines));
  const newFlavors = picked.filter(missingFrom(current.flavors));

  // Новый вкус встаёт после последнего вкуса своей линейки, вкусы новой линейки — в конец.
  const flavors = [...current.flavors];
  for (const f of newFlavors) {
    const last = flavors.findLastIndex((x) => x.lineId === f.lineId);
    flavors.splice(last >= 0 ? last + 1 : flavors.length, 0, f);
  }

  const merged: Catalog = {
    ...current,
    manufacturers: [
      ...current.manufacturers,
      ...brand.manufacturers.filter(missingFrom(current.manufacturers)),
    ],
    lines: [...current.lines, ...newLines],
    flavors,
  };
  const { catalog } = applyOverrides(merged);

  const errors = validateCatalog(catalog);
  if (errors.length) {
    console.error('[catalog] ошибки валидации:');
    errors.forEach((e) => console.error('  - ' + e));
    process.exit(1);
  }

  await writeFile(file, JSON.stringify(catalog, null, 2) + '\n', 'utf8');
  console.log(
    `[catalog] ${brand.manufacturers.map((m) => m.name).join(', ')}: ` +
      `+${newLines.length} линеек, +${newFlavors.length} вкусов (из ${picked.length})`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
