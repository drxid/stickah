// Ручные поправки данных источника: названия линеек, недостающие вкусы, теги, крепость.
// Применяются после нормализации (catalog:build) и к готовому catalog.json
// без повторного скачивания (catalog:overrides). Повторный запуск ничего не дублирует.

import type { Catalog, Flavor } from '../src/types/catalog'
import { slugify } from './normalize'

/** Вкусы, которых нет в источнике. Если вкус с таким именем в линейке уже есть,
 *  у него дополняются только пустые поля — данные источника важнее. */
const EXTRA_FLAVORS: Omit<Flavor, 'id'>[] = [
  // На htreviews нет; линейка Noir — основная у Tangiers.
  {
    manufacturerId: 'tangiers',
    lineId: 'tangiers--tangiers-noir',
    name: 'Sage Mint',
    nameOriginal: 'Шалфей и мята',
    strength: 7, // как у Cilantro Pineapple
    profile: ['Шалфей', 'Мята'],
    accent: '#01784c',
  },
]

interface TagOverride {
  flavorId: string
  tag: string
  /** Вставить после этого тега; без него — в конец. */
  after?: string
}

const TAG_OVERRIDES: TagOverride[] = [
  { flavorId: 'tangiers--tangiers-noir--cilantro-pineapple', tag: 'Кинза', after: 'Ананас' },
  { flavorId: 'black-burn--osnovnaya--cream-corn', tag: 'Сливочный' },
  { flavorId: 'huligan--krepkaya--hard-vampire', tag: 'Кисель' },
  { flavorId: 'huligan--standartnaya--vampire', tag: 'Кисель' },
]

/** Полная замена тегов, когда в источнике они неверные. Применяется до TAG_OVERRIDES. */
const PROFILE_OVERRIDES: { flavorId: string; profile: string[] }[] = [
  // На htreviews у Wintergreen только «Ягоды»; на деле — рутбир с мятой.
  { flavorId: 'tangiers--tangiers-noir--wintergreen', profile: ['Рутбир', 'Мята'] },
]

interface NamePrefixOverride {
  manufacturerId: string
  /** Названия линеек (после переименования), без учёта регистра. */
  lines: string[]
  /** Слово, которое убрать из начала названия вкуса (без учёта регистра). Id вкусов не меняются. */
  prefix: string
}

const NAME_PREFIX_OVERRIDES: NamePrefixOverride[] = [
  // Хулиган «Крепкая»: «Hard Dino» → «Dino» — линейка и так подписана на наклейке.
  { manufacturerId: 'huligan', lines: ['Крепкая'], prefix: 'Hard' },
]

interface StrengthOverride {
  manufacturerId: string
  /** Названия линеек (после переименования), к которым применяется поправка, без учёта регистра.
   *  Без поля — все линейки бренда. */
  lines?: string[]
  /** Крепость по шкале каталога: 2 — лёгкая, 5 — средняя, 7 — выше средней, 9 — крепкая. */
  strength: number
  /** Нижняя граница: крепость ниже или пустая поднимается до strength, более высокая остаётся. */
  atLeast?: boolean
}

const STRENGTH_OVERRIDES: StrengthOverride[] = [
  // Сарма — лёгкий табак; на htreviews у классики «средняя» или пусто.
  // Классика — «лёгкая-средняя» (1.5 точки на наклейке), Лёгкая 360 — «лёгкая».
  // «Крепкая Сарма 360» оставляем как в источнике.
  { manufacturerId: 'sarma', lines: ['Классическая'], strength: 3 },
  { manufacturerId: 'sarma', lines: ['Легкая Сарма 360'], strength: 2 },
  // Хулиган «Крепкая» — на деле «лёгкая-средняя» (1.5 точки), а не «средняя».
  { manufacturerId: 'huligan', lines: ['Крепкая'], strength: 3 },
  // DARKSIDE Xperience — «ниже средней» (1.5 точки).
  { manufacturerId: 'darkside', lines: ['Xperience'], strength: 3 },
  // Tangiers Noir — «выше средней» (2.5 точки) для всей линейки.
  { manufacturerId: 'tangiers', lines: ['Noir'], strength: 7 },
  // Trofimoff’s Burley — «выше средней» (2.5 точки) для всей линейки.
  { manufacturerId: 'trofimoff-s', lines: ['Burley'], strength: 7 },
  // MUSTHAVE — не ниже «средней» (2 точки) для всех вкусов; у половины крепость в источнике пустая.
  { manufacturerId: 'musthave', strength: 5, atLeast: true },
]

