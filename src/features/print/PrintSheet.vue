<script setup lang="ts">
import { computed } from 'vue'
import LabelCard from './LabelCard.vue'
import type { SheetLayout } from './labelLayout'
import type { SizePreset } from '@/data/sizes'
import type { DesignId } from '@/data/designs'
import type { LabelOptions } from '@/stores/template'
import type { FlavorDisplay } from '@/types/catalog'

const props = defineProps<{
  items: FlavorDisplay[]
  layout: SheetLayout
  size: SizePreset
  design: DesignId
  options: LabelOptions
}>()

const sheetStyle = computed(() => ({ padding: `${props.layout.margin}mm` }))
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.layout.cols}, ${props.layout.cellW}mm)`,
  gridAutoRows: `${props.layout.cellH}mm`,
  columnGap: `${props.layout.gutter}mm`,
  rowGap: `${props.layout.gutter}mm`,
}))
</script>

<template>
  <div class="print-sheet" :style="sheetStyle">
    <div class="sheet-grid" :style="gridStyle">
      <div
        v-for="(flavor, i) in items"
        :key="i"
        class="slot"
        :class="{ 'slot--cut': options.cutGuides }"
      >
        <LabelCard :flavor="flavor" :size="size" :design="design" :options="options" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.print-sheet {
  width: 210mm;
  height: 297mm;
  background: #fff;
  position: relative;
  box-shadow: var(--shadow-card);
  flex: none;
}
.sheet-grid {
  display: grid;
  justify-content: start;
  align-content: start;
}
.slot {
  display: flex;
  align-items: center;
  justify-content: center;
}
.slot--cut {
  outline: 0.15mm dashed #c7c7c7;
  outline-offset: 0.6mm;
}
</style>
