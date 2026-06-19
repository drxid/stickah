<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PrintDocument from '@/features/print/PrintDocument.vue'
import { computeLayout, pageCount, A4 } from '@/features/print/labelLayout'
import { useSelectionStore } from '@/stores/selection'
import { useTemplateStore } from '@/stores/template'

const router = useRouter()
const selection = useSelectionStore()
const template = useTemplateStore()

const PX_PER_MM = 96 / 25.4
const SHEET_GAP_MM = 12

const layout = computed(() => computeLayout(template.size))
const pages = computed(() => pageCount(selection.totalLabels, layout.value))

const stage = ref<HTMLElement | null>(null)
const stageWidth = ref(0)

const scale = computed(() => {
  const sheetPx = A4.width * PX_PER_MM
  if (!stageWidth.value) return 1
  return Math.min(1, stageWidth.value / sheetPx)
})

const framedHeight = computed(() => {
  const naturalMm = pages.value * A4.height + Math.max(0, pages.value - 1) * SHEET_GAP_MM
  return `${naturalMm * PX_PER_MM * scale.value}px`
})

let ro: ResizeObserver | null = null
onMounted(() => {
  if (stage.value) {
    stageWidth.value = stage.value.clientWidth
    ro = new ResizeObserver((entries) => {
      stageWidth.value = entries[0].contentRect.width
    })
    ro.observe(stage.value)
  }
})
onBeforeUnmount(() => ro?.disconnect())

function print() {
  window.print()
}
</script>

<template>
  <section class="step step3">
    <div class="step3__bar no-print">
      <div class="info">
        <span class="info__big">{{ pages }}</span>
        <span class="info__small">
          лист(ов) A4 · {{ selection.totalLabels }} наклеек ·
          {{ layout.cols }}×{{ layout.rows }} на листе
        </span>
      </div>
      <p class="info__hint mono">{{ template.size.label }} · {{ template.design.label }}</p>
    </div>

    <div ref="stage" class="preview-stage">
      <div class="preview-frame" :style="{ height: framedHeight }">
        <div
          class="preview-scaler"
          :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }"
        >
          <PrintDocument />
        </div>
      </div>
    </div>

    <footer class="step__footer no-print">
      <button class="btn btn--ghost" @click="router.push('/template')">← Назад</button>
      <span class="step__hint">Шаг 3 из 3 · в диалоге печати выбери «Сохранить как PDF» или принтер</span>
      <button class="btn btn--primary" @click="print">⎙ Печать / Сохранить PDF</button>
    </footer>
  </section>
</template>

<style scoped>
.step3 {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: var(--gap);
  min-height: 0;
}
.step3__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.info {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.info__big {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  color: var(--butter);
  line-height: 1;
}
.info__small {
  color: var(--text-muted);
  font-size: 14px;
}
.info__hint {
  color: var(--text-faint);
}

.preview-stage {
  overflow: auto;
  min-height: 0;
  background: repeating-conic-gradient(#202026 0% 25%, #191920 0% 50%) 50% / 28px 28px;
  border: 1px solid var(--ink-line);
  border-radius: var(--r-lg);
  padding: 22px;
}
.preview-frame {
  position: relative;
}
.preview-scaler {
  width: 210mm;
  margin: 0 auto;
}

.step__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.step__hint {
  color: var(--text-faint);
  font-size: 13px;
}
</style>
