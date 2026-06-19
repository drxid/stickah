// Адаптер htreviews.org (см. SPEC.md §6).
// Бренды: GET /getData?...&action=brands (JSON, постранично по 20).
// Вкусы:  POST /postData {action:"objectByBrand", data:{id, limit, offset, sort}} (JSON).
// Линейки выводятся из полей line/line_slug самих вкусов. Браузер не нужен — чистый fetch.

import type { RawTobacco, SourceAdapter } from './types'

const BASE = 'https://htreviews.org'
const HEADERS: Record<string, string> = {
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
  accept: 'application/json',
}

// Сколько брендов брать из топа («Лучшие»). Можно переопределить: HT_BRANDS=80 npm run catalog:build htreviews
const TOP_BRANDS = Number(process.env.HT_BRANDS) || 58
const DELAY_MS = 250

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface BrandRow {
  id: string
  slug: string
  name: string
  country?: string
  tobaccos?: string
}

interface TagRow {
  name?: string
  bg0?: string
  group_color?: string
}

interface FlavorRow {
  slug: string
  name: string
  alt_name?: string | null
  line?: string | null
  line_slug?: string | null
  brand?: string
  strength?: string | null
  status?: string
  tags?: TagRow[]
}

// Текстовая категория крепости с сайта -> число 1..10 (приблизительно).
const STRENGTH: Record<string, number> = {
  'лёгкая': 2,
  'легкая': 2,
  'ниже средней': 3,
  'лёгкая-средняя': 3,
  'легкая-средняя': 3,
  'средняя': 5,
  'выше средней': 7,
  'средне-крепкая': 7,
  'крепкая': 9,
  'очень крепкая': 10,
}

async function fetchJson(url: string, init?: RequestInit, tries = 3): Promise<unknown> {
  let lastErr: unknown
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, init)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      lastErr = e
      if (i < tries) await sleep(600 * i)
    }
  }
  throw lastErr
}

async function getBrands(limit: number): Promise<BrandRow[]> {
  const out: BrandRow[] = []
  for (let o = 0; o < 1000; o += 20) {
    const url = `${BASE}/getData?r=position&s=rating&d=desc&o=${o}&action=brands`
    const arr = (await fetchJson(url, { headers: HEADERS })) as BrandRow[]
    if (!Array.isArray(arr) || arr.length === 0) break
    out.push(...arr)
    if (out.length >= limit) break
    await sleep(DELAY_MS)
  }
  return out.slice(0, limit)
}

async function getFlavors(brandId: string): Promise<FlavorRow[]> {
  const all: FlavorRow[] = []
  const PAGE = 1000
  for (let offset = 0; offset < 20000; offset += PAGE) {
    const body = JSON.stringify({
      action: 'objectByBrand',
      data: { id: String(brandId), limit: PAGE, offset, sort: { s: 'rating', d: 'desc' } },
    })
    const arr = (await fetchJson(`${BASE}/postData`, {
      method: 'POST',
      headers: { ...HEADERS, 'content-type': 'application/json', 'x-requested-with': 'XMLHttpRequest' },
      body,
    })) as FlavorRow[]
    if (!Array.isArray(arr) || arr.length === 0) break
    all.push(...arr)
    if (arr.length < PAGE) break
    await sleep(DELAY_MS)
  }
  return all
}

function mapStrength(s?: string | null): number | undefined {
  if (!s) return undefined
  return STRENGTH[s.trim().toLowerCase()]
}

export const htreviewsAdapter: SourceAdapter = {
  id: 'htreviews',
  async fetchAll(): Promise<RawTobacco[]> {
    const brands = await getBrands(TOP_BRANDS)
    console.log(`[htreviews] брендов в топе: ${brands.length}`)

    const out: RawTobacco[] = []
    let i = 0
    for (const b of brands) {
      i++
      let flavors: FlavorRow[] = []
      try {
        flavors = await getFlavors(b.id)
      } catch (e) {
        console.warn(`[htreviews]   ! ${b.name}: ${(e as Error).message} — пропускаю`)
        continue
      }

      for (const f of flavors) {
        const name = (f.name ?? '').trim()
        if (!name) continue
        const tags = (f.tags ?? []).map((t) => t.name?.trim()).filter((n): n is string => !!n)
        const alt = f.alt_name?.trim()
        out.push({
          manufacturer: b.name,
          line: (f.line && f.line.trim()) || 'Прочее',
          flavor: name,
          nameOriginal: alt && alt !== name ? alt : undefined,
          strength: mapStrength(f.strength),
          profile: tags.length ? [...new Set(tags)].slice(0, 3) : undefined,
          accent: f.tags?.[0]?.bg0,
        })
      }
      console.log(`[htreviews] ${i}/${brands.length} ${b.name}: ${flavors.length} вкусов`)
      await sleep(DELAY_MS)
    }

    return out
  },
}
