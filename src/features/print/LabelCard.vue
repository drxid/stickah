<script setup lang="ts">
import { computed } from 'vue'
import type { SizePreset } from '@/data/sizes'
import type { DesignId } from '@/data/designs'
import type { LabelOptions } from '@/stores/template'
import type { FlavorDisplay } from '@/types/catalog'

const props = defineProps<{
  flavor: FlavorDisplay
  size: SizePreset
  design: DesignId
  options: LabelOptions
}>()

const rootStyle = computed(() => ({
  width: `${props.size.width}mm`,
  height: `${props.size.height}mm`,
  '--accent': props.flavor.accent ?? '#9be8e0',
}))

/** Подбор кегля имени, мм — ужимаем длинные слова, чтобы не вылезали за край. */
const nameFontMm = computed(() => {
  const base = Math.min(props.size.width, props.size.height)
  const longest = props.flavor.name
    .split(/\s+/)
    .reduce((m, w) => Math.max(m, w.length), 0)
  let fs = base * 0.2
  if (longest > 6) fs *= 6 / longest
  return Math.max(base * 0.085, Math.min(fs, base * 0.22))
})

const metaText = computed(() => {
  const parts: string[] = []
  if (props.options.showManufacturer) parts.push(props.flavor.manufacturerName)
  if (props.options.showLine) parts.push(props.flavor.lineName)
  return parts.join(' · ')
})

const showStrength = computed(
  () => props.options.showStrength && typeof props.flavor.strength === 'number',
)
const tags = computed(() =>
  props.options.showProfile ? props.flavor.profile?.slice(0, 3) ?? [] : [],
)
</script>

<template>
  <div class="label" :class="[`label--${design}`, `label--${size.shape}`]" :style="rootStyle">
    <div v-if="design === 'holo'" class="label__sheen" aria-hidden="true" />
    <div class="label__inner">
      <div class="label__name" :style="{ fontSize: `${nameFontMm}mm` }">
        {{ flavor.name }}
      </div>
      <div v-if="metaText" class="label__meta">{{ metaText }}</div>
      <div v-if="tags.length" class="label__tags">
        <span v-for="t in tags" :key="t" class="label__tag">{{ t }}</span>
      </div>
      <div v-if="showStrength" class="label__strength">{{ flavor.strength }}</div>
    </div>
  </div>
</template>

<style scoped>
.label {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--on-paper);
  font-family: var(--font-body);
}
.label--rect {
  border-radius: 3mm;
}
.label--round {
  border-radius: 50%;
}

.label__inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7mm;
  text-align: center;
  padding: 2mm;
  max-width: 86%;
}
.label--round .label__inner {
  max-width: 74%;
}

.label__name {
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.01em;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.label__meta {
  font-size: 2.4mm;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: var(--on-paper-muted);
  line-height: 1.1;
}
.label__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 1mm;
  justify-content: center;
  margin-top: 0.5mm;
}
.label__tag {
  font-size: 2mm;
  font-weight: 700;
  padding: 0.4mm 1.4mm;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.07);
  color: var(--on-paper-muted);
}
.label__strength {
  position: absolute;
  top: 1.6mm;
  right: 2mm;
  z-index: 3;
  font-family: var(--font-mono);
  font-size: 2.3mm;
  font-weight: 700;
  padding: 0.4mm 1.4mm;
  border-radius: 999px;
  background: var(--accent);
  color: #1a1a1e;
}
.label--round .label__strength {
  top: 4mm;
}

/* --- CLEAN --- */
.label--clean {
  background: var(--paper);
  border: 0.5mm solid var(--accent);
}
.label--clean.label--rect {
  box-shadow: inset 0 0 0 0.2mm rgba(0, 0, 0, 0.06);
}

/* --- HOLO --- */
.label--holo {
  background: var(--holo);
  box-shadow: inset 0 0 0 1mm rgba(255, 255, 255, 0.85);
}
.label--holo .label__name {
  color: #1a1a1e;
  text-shadow: 0 0.3mm 0.6mm rgba(255, 255, 255, 0.6);
}
.label--holo .label__inner::before {
  content: '';
  position: absolute;
  inset: -3mm;
  z-index: -1;
  background: radial-gradient(closest-side, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
}
.label__sheen {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--holo-sheen);
  mix-blend-mode: screen;
  opacity: 0.7;
}

/* --- MONO --- */
.label--mono {
  background: #fff;
  border: 0.8mm solid var(--accent);
  color: #161616;
}
.label--mono .label__name {
  color: #161616;
}
.label--mono .label__meta {
  color: var(--accent);
  filter: brightness(0.7);
}
.label--mono .label__tag {
  background: transparent;
  border: 0.2mm solid var(--accent);
  color: var(--accent);
  filter: brightness(0.8);
}
.label--mono .label__strength {
  background: transparent;
  border: 0.3mm solid var(--accent);
  color: #161616;
}
</style>
