// Пресеты размеров наклеек (см. SPEC.md §8.1).
// Размеры — это данные: добавить новый = добавить запись.

export type LabelShape = 'round' | 'rect'

export interface SizePreset {
  id: string
  label: string
  shape: LabelShape
  /** Ширина в мм. */
  width: number
  /** Высота в мм (для круга = диаметру). */
  height: number
  description: string
}

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'round-40', label: 'Круг 40 мм', shape: 'round', width: 40, height: 40, description: 'Крышка маленькой банки' },
  { id: 'round-50', label: 'Круг 50 мм', shape: 'round', width: 50, height: 50, description: 'Крышка средней банки' },
  { id: 'round-60', label: 'Круг 60 мм', shape: 'round', width: 60, height: 60, description: 'Крышка большой банки' },
  { id: 'rect-50x30', label: 'Прямоуг. 50×30 мм', shape: 'rect', width: 50, height: 30, description: 'Боковая наклейка' },
  { id: 'rect-70x40', label: 'Прямоуг. 70×40 мм', shape: 'rect', width: 70, height: 40, description: 'Боковая, длинные названия' },
]

export const DEFAULT_SIZE_ID = 'round-50'

export function getSize(id: string): SizePreset {
  return SIZE_PRESETS.find((s) => s.id === id) ?? SIZE_PRESETS[0]
}
