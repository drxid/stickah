import type { Directive } from 'vue'

// Градиенты по краям прокручиваемой области: верхний появляется, когда область прокручена
// вниз, нижний — пока ниже есть что листать. Сами градиенты — в base.css ([data-scroll-fade]).
// Состояние пишем в data-атрибуты, а не в class: class элемента принадлежит шаблону Vue.

/** Допуск, px: scrollTop бывает дробным и не доходит до края ровно. */
const EDGE = 2

const cleanups = new WeakMap<HTMLElement, () => void>()

function update(el: HTMLElement) {
  const { scrollTop, scrollHeight, clientHeight } = el
  el.toggleAttribute('data-fade-top', scrollTop > EDGE)
  el.toggleAttribute('data-fade-bottom', scrollTop + clientHeight < scrollHeight - EDGE)
}

export const vScrollFade: Directive<HTMLElement> = {
  mounted(el) {
    const onChange = () => update(el)
    el.dataset.scrollFade = ''
    el.addEventListener('scroll', onChange, { passive: true })
    const ro = new ResizeObserver(onChange)
    ro.observe(el)
    cleanups.set(el, () => {
      el.removeEventListener('scroll', onChange)
      ro.disconnect()
    })
    onChange()
  },
  // Содержимое поменялось (новые результаты поиска) — высота контента другая.
  updated(el) {
    update(el)
  },
  unmounted(el) {
    cleanups.get(el)?.()
    cleanups.delete(el)
  },
}
