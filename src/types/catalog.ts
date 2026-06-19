// Нормализованная модель каталога (см. SPEC.md §6).
// Парсер из scripts/ приводит любой источник к этой схеме.

export interface Manufacturer {
  id: string
  name: string
  country?: string
}

export interface Line {
  id: string
  manufacturerId: string
  name: string
}

/** Вкус — то, что пользователь реально набирает в корзину. */
export interface Flavor {
  id: string
  manufacturerId: string
  lineId: string
  name: string
  /** Оригинальное написание для поиска (латиница/кириллица). */
  nameOriginal?: string
  /** Крепость, если есть в источнике. */
  strength?: number
  /** Теги профиля: ["цитрус", "холодок"]. */
  profile?: string[]
  /** Hex-акцент вкуса для наклейки. */
  accent?: string
}

export interface Catalog {
  schemaVersion: number
  generatedAt: string
  manufacturers: Manufacturer[]
  lines: Line[]
  flavors: Flavor[]
}

/** Вкус с уже подставленными именами производителя и линейки. */
export interface FlavorDisplay extends Flavor {
  manufacturerName: string
  lineName: string
}
