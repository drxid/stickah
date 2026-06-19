<script setup lang="ts">
import { computed } from 'vue'
import FlavorChip from '@/features/search/FlavorChip.vue'
import { useCatalogStore } from '@/stores/catalog'
import { useSelectionStore } from '@/stores/selection'

const catalog = useCatalogStore()
const selection = useSelectionStore()

const rows = computed(() =>
  selection.items
    .map((i) => ({ display: catalog.display(i.flavorId), copies: i.copies }))
    .filter((r): r is { display: NonNullable<ReturnType<typeof catalog.display>>; copies: number } =>
      Boolean(r.display),
    ),
)
</script>

<template>
  <aside class="tray">
    <header class="tray__head">
      <h2 class="tray__title">Набор</h2>
      <button
        v-if="selection.count"
        class="tray__clear"
        @click="selection.clear()"
      >
        очистить
      </button>
    </header>

    <p class="tray__count mono">
      {{ selection.count }} вкус(ов) · {{ selection.totalLabels }} наклеек
    </p>

    <div v-if="rows.length" class="tray__list">
      <FlavorChip
        v-for="row in rows"
        :key="row.display.id"
        :flavor="row.display"
        mode="selected"
        :copies="row.copies"
        @remove="selection.remove($event)"
        @set-copies="(id, n) => selection.setCopies(id, n)"
      />
    </div>

    <div v-else class="tray__empty">
      <span class="tray__empty-emoji" aria-hidden="true">🫙</span>
      <p>Набор пуст. Найди вкус слева и нажми «+», чтобы добавить его на лист.</p>
    </div>
  </aside>
</template>

<style scoped>
.tray {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--ink-soft);
  border: 1px solid var(--ink-line);
  border-radius: var(--r-lg);
  padding: 18px;
}
.tray__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.tray__title {
  font-size: 22px;
}
.tray__clear {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.tray__clear:hover {
  color: var(--text);
}
.tray__count {
  color: var(--text-faint);
  margin: 6px 0 14px;
}
.tray__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}
.tray__empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  color: var(--text-muted);
  padding: 24px 10px;
}
.tray__empty-emoji {
  font-size: 40px;
}
</style>
