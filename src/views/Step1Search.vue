<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import FlavorChip from '@/features/search/FlavorChip.vue'
import SelectionTray from '@/features/selection/SelectionTray.vue'
import { useCatalogStore } from '@/stores/catalog'
import { useSelectionStore } from '@/stores/selection'

const router = useRouter()
const catalog = useCatalogStore()
const selection = useSelectionStore()

const query = ref('')

const results = computed(() => (catalog.loaded ? catalog.search(query.value) : []))
const shown = computed(() => results.value.slice(0, 60))
</script>

<template>
  <section class="step step1">
    <div class="step1__search">
      <div class="searchbar">
        <span class="searchbar__icon" aria-hidden="true">⌕</span>
        <input
          v-model="query"
          type="search"
          class="searchbar__input"
          placeholder="Найди вкус — например, «двойное яблоко» или «mint»"
          aria-label="Поиск вкуса"
        />
      </div>

      <p v-if="catalog.error" class="state state--error">{{ catalog.error }}</p>
      <p v-else-if="!catalog.loaded" class="state">Загружаю каталог…</p>
      <p v-else-if="!results.length" class="state">
        Ничего не нашлось по «{{ query }}». Попробуй другое написание.
      </p>

      <div v-else class="results">
        <FlavorChip
          v-for="f in shown"
          :key="f.id"
          :flavor="f"
          mode="result"
          :added="selection.has(f.id)"
          @add="selection.add($event)"
        />
        <p v-if="results.length > shown.length" class="results__more mono">
          …ещё {{ results.length - shown.length }}. Уточни запрос.
        </p>
      </div>
    </div>

    <SelectionTray class="step1__tray" />

    <footer class="step__footer no-print">
      <span class="step__hint">Шаг 1 из 3 · набери вкусы</span>
      <button
        class="btn btn--primary"
        :disabled="selection.count === 0"
        @click="router.push('/template')"
      >
        Далее →
      </button>
    </footer>
  </section>
</template>

<style scoped>
.step1 {
  display: grid;
  grid-template-columns: 1fr 380px;
  grid-template-rows: 1fr auto;
  gap: var(--gap);
  min-height: 0;
}
.step1__search {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 14px;
}
.step1__tray {
  grid-column: 2;
  grid-row: 1;
}
.step__footer {
  grid-column: 1 / -1;
}

.searchbar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--ink-soft);
  border: 1px solid var(--ink-line);
  border-radius: var(--r-pill);
  padding: 4px 18px;
}
.searchbar:focus-within {
  border-color: var(--butter);
}
.searchbar__icon {
  font-size: 20px;
  color: var(--text-muted);
}
.searchbar__input {
  flex: 1;
  background: none;
  border: none;
  color: var(--text);
  font-size: 16px;
  padding: 14px 0;
}
.searchbar__input:focus {
  outline: none;
}
.searchbar__input::placeholder {
  color: var(--text-faint);
}

.results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}
.results__more {
  color: var(--text-faint);
  text-align: center;
  padding: 8px;
}
.state {
  color: var(--text-muted);
  padding: 24px 6px;
}
.state--error {
  color: #ff9b9b;
}

.step__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
}
.step__hint {
  color: var(--text-faint);
  font-size: 13px;
}

@media (max-width: 860px) {
  .step1 {
    grid-template-columns: 1fr;
  }
  .step1__tray {
    grid-row: auto;
  }
}
</style>
