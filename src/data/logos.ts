// SVG-логотипы производителей из tobacco_logos/ (белые — под тёмный фон).
// Файл сопоставляется с производителем по имени без учёта регистра, пробелов и знаков:
// «Blackburn.svg» → Black Burn, «Сарма.svg» → Сарма, «Dogma.svg» → id dogma.
// Чтобы добавить логотип, достаточно положить файл в папку. Нет файла — бренд пишется текстом.

export interface BrandLogo {
  /** data:-URI — логотип виден сразу, без догрузки перед печатью. */
  src: string
  /** Ширина / высота из viewBox. */
  aspect: number
}

const files = import.meta.glob<string>('/tobacco_logos/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const compact = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')

function aspectOf(svg: string): number {
  const box = svg.match(/viewBox="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number)
  const w = box?.[2] ?? Number(svg.match(/\bwidth="([\d.]+)/)?.[1])
  const h = box?.[3] ?? Number(svg.match(/\bheight="([\d.]+)/)?.[1])
  return w > 0 && h > 0 ? w / h : 1
}

const logos = new Map<string, BrandLogo>()
for (const [path, svg] of Object.entries(files)) {
  const name = path.slice(path.lastIndexOf('/') + 1).replace(/\.svg$/i, '')
  logos.set(compact(name), {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    aspect: aspectOf(svg),
  })
}

export function findLogo(manufacturerId: string, manufacturerName: string): BrandLogo | undefined {
  return logos.get(compact(manufacturerId)) ?? logos.get(compact(manufacturerName))
}
