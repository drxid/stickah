<script setup lang="ts">
import { computed } from 'vue'
import LabelCard from './LabelCard.vue'
import type { SheetLayout, Slot } from './labelLayout'
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

function slotStyle(slot: Slot) {
  const { width, height } = props.size
  return {
    left: `${props.layout.margin + slot.x}mm`,
    top: `${props.layout.margin + slot.y}mm`,
    width: `${slot.rotated ? height : width}mm`,
    height: `${slot.rotated ? width : height}mm`,
  }
}

/** Повёрнутая наклейка: rotate(90°) вокруг левого верхнего угла и сдвиг вправо на её высоту. */
const rotatedLabelStyle = computed(() => ({
  transform: `translateX(${props.size.height}mm) rotate(90deg)`,
}))
</script>

<template>
  <div class="print-sheet">
    <div
      v-for="(flavor, i) in items"
      :key="i"
      class="slot"
      :class="{ 'slot--cut': options.cutGuides }"
      :style="slotStyle(layout.slots[i])"
    >
      <LabelCard
        :flavor="flavor"
        :size="size"
        :design="design"
        :options="options"
        :style="layout.slots[i].rotated ? rotatedLabelStyle : undefined"
      />
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
.slot {
  position: absolute;
}
.slot > * {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}
.slot--cut {
  outline: 0.15mm dashed #c7c7c7;
  outline-offset: 0.6mm;
}
</style>
