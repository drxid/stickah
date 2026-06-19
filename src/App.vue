<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'

const route = useRoute()
const catalog = useCatalogStore()

const steps = [
  { name: 'search', label: 'Набор' },
  { name: 'template', label: 'Шаблон' },
  { name: 'print', label: 'Печать' },
]
const activeIndex = computed(() => steps.findIndex((s) => s.name === route.name))

onMounted(() => catalog.load())
</script>

<template>
  <div class="app-shell">
    <header class="app-header no-print">
      <div class="brand">
        <span class="brand__logo">Stickah</span>
        <span class="brand__tag mono">наклейки для табаков</span>
      </div>

      <nav class="stepper" aria-label="Шаги">
        <span
          v-for="(s, i) in steps"
          :key="s.name"
          class="stepper__item"
          :class="{
            'stepper__item--active': i === activeIndex,
            'stepper__item--done': i < activeIndex,
          }"
        >
          <span class="stepper__num">{{ i + 1 }}</span>
          <span class="stepper__label">{{ s.label }}</span>
        </span>
      </nav>
    </header>

    <main class="app-main">
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 22px clamp(16px, 4vw, 40px) 26px;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.brand__logo {
  font-family: var(--font-logo);
  font-size: 34px;
  line-height: 1;
  background: var(--holo);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 0.01em;
}
.brand__tag {
  color: var(--text-faint);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 6px;
}
.stepper__item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px 7px 8px;
  border-radius: var(--r-pill);
  background: var(--ink-soft);
  border: 1px solid var(--ink-line);
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
}
.stepper__item--active {
  color: #1a1505;
  background: var(--butter);
  border-color: transparent;
}
.stepper__item--done {
  color: var(--acid-lime);
  border-color: color-mix(in srgb, var(--acid-lime) 40%, var(--ink-line));
}
.stepper__num {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.18);
  font-family: var(--font-mono);
  font-size: 12px;
}
.stepper__item--active .stepper__num {
  background: rgba(0, 0, 0, 0.22);
}

.app-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (max-width: 620px) {
  .stepper__label {
    display: none;
  }
}
</style>
