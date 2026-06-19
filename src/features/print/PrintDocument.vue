<script setup lang="ts">
import { computed } from 'vue'
import PrintSheet from './PrintSheet.vue'
import { computeLayout, paginate } from './labelLayout'
import { useCatalogStore } from '@/stores/catalog'
import { useSelectionStore } from '@/stores/selection'
import { useTemplateStore } from '@/stores/template'
import type { FlavorDisplay } from '@/types/catalog'

const catalog = useCatalogStore()
const selection = useSelectionStore()
const template = useTemplateStore()

const layout = computed(() => computeLayout(template.size))

/** Плоский список наклеек с учётом копий. */
const labels = computed<FlavorDisplay[]>(() => {
  const out: FlavorDisplay[] = []
  for (const item of selection.items) {
    const d = catalog.display(item.flavorId)
    if (!d) continue
    for (let i = 0; i < item.copies; i++) out.push(d)
  }
  return out
})

const pages = computed(() => paginate(labels.value, layout.value.perPage))

defineExpose({ layout, pageCount: computed(() => pages.value.length) })
</script>

<template>
  <div class="print-root">
    <PrintSheet
      v-for="(pageItems, p) in pages"
      :key="p"
      :items="pageItems"
      :layout="layout"
      :size="template.size"
      :design="template.designId"
      :options="template.options"
    />
  </div>
</template>

<style scoped>
.print-root {
  display: flex;
  flex-direction: column;
  gap: 12mm;
  align-items: center;
}
</style>
