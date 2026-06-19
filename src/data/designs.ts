// Реестр дизайн-вариантов наклейки (см. SPEC.md §8.2).
// Дизайн — это данные/стратегия: один вариант на всю генерацию.

export type DesignId = 'clean' | 'holo' | 'mono' | 'noir' | 'onyx'

export interface DesignVariant {
  id: DesignId
  label: string
  description: string
  /** Заметка про печать, показывается в UI выбора. */
  printNote?: string
}

export const DESIGNS: DesignVariant[] = [
  {
    id: 'clean',
    label: 'Clean',
    description: 'Светлый фон, крупное имя вкуса, тонкий акцентный кант. Максимальная читаемость.',
    printNote: 'Лучший выбор для любого принтера.',
  },
  {
    id: 'holo',
    label: 'Holo',
    description: 'Иридесцентное кольцо и глянцевый бейдж в стиле Stickah.',
    printNote: 'На бумаге градиент печатается без фольги — «красиво», но менее контрастно.',
  },
  {
    id: 'mono',
    label: 'Mono',
    description: 'Один цвет, контурный стиль. Экономит чернила.',
    printNote: 'Подходит для ч/б и бюджетной печати.',
  },
  {
    id: 'noir',
    label: 'Noir',
    description: 'Тёмный фон, элегантный serif, тонкое акцентное кольцо. Премиум-этикетка.',
    printNote: 'Тёмный фон расходует много чернил при печати.',
  },
  {
    id: 'onyx',
    label: 'Onyx',
    description: 'Тёмный фон, строгий гротеск, акцентная подпись капсом. Минимализм.',
    printNote: 'Тёмный фон расходует много чернил при печати.',
  },
]

export const DEFAULT_DESIGN_ID: DesignId = 'clean'

export function getDesign(id: DesignId): DesignVariant {
  return DESIGNS.find((d) => d.id === id) ?? DESIGNS[0]
}
