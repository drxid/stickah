// Проверка уже собранного public/data/catalog.json.
// Запуск: npm run catalog:validate

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { validateCatalog } from './validate'
import type { Catalog } from '../src/types/catalog'

const here = dirname(fileURLToPath(import.meta.url))
const file = join(here, '..', 'public', 'data', 'catalog.json')

const catalog = JSON.parse(await readFile(file, 'utf8')) as Catalog
const errors = validateCatalog(catalog)

if (errors.length) {
  console.error(`[validate] ошибок: ${errors.length}`)
  errors.forEach((e) => console.error('  - ' + e))
  process.exit(1)
}

console.log(
  `[validate] OK · производителей ${catalog.manufacturers.length}, ` +
    `линеек ${catalog.lines.length}, вкусов ${catalog.flavors.length}`,
)
