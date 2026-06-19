// Проверка целостности каталога: форма, уникальность id, ссылки.

import type { Catalog } from '../src/types/catalog'

export function validateCatalog(c: Catalog): string[] {
  const errors: string[] = []

  if (typeof c.schemaVersion !== 'number') errors.push('schemaVersion должен быть числом')
  if (!Array.isArray(c.manufacturers) || !Array.isArray(c.lines) || !Array.isArray(c.flavors)) {
    errors.push('manufacturers / lines / flavors должны быть массивами')
    return errors
  }

  const dupe = (ids: string[], label: string) => {
    const seen = new Set<string>()
    for (const id of ids) {
      if (seen.has(id)) errors.push(`дубликат id (${label}): ${id}`)
      seen.add(id)
    }
  }
  dupe(c.manufacturers.map((m) => m.id), 'производитель')
  dupe(c.lines.map((l) => l.id), 'линейка')
  dupe(c.flavors.map((f) => f.id), 'вкус')

  const mIds = new Set(c.manufacturers.map((m) => m.id))
  const lIds = new Set(c.lines.map((l) => l.id))

  for (const l of c.lines) {
    if (!mIds.has(l.manufacturerId)) errors.push(`линейка ${l.id}: неизвестный производитель ${l.manufacturerId}`)
  }
  for (const f of c.flavors) {
    if (!f.name?.trim()) errors.push(`вкус ${f.id}: пустое имя`)
    if (!mIds.has(f.manufacturerId)) errors.push(`вкус ${f.id}: неизвестный производитель ${f.manufacturerId}`)
    if (!lIds.has(f.lineId)) errors.push(`вкус ${f.id}: неизвестная линейка ${f.lineId}`)
  }

  return errors
}
