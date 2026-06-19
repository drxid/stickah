// Сырая запись из источника — минимум, который должен дать парсер.
// Реальный адаптер приводит данные источника к этому виду (см. SPEC.md §6).

export interface RawTobacco {
  manufacturer: string
  line: string
  flavor: string
  nameOriginal?: string
  strength?: number
  profile?: string[]
  /** Если источник даёт цвет — пробросим; иначе назначим из палитры. */
  accent?: string
}

export interface SourceAdapter {
  id: string
  fetchAll(): Promise<RawTobacco[]>
}
