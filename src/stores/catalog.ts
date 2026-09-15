import { defineStore } from 'pinia';
import MiniSearch from 'minisearch';
import { foldTerm, swapLayout } from '@/features/search/fold';
import type { Catalog, Flavor, FlavorDisplay, Line, Manufacturer } from '@/types/catalog';

// Индекс держим вне реактивного состояния — он тяжёлый, реактивность ему не нужна.
let index: MiniSearch<FlavorDisplay> | null = null;
let searchable: FlavorDisplay[] = [];
let byId = new Map<string, FlavorDisplay>();

function buildIndex(flavors: FlavorDisplay[]): MiniSearch<FlavorDisplay> {
  const ms = new MiniSearch<FlavorDisplay>({
    fields: ['name', 'nameOriginal', 'manufacturerName', 'lineName', 'profile'],
    extractField: (doc, field) => {
      const value = doc[field as keyof FlavorDisplay];
      return Array.isArray(value) ? value.join(' ') : value;
    },
    processTerm: foldTerm,
    searchOptions: {
      // name и nameOriginal равноценны: основное название в каталоге бывает и русским, и английским.
      boost: { name: 3, nameOriginal: 3, manufacturerName: 1.5, lineName: 1, profile: 0.5 },
      // Каждое слово запроса должно найтись в любом из полей: «musthave клубника» = бренд + вкус.
      combineWith: 'AND',
      // Ищем по мере набора, а опечатки прощаем только словам от 4 букв — короткие дают шум.
      prefix: true,
      fuzzy: (term) => term.length >= 4 && 0.2,
    },
  });
  ms.addAll(flavors);
  return ms;
}

interface CatalogState {
  schemaVersion: number;
  generatedAt: string;
  manufacturers: Manufacturer[];
  lines: Line[];
  flavors: Flavor[];
  loaded: boolean;
  loading: boolean;
  error: string;
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
      if (this.loaded || this.loading) return;
      this.loading = true;
      this.error = '';
      try {
        const url = `${import.meta.env.BASE_URL}data/catalog.json`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Catalog;

        this.schemaVersion = data.schemaVersion;
        this.generatedAt = data.generatedAt;
        this.manufacturers = data.manufacturers;
        this.lines = data.lines;
        this.flavors = data.flavors;

        searchable = data.flavors.map((f) => ({
          ...f,
          manufacturerName: this.manufacturerName(f.manufacturerId),
          lineName: this.lineName(f.lineId),
        }));
        byId = new Map(searchable.map((f) => [f.id, f]));
        index = buildIndex(searchable);

        this.loaded = true;
      } catch (e) {
        this.error = 'Не удалось загрузить каталог. Проверь соединение и обнови страницу.';
        console.error('[catalog] load failed:', e);
      } finally {
        this.loading = false;
      }
    },

    /** Поиск вкусов по названию, бренду, линейке и тегам. Пустой запрос возвращает весь каталог. */
    search(query: string): FlavorDisplay[] {
      const q = query.trim();
      if (!q) return searchable;
      if (!index) return [];
      let hits = index.search(q);
      // Ничего не нашлось — возможно, набрали не в той раскладке.
      if (!hits.length) hits = index.search(swapLayout(q));
      return hits.map((h) => byId.get(h.id)).filter((f): f is FlavorDisplay => !!f);
    },

    /** Вкус с подставленными именами производителя и линейки. */
    display(flavorId: string): FlavorDisplay | undefined {
      const f = this.flavors.find((x) => x.id === flavorId);
      if (!f) return undefined;
      return {
        ...f,
        manufacturerName: this.manufacturerName(f.manufacturerId),
        lineName: this.lineName(f.lineId),
      };
    },
  },
});
