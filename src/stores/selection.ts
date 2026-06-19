import { defineStore } from 'pinia'

export interface SelectionItem {
  flavorId: string
  /** Сколько копий этой наклейки печатать (одна на каждую банку). */
  copies: number
}

const STORAGE_KEY = 'stickah:selection'

function load(): SelectionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (i): i is SelectionItem =>
        typeof i?.flavorId === 'string' && typeof i?.copies === 'number',
    )
  } catch {
    return []
  }
}

export const useSelectionStore = defineStore('selection', {
  state: () => ({
    items: load() as SelectionItem[],
  }),

  getters: {
    /** Количество разных вкусов. */
    count: (state) => state.items.length,
    /** Всего наклеек с учётом копий. */
    totalLabels: (state) => state.items.reduce((sum, i) => sum + i.copies, 0),
    has: (state) => (flavorId: string) => state.items.some((i) => i.flavorId === flavorId),
    copiesOf: (state) => (flavorId: string) =>
      state.items.find((i) => i.flavorId === flavorId)?.copies ?? 0,
  },

  actions: {
    add(flavorId: string) {
      if (this.has(flavorId)) return
      this.items.push({ flavorId, copies: 1 })
      this.persist()
    },
    remove(flavorId: string) {
      this.items = this.items.filter((i) => i.flavorId !== flavorId)
      this.persist()
    },
    toggle(flavorId: string) {
      if (this.has(flavorId)) this.remove(flavorId)
      else this.add(flavorId)
    },
    setCopies(flavorId: string, copies: number) {
      const item = this.items.find((i) => i.flavorId === flavorId)
      if (!item) return
      item.copies = Math.max(1, Math.min(99, Math.round(copies)))
      this.persist()
    },
    clear() {
      this.items = []
      this.persist()
    },
    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
      } catch {
        /* localStorage недоступен — работаем в памяти */
      }
    },
  },
})
