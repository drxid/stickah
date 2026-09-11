<script setup lang="ts">
// Кнопка «i» рядом с лого: о проекте и авторе. Панель позиционируется от ближайшего
// positioned-предка (блок .brand в шапке), чтобы на узком экране не вылезать за край.
import { onBeforeUnmount, ref, watch } from 'vue'

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)

function onPointerDown(e: PointerEvent) {
  if (!root.value?.contains(e.target as Node)) open.value = false
}
function onKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  open.value = false
  button.value?.focus()
}

// Слушатели документа нужны только пока панель открыта.
function listen(on: boolean) {
  if (on) {
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
  } else {
    document.removeEventListener('pointerdown', onPointerDown)
    document.removeEventListener('keydown', onKeyDown)
  }
}
watch(open, listen)
onBeforeUnmount(() => listen(false))
</script>

<template>
  <div ref="root" class="about">
    <button
      ref="button"
      class="about__btn"
      :class="{ 'about__btn--on': open }"
      :aria-expanded="open"
      aria-controls="about-panel"
      aria-label="О проекте и авторе"
      title="О проекте"
      @click="open = !open"
    >
      i
    </button>

    <div v-if="open" id="about-panel" class="about__panel" role="dialog" aria-label="О проекте">
      <p class="about__lead">
        <strong>Stickah</strong> — генератор наклеек для банок с табаком: найди вкусы, выбери
        дизайн и распечатай лист A4.
      </p>
      <dl class="about__list">
        <dt class="mono">Автор</dt>
        <dd><a href="https://github.com/drxid" target="_blank" rel="noopener">drxid</a></dd>
        <dt class="mono">Код</dt>
        <dd>
          <a href="https://github.com/drxid/stickah" target="_blank" rel="noopener">
            github.com/drxid/stickah
          </a>
        </dd>
        <dt class="mono">Данные</dt>
        <dd>
          <a href="https://htreviews.org" target="_blank" rel="noopener">htreviews.org</a>
        </dd>
      </dl>
    </div>
  </div>
</template>

<style scoped>
.about__btn {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 50%;
  border: 1.5px solid var(--ink-line);
  background: var(--ink-soft);
  color: var(--text-muted);
  font-family: var(--font-serif);
  font-size: 14px;
  font-weight: 700;
  font-style: italic;
  line-height: 1;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.about__btn:hover,
.about__btn--on {
  color: var(--text);
  border-color: var(--text-faint);
}

.about__panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  z-index: 20;
  width: min(340px, calc(100vw - 32px));
  padding: 16px 18px;
  background: var(--ink-soft);
  border: 1px solid var(--ink-line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-card);
  font-size: 14px;
  line-height: 1.45;
}
.about__lead {
  color: var(--text);
}
.about__list {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 14px;
  margin: 14px 0 0;
}
.about__list dt {
  color: var(--text-faint);
  align-self: center;
}
.about__list dd {
  margin: 0;
}
.about__list a {
  color: var(--text);
  text-underline-offset: 3px;
}
.about__list a:hover {
  color: var(--text-muted);
}
</style>
