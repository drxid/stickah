<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AboutPopover from '@/features/shell/AboutPopover.vue'
import ThemeToggle from '@/features/shell/ThemeToggle.vue'
import { useCatalogStore } from '@/stores/catalog'
import { useSelectionStore } from '@/stores/selection'
import logoSvg from '@/assets/logo.svg?raw'

const route = useRoute()
const router = useRouter()
const catalog = useCatalogStore()
const selection = useSelectionStore()

const steps = [
  { name: 'search', label: 'Набор' },
  { name: 'template', label: 'Шаблон' },
  { name: 'print', label: 'Печать' },
]
const activeIndex = computed(() => steps.findIndex((s) => s.name === route.name))
// Как и в роутере: шаблон и печать недоступны с пустым набором.
const isLocked = (i: number) => i > 0 && selection.count === 0

onMounted(() => catalog.load())
</script>

<template>
  <div class="app-shell">
    <header class="app-header no-print">
      <div class="brand">
        <!-- eslint-disable-next-line vue/no-v-html -- логотип берётся из локального файла, а не из данных -->
        <span class="brand__logo" role="img" aria-label="Stickah" v-html="logoSvg" />
        <AboutPopover />
        <span class="brand__tag mono">наклейки для табаков</span>
      </div>

      <div class="header-actions">
        <nav class="stepper" aria-label="Шаги">
          <button
            v-for="(s, i) in steps"
            :key="s.name"
            class="stepper__item"
            :class="{
              'stepper__item--active': i === activeIndex,
              'stepper__item--done': i < activeIndex,
            }"
            :aria-current="i === activeIndex ? 'step' : undefined"
            :disabled="isLocked(i)"
            @click="router.push({ name: s.name })"
          >
            <span class="stepper__num">{{ i + 1 }}</span>
            <span class="stepper__label">{{ s.label }}</span>
          </button>
        </nav>
        <ThemeToggle />
      </div>
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
  position: relative; /* от него позиционируется панель «О проекте» */
  display: flex;
  align-items: center;
  gap: 14px;
}
/* Цвета лого — из токенов --logo-* (см. tokens.css): в тёмной теме они инвертированы. */
.brand__logo {
  display: block;
  height: 44px;
}
.brand__logo :deep(svg) {
  display: block;
  width: auto;
  height: 100%;
}
.brand__logo :deep([fill='#141414']),
.brand__logo :deep([fill='black']) {
  fill: var(--logo-fg);
}
.brand__logo :deep([fill='#333333']) {
  fill: var(--logo-fold);
  stroke: var(--logo-edge);
}
.brand__tag {
  color: var(--text-faint);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
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
  transition: color 0.15s ease, border-color 0.15s ease;
}
.stepper__item:not(:disabled):not(.stepper__item--active):hover {
  color: var(--text);
  border-color: var(--text-faint);
}
.stepper__item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.stepper__item--active {
  color: #1a1505;
  background: var(--butter);
  border-color: transparent;
  cursor: default;
}
.stepper__item--done {
  color: var(--done);
  border-color: color-mix(in srgb, var(--done) 40%, var(--ink-line));
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

/* Телефон: шапка в одну строку — лого меньше, без подписи, шаги кружками. */
@media (max-width: 620px) {
  .app-shell {
    padding-block: 14px 16px;
  }
  .app-header {
    flex-wrap: nowrap;
    gap: 12px;
    margin-bottom: 14px;
  }
  .brand {
    gap: 10px;
  }
  .brand__logo {
    height: 36px;
  }
  .brand__tag {
    display: none;
  }
  .header-actions {
    gap: 8px;
  }
  .stepper__item {
    padding: 5px;
    gap: 0;
  }
  .stepper__label {
    display: none;
  }
}
</style>
