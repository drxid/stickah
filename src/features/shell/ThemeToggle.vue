<script setup lang="ts">
import { computed, ref } from 'vue'
import { Moon, Sun } from '@lucide/vue'

type Theme = 'light' | 'dark'

// Ключ читает и inline-скрипт в index.html — он ставит тему до отрисовки.
const STORAGE_KEY = 'stickah:theme'

const theme = ref<Theme>(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark')
const label = computed(() => (theme.value === 'dark' ? 'Светлая тема' : 'Тёмная тема'))

function toggle() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = theme.value
  try {
    localStorage.setItem(STORAGE_KEY, theme.value)
  } catch {
    /* noop */
  }
}
</script>

<template>
  <button class="theme-toggle" :aria-label="label" :title="label" @click="toggle">
    <Sun v-if="theme === 'dark'" :size="18" aria-hidden="true" />
    <Moon v-else :size="18" aria-hidden="true" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--ink-soft);
  border: 1px solid var(--ink-line);
  color: var(--text-muted);
  transition: color 0.15s ease, border-color 0.15s ease;
}
.theme-toggle:hover {
  color: var(--text);
  border-color: var(--text-faint);
}
</style>
