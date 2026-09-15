// Раскладка наклеек по листу A4 (см. SPEC.md §8.4). Всё в миллиметрах.
// Чтобы на лист влезло как можно больше, прямоугольные наклейки там, где остаётся место,
// кладутся повёрнутыми на 90° (120×45: 8 вместо 5).

import type { SizePreset } from '@/data/sizes';

export const A4 = { width: 210, height: 297 } as const;

export interface LayoutConfig {
  /** Поле листа со всех сторон, мм. */
  margin: number;
  /** Зазор между наклейками, мм. */
  gutter: number;
}

/** margin повторён в @page (styles/print.css): на печати поля листа задаёт страница. */
export const DEFAULT_LAYOUT: LayoutConfig = { margin: 9, gutter: 4 };

/** Сколько раз лист можно разрезать на полосы разной ориентации при переборе. */
const PACK_DEPTH = 2;

/** Ячейка наклейки на листе. */
export interface Slot {
  /** Левый верхний угол ячейки от края области печати (без поля листа), мм. */
  x: number;
  y: number;
  /** Наклейка повёрнута на 90°: ячейка size.height × size.width. */
  rotated: boolean;
}

export interface SheetLayout {
  perPage: number;
  margin: number;
  gutter: number;
  slots: Slot[];
  /** Сколько наклеек на листе повёрнуто. */
  rotatedCount: number;
}

interface Cell {
  w: number;
  h: number;
  rotated: boolean;
}

/** Сколько ячеек длиной cell влезает в отрезок len с зазорами gutter. */
function fit(len: number, cell: number, gutter: number): number {
  return len < cell ? 0 : Math.floor((len + gutter) / (cell + gutter));
}

/** Сетка одинаковых ячеек в прямоугольнике (x, y, w, h). */
function grid(x: number, y: number, w: number, h: number, cell: Cell, gutter: number): Slot[] {
  const cols = fit(w, cell.w, gutter);
  const rows = fit(h, cell.h, gutter);
  const slots: Slot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({
        x: x + c * (cell.w + gutter),
        y: y + r * (cell.h + gutter),
        rotated: cell.rotated,
      });
    }
  }
  return slots;
}

const rotatedCount = (slots: Slot[]) => slots.filter((s) => s.rotated).length;

/** Больше наклеек, а при равенстве — меньше повёрнутых. */
function better(a: Slot[], b: Slot[]): boolean {
  return a.length > b.length || (a.length === b.length && rotatedCount(a) < rotatedCount(b));
}

/** Лучшая раскладка прямоугольника (x, y, w, h): сетка одной ориентации или, пока
 *  позволяет depth, k колонок (рядов) одной ориентации плюс лучшая раскладка остатка. */
function pack(
  x: number,
  y: number,
  w: number,
  h: number,
  cells: Cell[],
  gutter: number,
  depth: number,
): Slot[] {
  let best: Slot[] = [];
  const consider = (slots: Slot[]) => {
    if (better(slots, best)) best = slots;
  };
  for (const cell of cells) consider(grid(x, y, w, h, cell, gutter));
  if (depth === 0) return best;

  for (const cell of cells) {
    for (let k = 1; k <= fit(w, cell.w, gutter); k++) {
      const used = k * (cell.w + gutter);
      consider([
        ...grid(x, y, used - gutter, h, cell, gutter),
        ...pack(x + used, y, w - used, h, cells, gutter, depth - 1),
      ]);
    }
    for (let k = 1; k <= fit(h, cell.h, gutter); k++) {
      const used = k * (cell.h + gutter);
      consider([
        ...grid(x, y, w, used - gutter, cell, gutter),
        ...pack(x, y + used, w, h - used, cells, gutter, depth - 1),
      ]);
    }
  }
  return best;
}

export function computeLayout(size: SizePreset, cfg: LayoutConfig = DEFAULT_LAYOUT): SheetLayout {
  const normal: Cell = { w: size.width, h: size.height, rotated: false };
  const turned: Cell = { w: size.height, h: size.width, rotated: true };
  // Обычная ориентация идёт первой: при равном числе наклеек поворот не нужен.
  const cells = size.width === size.height ? [normal] : [normal, turned];

  let slots = pack(
    0,
    0,
    A4.width - 2 * cfg.margin,
    A4.height - 2 * cfg.margin,
    cells,
    cfg.gutter,
    PACK_DEPTH,
  );
  // Наклейка больше листа — всё равно ставим одну.
  if (slots.length === 0) slots = [{ x: 0, y: 0, rotated: false }];

  return {
    perPage: slots.length,
    margin: cfg.margin,
    gutter: cfg.gutter,
    slots,
    rotatedCount: rotatedCount(slots),
  };
}

export function pageCount(totalLabels: number, layout: SheetLayout): number {
  if (layout.perPage <= 0) return 0;
  return Math.ceil(totalLabels / layout.perPage);
}

/** Разбивает плоский список наклеек на страницы по perPage. */
export function paginate<T>(items: T[], perPage: number): T[][] {
  if (perPage <= 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages;
}
