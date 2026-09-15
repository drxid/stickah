<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { Leaf, Sticker, Trash2 } from '@lucide/vue';
import FlavorChip from '@/features/search/FlavorChip.vue';
import { vScrollFade } from '@/directives/scrollFade';
import { useCatalogStore } from '@/stores/catalog';
import { useSelectionStore } from '@/stores/selection';
import { plural } from '@/utils/plural';

const catalog = useCatalogStore();
const selection = useSelectionStore();

const rows = computed(() =>
  selection.items
    .map((i) => ({ display: catalog.display(i.flavorId), copies: i.copies }))
    .filter(
      (r): r is { display: NonNullable<ReturnType<typeof catalog.display>>; copies: number } =>
        Boolean(r.display),
    ),
);

// Новые вкусы добавляются в конец набора — прокручиваем к ним, чтобы добавление было видно.
// Если список сейчас скрыт (на телефоне открыта вкладка «Поиск»), прокрутим, когда он появится.
const list = ref<HTMLElement | null>(null);
let scrollPending = false;

function scrollToEnd(): boolean {
  const el = list.value;
  if (!el || !el.clientHeight) return false;
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  return true;
}

watch(
  () => selection.count,
  async (count, prev) => {
    if (count <= prev) return;
    await nextTick();
    scrollPending = !scrollToEnd();
  },
);

watch(list, (el, _prev, onCleanup) => {
  if (!el) return;
  const ro = new ResizeObserver(() => {
    if (scrollPending) scrollPending = !scrollToEnd();
  });
  ro.observe(el);
  onCleanup(() => ro.disconnect());
});
</script>

<template>
  <aside class="tray">
    <header class="tray__head">
      <h2 class="tray__title">Набор</h2>
      <button v-if="selection.count" class="tray__clear" @click="selection.clear()">
        <Trash2 :size="14" aria-hidden="true" />
        очистить
      </button>
    </header>

    <p class="tray__count mono">
      <span class="tray__stat">
        <Leaf :size="14" aria-hidden="true" />
        {{ selection.count }} {{ plural(selection.count, ['вкус', 'вкуса', 'вкусов']) }}
      </span>
      <span class="tray__stat">
        <Sticker :size="14" aria-hidden="true" />
        {{ selection.totalLabels }}
        {{ plural(selection.totalLabels, ['наклейка', 'наклейки', 'наклеек']) }}
      </span>
    </p>

    <div v-if="rows.length" ref="list" v-scroll-fade class="tray__list">
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
      <Sticker class="tray__empty-icon" :size="44" :stroke-width="1.5" aria-hidden="true" />
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
  align-items: center;
  justify-content: space-between;
}
.tray__title {
  font-size: 22px;
}
.tray__clear {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 0;
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 13px;
}
.tray__clear:hover {
  color: var(--text);
}
.tray__count {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  color: var(--text-faint);
  margin: 6px 0 14px;
}
.tray__stat {
  display: inline-flex;
  align-items: center;
  gap: 5px;
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
.tray__empty-icon {
  color: var(--text-faint);
}

@media (max-width: 620px) {
  .tray {
    padding: 14px;
  }
}
</style>
