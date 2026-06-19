// Раскладка наклеек по листу A4 (см. SPEC.md §8.4). Всё в миллиметрах.

import type { SizePreset } from '@/data/sizes'

export const A4 = { width: 210, height: 297 } as const

export interface LayoutConfig {
  /** Поле листа со всех сторон, мм. */
  margin: number
  /** Зазор между наклейками, мм. */
  gutter: number
}

export const DEFAULT_LAYOUT: LayoutConfig = { margin: 9, gutter: 4 }

export interface SheetLayout {
  cols: number
  rows: number
  perPage: number
  margin: number
  gutter: number
  /** Ширина ячейки сетки (для круга = диаметр), мм. */
  cellW: number
  cellH: number
}

export function computeLayout(size: SizePreset, cfg: LayoutConfig = DEFAULT_LAYOUT): SheetLayout {
  const usableW = A4.width - 2 * cfg.margin
  const usableH = A4.height - 2 * cfg.margin

  const cols = Math.max(1, Math.floor((usableW + cfg.gutter) / (size.width + cfg.gutter)))
  const rows = Math.max(1, Math.floor((usableH + cfg.gutter) / (size.height + cfg.gutter)))

  return {
    cols,
    rows,
    perPage: cols * rows,
    margin: cfg.margin,
    gutter: cfg.gutter,
    cellW: size.width,
    cellH: size.height,
  }
}

export function pageCount(totalLabels: number, layout: SheetLayout): number {
  if (layout.perPage <= 0) return 0
  return Math.ceil(totalLabels / layout.perPage)
}

/** Разбивает плоский список наклеек на страницы по perPage. */
export function paginate<T>(items: T[], perPage: number): T[][] {
  if (perPage <= 0) return [items]
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage))
  }
  return pages
}
