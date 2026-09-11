<script setup lang="ts">
import { computed, ref } from 'vue'

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
    <svg
      v-if="theme === 'dark'"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
    <svg
      v-else
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
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
