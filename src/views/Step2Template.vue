<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import LabelCard from '@/features/print/LabelCard.vue'
import { SIZE_PRESETS } from '@/data/sizes'
import { DESIGNS } from '@/data/designs'
import { useCatalogStore } from '@/stores/catalog'
import { useSelectionStore } from '@/stores/selection'
import { useTemplateStore } from '@/stores/template'

const router = useRouter()
const catalog = useCatalogStore()
const selection = useSelectionStore()
const template = useTemplateStore()

// Вкус для превью: первый из набора, иначе первый из каталога.
const previewFlavor = computed(() => {
  const id = selection.items[0]?.flavorId ?? catalog.flavors[0]?.id
  return id ? catalog.display(id) : undefined
})

const optionList = [
  { key: 'showManufacturer', label: 'Производитель' },
  { key: 'showLine', label: 'Линейка' },
  { key: 'showStrength', label: 'Крепость' },
  { key: 'showProfile', label: 'Теги вкуса' },
  { key: 'cutGuides', label: 'Линии реза' },
] as const
</script>

<template>
  <section class="step step2">
    <div class="step2__controls">
      <div class="block">
        <h2 class="block__title">Размер</h2>
        <div class="grid-sizes">
          <button
            v-for="s in SIZE_PRESETS"
            :key="s.id"
            class="opt"
            :class="{ 'opt--on': template.sizeId === s.id }"
            @click="template.setSize(s.id)"
          >
            <span class="opt__shape" :class="`opt__shape--${s.shape}`" aria-hidden="true" />
            <span class="opt__label">{{ s.label }}</span>
            <span class="opt__desc">{{ s.description }}</span>
          </button>
        </div>
      </div>

      <div class="block">
        <h2 class="block__title">Дизайн</h2>
        <div class="grid-designs">
          <button
            v-for="d in DESIGNS"
            :key="d.id"
            class="design"
            :class="{ 'design--on': template.designId === d.id }"
            @click="template.setDesign(d.id)"
          >
            <span class="design__swatch" :class="`design__swatch--${d.id}`" aria-hidden="true" />
            <span class="design__body">
              <span class="design__label">{{ d.label }}</span>
              <span class="design__desc">{{ d.description }}</span>
              <span v-if="d.printNote" class="design__note">{{ d.printNote }}</span>
            </span>
          </button>
        </div>
      </div>

      <div class="block">
        <h2 class="block__title">Показывать на наклейке</h2>
        <div class="toggles">
          <label v-for="o in optionList" :key="o.key" class="toggle">
            <input
              v-model="template.options[o.key]"
              type="checkbox"
              @change="template.persist()"
            />
            <span>{{ o.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="step2__preview">
      <h2 class="block__title">Превью</h2>
      <div class="preview-card">
        <LabelCard
          v-if="previewFlavor"
          :flavor="previewFlavor"
          :size="template.size"
          :design="template.designId"
          :options="template.options"
        />
      </div>
      <p class="preview-meta mono">
        {{ template.size.label }} · {{ template.design.label }}
      </p>
    </div>

    <footer class="step__footer no-print">
      <button class="btn btn--ghost" @click="router.push('/')">← Назад</button>
      <span class="step__hint">Шаг 2 из 3 · один размер и дизайн на лист</span>
      <button class="btn btn--primary" @click="router.push('/print')">Далее →</button>
    </footer>
  </section>
</template>

<style scoped>
.step2 {
  display: grid;
  grid-template-columns: 1fr 320px;
  grid-template-rows: 1fr auto;
  gap: var(--gap);
  min-height: 0;
}
.step2__controls {
  display: flex;
  flex-direction: column;
  gap: 22px;
  overflow-y: auto;
  min-height: 0;
  padding-right: 6px;
}
.step__footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
}
.step__hint {
  color: var(--text-faint);
  font-size: 13px;
}

.block__title {
  font-size: 18px;
  margin-bottom: 12px;
}

.grid-sizes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
.opt {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  text-align: left;
  padding: 14px;
  background: var(--ink-soft);
  border: 1px solid var(--ink-line);
  border-radius: var(--r-md);
  color: var(--text);
}
.opt:hover {
  border-color: var(--ink-soft-2);
}
.opt--on {
  border-color: var(--butter);
  background: color-mix(in srgb, var(--butter) 10%, var(--ink-soft));
}
.opt__shape {
  background: var(--holo);
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.8);
}
.opt__shape--round {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}
.opt__shape--rect {
  width: 38px;
  height: 24px;
  border-radius: 5px;
}
.opt__label {
  font-weight: 700;
  font-size: 14px;
}
.opt__desc {
  font-size: 12px;
  color: var(--text-muted);
}

.grid-designs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.design {
  display: flex;
  gap: 14px;
  align-items: stretch;
  text-align: left;
  padding: 14px;
  background: var(--ink-soft);
  border: 1px solid var(--ink-line);
  border-radius: var(--r-md);
  color: var(--text);
}
.design:hover {
  border-color: var(--ink-soft-2);
}
.design--on {
  border-color: var(--butter);
  background: color-mix(in srgb, var(--butter) 10%, var(--ink-soft));
}
.design__swatch {
  flex: none;
  width: 46px;
  border-radius: 10px;
}
.design__swatch--clean {
  background: var(--paper);
  border: 2px solid var(--holo-2);
}
.design__swatch--holo {
  background: var(--holo);
  box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.85);
}
.design__swatch--mono {
  background: #fff;
  border: 3px solid var(--holo-1);
}
.design__swatch--noir {
  background: radial-gradient(125% 140% at 50% 0%, #26222b, #131115 70%);
  box-shadow: inset 0 0 0 2px var(--holo-5);
}
.design__swatch--onyx {
  background: #15151a;
  border: 2px solid #3a3a44;
}
.design__body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.design__label {
  font-weight: 700;
}
.design__desc {
  font-size: 12.5px;
  color: var(--text-muted);
}
.design__note {
  font-size: 11.5px;
  color: var(--text-faint);
  font-style: italic;
}

.toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  background: var(--ink-soft);
  border: 1px solid var(--ink-line);
  border-radius: var(--r-pill);
  font-size: 14px;
  cursor: pointer;
}
.toggle input {
  accent-color: var(--butter);
  width: 16px;
  height: 16px;
}

.step2__preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.preview-card {
  flex: 1;
  display: grid;
  place-items: center;
  background: repeating-conic-gradient(#2a2a32 0% 25%, #232329 0% 50%) 50% / 24px 24px;
  border: 1px solid var(--ink-line);
  border-radius: var(--r-lg);
  padding: 20px;
}
.preview-meta {
  color: var(--text-faint);
  text-align: center;
}

@media (max-width: 860px) {
  .step2 {
    grid-template-columns: 1fr;
  }
}
</style>