/** Поля в порядке normalize(), чтобы catalog.json не перетасовывался. */
function ordered(f: Flavor): Flavor {
  const { id, manufacturerId, lineId, name, nameOriginal, strength, profile, accent } = f
  return { id, manufacturerId, lineId, name, nameOriginal, strength, profile, accent }
}

export function applyOverrides(catalog: Catalog): { catalog: Catalog; changed: number } {
  let changed = 0

  // Бренд в начале названия линейки — повтор: бренд и так стоит на наклейке логотипом
  // или текстом («Tangiers Noir» → «Noir», «Duft Solo» → «Solo»). У коллабораций
  // убираем и «x»: «Tangiers x Alkonost» → «Alkonost». Id линеек не меняются.
  const brandName = new Map(catalog.manufacturers.map((m) => [m.id, m.name.trim().toLowerCase()]))
  const lines = catalog.lines.map((l) => {
    const brand = brandName.get(l.manufacturerId)
    let name = l.name.trim()
    if (brand && name.toLowerCase().startsWith(`${brand} `)) name = name.slice(brand.length).trim()
    if (/^[xх] /i.test(name)) name = name.slice(2).trim()
    if (!name || name === l.name) return l
    changed++
    return { ...l, name }
  })

  const flavors = [...catalog.flavors]

  for (const extra of EXTRA_FLAVORS) {
    const name = extra.name.trim().toLowerCase()
    const i = flavors.findIndex((f) => f.lineId === extra.lineId && f.name.trim().toLowerCase() === name)
    if (i >= 0) {
      const f = flavors[i]
      const missing = (Object.keys(extra) as (keyof typeof extra)[]).filter((k) => f[k] === undefined)
      if (!missing.length) continue
      flavors[i] = ordered({ ...f, ...Object.fromEntries(missing.map((k) => [k, extra[k]])) })
      changed++
      continue
    }
    // Новый вкус встаёт после последнего вкуса своей линейки.
    const last = flavors.findLastIndex((f) => f.lineId === extra.lineId)
    flavors.splice(
      last >= 0 ? last + 1 : flavors.length,
      0,
      ordered({ id: `${extra.lineId}--${slugify(extra.name)}`, ...extra }),
    )
    changed++
  }

  for (const p of PROFILE_OVERRIDES) {
    const i = flavors.findIndex((f) => f.id === p.flavorId)
    if (i < 0 || flavors[i].profile?.join('\n') === p.profile.join('\n')) continue
    flavors[i] = ordered({ ...flavors[i], profile: [...p.profile] })
    changed++
  }

  for (const t of TAG_OVERRIDES) {
    const i = flavors.findIndex((f) => f.id === t.flavorId)
    if (i < 0 || flavors[i].profile?.includes(t.tag)) continue
    const profile = [...(flavors[i].profile ?? [])]
    const at = t.after ? profile.indexOf(t.after) + 1 : 0
    profile.splice(at > 0 ? at : profile.length, 0, t.tag)
    flavors[i] = ordered({ ...flavors[i], profile })
    changed++
  }

  const lineName = new Map(lines.map((l) => [l.id, l.name.trim().toLowerCase()]))

  for (let i = 0; i < flavors.length; i++) {
    const f = flavors[i]
    const line = lineName.get(f.lineId)
    const rule = NAME_PREFIX_OVERRIDES.find(
      (r) => r.manufacturerId === f.manufacturerId && r.lines.some((n) => n.toLowerCase() === line),
    )
    const prefix = rule ? `${rule.prefix.toLowerCase()} ` : ''
    if (!prefix || !f.name.toLowerCase().startsWith(prefix)) continue
    const name = f.name.slice(prefix.length).trim()
    if (!name) continue
    flavors[i] = ordered({ ...f, name })
    changed++
  }

  for (let i = 0; i < flavors.length; i++) {
    const f = flavors[i]
    const line = lineName.get(f.lineId)
    const rule = STRENGTH_OVERRIDES.find(
      (r) =>
        r.manufacturerId === f.manufacturerId &&
        (!r.lines || r.lines.some((n) => n.toLowerCase() === line)),
    )
    if (!rule) continue
    const strength = rule.atLeast ? Math.max(f.strength ?? 0, rule.strength) : rule.strength
    if (f.strength === strength) continue
    flavors[i] = ordered({ ...f, strength })
    changed++
  }

  return { catalog: { ...catalog, lines, flavors }, changed }
}
