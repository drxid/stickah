<script setup lang="ts">
import { computed } from 'vue';
import { Minus, Plus, X } from '@lucide/vue';
import { findLogo } from '@/data/logos';
import type { FlavorDisplay } from '@/types/catalog';

/** Площадь логотипа, px². Логотипы выравниваем по площади, как на наклейке Grove,
 *  чтобы широкие и почти квадратные знаки весили одинаково. */
const LOGO_AREA = 900;
const LOGO_MAX_H = 16;

const props = defineProps<{
  flavor: FlavorDisplay;
  mode: 'result' | 'selected';
  added?: boolean;
  copies?: number;
}>();

const emit = defineEmits<{
  add: [id: string];
  remove: [id: string];
  setCopies: [id: string, copies: number];
}>();

const logo = computed(() => findLogo(props.flavor.manufacturerId, props.flavor.manufacturerName));
const logoStyle = computed(() => {
  const a = logo.value?.aspect ?? 1;
  const h = Math.min(Math.sqrt(LOGO_AREA / a), LOGO_MAX_H);
  return { height: `${h}px`, width: `${h * a}px` };
});

function bump(delta: number) {
  emit('setCopies', props.flavor.id, (props.copies ?? 1) + delta);
}
</script>

<template>
  <div class="chip" :class="{ 'chip--added': added }">
    <span
      class="chip__swatch"
      :style="{ '--accent': flavor.accent ?? '#9be8e0' }"
      aria-hidden="true"
    />

    <span class="chip__text">
      <span class="chip__name">{{ flavor.name }}</span>
      <span class="chip__meta">
        <img
          v-if="logo"
          class="chip__logo"
          :src="logo.src"
          :alt="flavor.manufacturerName"
          :style="logoStyle"
        />
        <span v-else>{{ flavor.manufacturerName }}</span>
        <span aria-hidden="true">·</span>
        <span class="chip__line">{{ flavor.lineName }}</span>
      </span>
    </span>

    <template v-if="mode === 'result'">
      <button
        v-if="!added"
        class="chip__action chip__add"
        :aria-label="`Добавить ${flavor.name}`"
        @click="emit('add', flavor.id)"
      >
        <Plus :size="18" aria-hidden="true" />
      </button>
      <span v-else class="chip__badge">в наборе</span>
    </template>

    <template v-else>
      <span class="stepper">
        <button class="stepper__btn" aria-label="Меньше копий" @click="bump(-1)">
          <Minus :size="16" aria-hidden="true" />
        </button>
        <span class="stepper__val mono">{{ copies }}</span>
        <button class="stepper__btn" aria-label="Больше копий" @click="bump(1)">
          <Plus :size="16" aria-hidden="true" />
        </button>
      </span>
      <button
        class="chip__action chip__remove"
        :aria-label="`Убрать ${flavor.name}`"
        @click="emit('remove', flavor.id)"
      >
        <X :size="18" aria-hidden="true" />
      </button>
    </template>
  </div>
</template>

<style scoped>
.chip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--ink-soft);
  border: 1px solid var(--ink-line);
  border-radius: var(--r-md);
  transition:
    border-color 0.15s ease,
    transform 0.12s ease,
    background 0.15s ease;
}
/* На тач-экранах hover «залипает» после тапа — подъём только для мыши. */
@media (hover: hover) {
  .chip:hover {
    border-color: var(--ink-soft-2);
    transform: translateY(-1px);
  }
}
.chip--added {
  border-color: color-mix(in srgb, var(--done) 45%, var(--ink-line));
}

.chip__swatch {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--holo);
  box-shadow:
    inset 0 0 0 2px rgba(255, 255, 255, 0.85),
    0 2px 6px rgba(0, 0, 0, 0.35);
  position: relative;
}
.chip__swatch::after {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.55;
  mix-blend-mode: multiply;
}

.chip__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}
.chip__name {
  font-weight: 700;
  font-size: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chip__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 18px;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
.chip__logo {
  flex: none;
  display: block;
  opacity: 0.85;
  filter: var(--brand-logo-filter);
}
.chip__line {
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip__action {
  flex: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--ink-line);
  background: var(--ink-soft-2);
  color: var(--text);
  font-size: 18px;
  line-height: 1;
  display: grid;
  place-items: center;
  transition:
    background 0.15s ease,
    transform 0.1s ease;
}
.chip__action:hover {
  background: var(--ink-line);
}
.chip__add {
  background: var(--butter);
  color: #1a1505;
  border-color: transparent;
  font-weight: 700;
}
.chip__add:hover {
  filter: brightness(1.07);
  background: var(--butter);
}
.chip__badge {
  flex: none;
  font-size: 11px;
  font-weight: 700;
  color: var(--done);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stepper {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--ink-soft-2);
  border-radius: var(--r-pill);
  padding: 3px;
}
.stepper__btn {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text);
}
.stepper__btn:hover {
  background: var(--ink-line);
}
.stepper__val {
  min-width: 20px;
  text-align: center;
  font-size: 13px;
}

/* Крупнее кнопки под палец. */
@media (pointer: coarse) {
  .chip__action {
    width: 38px;
    height: 38px;
  }
  .stepper__btn {
    width: 32px;
    height: 32px;
  }
}
</style>
