import { defineStore } from 'pinia'
import Fuse from 'fuse.js'
import type { Catalog, Flavor, FlavorDisplay, Line, Manufacturer } from '@/types/catalog'

// Fuse держим вне реактивного состояния — это тяжёлый индекс, реактивность ему не нужна.
let fuse: Fuse<FlavorDisplay> | null = null
let searchable: FlavorDisplay[] = []

interface CatalogState {
  schemaVersion: number
  generatedAt: string
  manufacturers: Manufacturer[]
  lines: Line[]
  flavors: Flavor[]
  loaded: boolean
  loading: boolean
  error: string
}

export const useCatalogStore = defineStore('catalog', {
  state: (): CatalogState => ({
    schemaVersion: 0,
    generatedAt: '',
    manufacturers: [],
    lines: [],
    flavors: [],
    loaded: false,
    loading: false,
    error: '',
  }),

  getters: {
    manufacturerName:
      (state) =>
      (id: string): string =>
        state.manufacturers.find((m) => m.id === id)?.name ?? '—',
    lineName:
      (state) =>
      (id: string): string =>
        state.lines.find((l) => l.id === id)?.name ?? '—',
  },

  actions: {
    async load() {
      if (this.loaded || this.loading) return
      this.loading = true
      this.error = ''
      try {
        const url = `${import.meta.env.BASE_URL}data/catalog.json`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as Catalog

        this.schemaVersion = data.schemaVersion
        this.generatedAt = data.generatedAt
        this.manufacturers = data.manufacturers
        this.lines = data.lines
        this.flavors = data.flavors

        searchable = data.flavors.map((f) => ({
          ...f,
          manufacturerName: this.manufacturerName(f.manufacturerId),
          lineName: this.lineName(f.lineId),
        }))
        fuse = new Fuse(searchable, {
          keys: [
            { name: 'name', weight: 3 },
            { name: 'nameOriginal', weight: 2 },
            { name: 'manufacturerName', weight: 1 },
            { name: 'lineName', weight: 1 },
            { name: 'profile', weight: 0.5 },
          ],
          threshold: 0.4,
          ignoreLocation: true,
          minMatchCharLength: 2,
        })

        this.loaded = true
      } catch (e) {
        this.error = 'Не удалось загрузить каталог. Проверь соединение и обнови страницу.'
        console.error('[catalog] load failed:', e)
      } finally {
        this.loading = false
      }
    },

    /** Поиск вкусов. Пустой запрос возвращает весь каталог. */
    search(query: string): FlavorDisplay[] {
      const q = query.trim()
      if (!q) return searchable
      if (!fuse) return []
      return fuse.search(q).map((r) => r.item)
    },

    /** Вкус с подставленными именами производителя и линейки. */
    display(flavorId: string): FlavorDisplay | undefined {
      const f = this.flavors.find((x) => x.id === flavorId)
      if (!f) return undefined
      return {
        ...f,
        manufacturerName: this.manufacturerName(f.manufacturerId),
        lineName: this.lineName(f.lineId),
      }
    },
  },
})
