// Оффлайн-сборка каталога: адаптер -> нормализация -> валидация -> public/data/catalog.json
// Запуск: npm run catalog:build [adapterId]

import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { sampleAdapter } from './adapters/sample'
import { normalize } from './normalize'
import { validateCatalog } from './validate'
import type { SourceAdapter } from './adapters/types'

const here = dirname(fileURLToPath(import.meta.url))

// Реестр адаптеров. Новый источник = новая запись здесь.
const adapters: Record<string, SourceAdapter> = {
  sample: sampleAdapter,
}

async function main() {
  const key = process.argv[2] ?? 'sample'
  const adapter = adapters[key]
  if (!adapter) {
    console.error(`Неизвестный адаптер: "${key}". Доступные: ${Object.keys(adapters).join(', ')}`)
    process.exit(1)
  }

  console.log(`[catalog] источник: ${adapter.id}`)
  const raw = await adapter.fetchAll()
  console.log(`[catalog] сырых записей: ${raw.length}`)

  const catalog = normalize(raw)
  const errors = validateCatalog(catalog)
  if (errors.length) {
    console.error('[catalog] ошибки валидации:')
    errors.forEach((e) => console.error('  - ' + e))
    process.exit(1)
  }

  const out = join(here, '..', 'public', 'data', 'catalog.json')
  await writeFile(out, JSON.stringify(catalog, null, 2) + '\n', 'utf8')

  console.log(`[catalog] записано: ${out}`)
  console.log(
    `[catalog] производителей: ${catalog.manufacturers.length}, ` +
      `линеек: ${catalog.lines.length}, вкусов: ${catalog.flavors.length}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
