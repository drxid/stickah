<script setup lang="ts">
// Крепость на наклейке — три точки. Цвет — currentColor, размеры по умолчанию сняты с Grove;
// дизайн может переопределить их через --dot-size / --dot-gap / --dot-border.
import { computed } from 'vue'

const props = defineProps<{ strength: number }>()

/** Крепость каталога → закрашенные точки из трёх с шагом 0.5:
 *  лёгкая (2) → 1, лёгкая-средняя (3) → 1.5, средняя (5) → 2,
 *  выше средней (7) → 2.5, крепкая (9–10) → 3. */
const dots = computed(() => {
  const s = props.strength
  if (s <= 2) return 1
  if (s <= 4) return 1.5
  if (s <= 6) return 2
  if (s <= 8) return 2.5
  return 3
})
</script>

<template>
  <div class="strength" role="img" :aria-label="`Крепость ${String(dots).replace('.', ',')} из 3`">
    <span
      v-for="i in 3"
      :key="i"
      class="strength__dot"
      :class="{ 'strength__dot--on': i <= dots, 'strength__dot--half': i - 0.5 === dots }"
    />
  </div>
</template>

<style scoped>
.strength {
  display: flex;
  justify-content: center;
  gap: var(--dot-gap, 1.2mm);
}
.strength__dot {
  position: relative;
  overflow: hidden;
  width: var(--dot-size, 1.6mm);
  height: var(--dot-size, 1.6mm);
  border: var(--dot-border, 0.15mm) solid currentColor;
  border-radius: 50%;
}
.strength__dot--on {
  background: currentColor;
}
/* Половинка — левая часть круга; отдельный слой, а не градиент: надёжнее в печати. */
.strength__dot--half::before {
  content: '';
  position: absolute;
  inset: 0 50% 0 0;
  background: currentColor;
}
</style>
