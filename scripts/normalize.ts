// Нормализация: RawTobacco[] -> Catalog (см. SPEC.md §6).
// Строит стабильные slug-id, дедуплицирует производителей/линейки,
// проставляет акценты. Чистая функция — легко тестировать.

import type { Catalog, Flavor, Line, Manufacturer } from '../src/types/catalog'
import type { RawTobacco } from './adapters/types'

const HOLO = ['#b8a6ff', '#9be8e0', '#ffc2e2', '#a9d5ff', '#ffe7a3']

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugify(input: string): string {
  const lower = input.trim().toLowerCase()
  let out = ''
  for (const ch of lower) {
    if (ch in TRANSLIT) out += TRANSLIT[ch]
    else if (/[a-z0-9]/.test(ch)) out += ch
    else out += '-'
  }
  return out.replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function pickAccent(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return HOLO[h % HOLO.length]
}

export function normalize(raw: RawTobacco[]): Catalog {
  const manufacturers = new Map<string, Manufacturer>()
  const lines = new Map<string, Line>()
  const flavors: Flavor[] = []
  const usedFlavorIds = new Set<string>()

  for (const r of raw) {
    const manufacturerId = slugify(r.manufacturer)
    if (!manufacturers.has(manufacturerId)) {
      manufacturers.set(manufacturerId, { id: manufacturerId, name: r.manufacturer.trim() })
    }

    const lineId = `${manufacturerId}--${slugify(r.line)}`
    if (!lines.has(lineId)) {
      lines.set(lineId, { id: lineId, manufacturerId, name: r.line.trim() })
    }

    const baseId = `${lineId}--${slugify(r.flavor)}`
    let flavorId = baseId
    let n = 2
    while (usedFlavorIds.has(flavorId)) flavorId = `${baseId}-${n++}`
    usedFlavorIds.add(flavorId)

    flavors.push({
      id: flavorId,
      manufacturerId,
      lineId,
      name: r.flavor.trim(),
      nameOriginal: r.nameOriginal,
      strength: r.strength,
      profile: r.profile,
      accent: r.accent ?? pickAccent(r.flavor),
    })
  }

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    manufacturers: [...manufacturers.values()],
    lines: [...lines.values()],
    flavors,
  }
}
