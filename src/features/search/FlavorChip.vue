<script setup lang="ts">
import type { FlavorDisplay } from '@/types/catalog'

const props = defineProps<{
  flavor: FlavorDisplay
  mode: 'result' | 'selected'
  added?: boolean
  copies?: number
}>()

const emit = defineEmits<{
  add: [id: string]
  remove: [id: string]
  setCopies: [id: string, copies: number]
}>()

function bump(delta: number) {
  emit('setCopies', props.flavor.id, (props.copies ?? 1) + delta)
}
</script>

<template>
  <div class="chip" :class="{ 'chip--added': added }">
    <span class="chip__swatch" :style="{ '--accent': flavor.accent ?? '#9be8e0' }" aria-hidden="true" />

    <span class="chip__text">
      <span class="chip__name">{{ flavor.name }}</span>
      <span class="chip__meta">{{ flavor.manufacturerName }} · {{ flavor.lineName }}</span>
    </span>

    <template v-if="mode === 'result'">
      <button
        v-if="!added"
        class="chip__action chip__add"
        :aria-label="`Добавить ${flavor.name}`"
        @click="emit('add', flavor.id)"
      >
        +
      </button>
      <span v-else class="chip__badge">в наборе</span>
    </template>

    <template v-else>
      <span class="stepper">
        <button class="stepper__btn" aria-label="Меньше копий" @click="bump(-1)">−</button>
        <span class="stepper__val mono">{{ copies }}</span>
        <button class="stepper__btn" aria-label="Больше копий" @click="bump(1)">+</button>
      </span>
      <button
        class="chip__action chip__remove"
        :aria-label="`Убрать ${flavor.name}`"
        @click="emit('remove', flavor.id)"
      >
        ✕
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
  transition: border-color 0.15s ease, transform 0.12s ease, background 0.15s ease;
}
.chip:hover {
  border-color: var(--ink-soft-2);
  transform: translateY(-1px);
}
.chip--added {
  border-color: color-mix(in srgb, var(--acid-lime) 45%, var(--ink-line));
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
  font-size: 12px;
  color: var(--text-muted);
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
  transition: background 0.15s ease, transform 0.1s ease;
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
  color: var(--acid-lime);
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
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text);
  font-size: 17px;
  line-height: 1;
}
.stepper__btn:hover {
  background: var(--ink-line);
}
.stepper__val {
  min-width: 20px;
  text-align: center;
  font-size: 13px;
}
</style>
