<script setup lang="ts">
// Лицевая сторона дизайна Grove. Размеры сняты с макета (1195 px ≈ 120 мм, 1 px ≈ 0.1 мм),
// имя вкуса увеличено до 7 мм, теги — до 2.6 мм. Вкус, теги и крепость — чуть выше центра,
// производитель — внизу.
import { computed } from 'vue';
import StrengthDots from './StrengthDots.vue';
import ornamentUrl from '@/assets/grove-ornament.svg';
import { findLogo } from '@/data/logos';
import type { LabelOptions } from '@/stores/template';
import type { FlavorDisplay } from '@/types/catalog';

const props = defineProps<{
  flavor: FlavorDisplay;
  options: LabelOptions;
}>();

const NAME_FONT = 7;
/** Площадь логотипа «Сармы» в макете, мм². Остальные логотипы приводим к ней,
 *  чтобы широкие и высокие знаки выглядели одинаково весомо. */
const LOGO_AREA = 47;
const LOGO_MAX_H = 5;
const LOGO_MAX_W = 26;
/** Множитель размера отдельных логотипов (по id производителя) поверх выравнивания по площади. */
const LOGO_SCALE: Record<string, number> = {
  // Почти квадратный знак упирается в LOGO_MAX_H и выглядит мельче остальных.
  musthave: 1.4,
};
/** Линейку «Основная» не печатаем — она ничего не говорит о вкусе. */
const MAIN_LINE = /^основная$/i;

/** Кегль имени, мм: ужимаем длинные имена и длинные слова. */
const nameFontMm = computed(() => {
  const name = props.flavor.name;
  const longest = name.split(/\s+/).reduce((m, w) => Math.max(m, w.length), 0);
  let fs = NAME_FONT;
  if (name.length > 18) fs *= Math.sqrt(18 / name.length);
  if (longest > 18) fs = Math.min(fs, (NAME_FONT * 18) / longest);
  return Math.max(3.4, fs);
});

const tags = computed(() =>
  props.options.showProfile ? (props.flavor.profile?.slice(0, 3) ?? []) : [],
);
const showStrength = computed(
  () => props.options.showStrength && typeof props.flavor.strength === 'number',
);
const lineText = computed(() =>
  props.options.showLine && !MAIN_LINE.test(props.flavor.lineName.trim())
    ? props.flavor.lineName
    : '',
);

const logo = computed(() => findLogo(props.flavor.manufacturerId, props.flavor.manufacturerName));
const logoStyle = computed(() => {
  const a = logo.value?.aspect ?? 1;
  let h = Math.min(Math.sqrt(LOGO_AREA / a), LOGO_MAX_H);
  if (h * a > LOGO_MAX_W) h = LOGO_MAX_W / a;
  h *= LOGO_SCALE[props.flavor.manufacturerId] ?? 1;
  return { height: `${h}mm`, width: `${h * a}mm` };
});
</script>

<template>
  <div class="grove">
    <img class="grove__ornament" :src="ornamentUrl" alt="" aria-hidden="true" />
    <div class="grove__main">
      <div class="grove__name" :style="{ fontSize: `${nameFontMm}mm` }">{{ flavor.name }}</div>
      <div v-if="tags.length" class="grove__tags">
        <span v-for="t in tags" :key="t" class="grove__tag">{{ t }}</span>
      </div>
      <StrengthDots v-if="showStrength" class="grove__strength" :strength="flavor.strength ?? 0" />
    </div>
    <div v-if="options.showManufacturer || lineText" class="grove__maker">
      <template v-if="options.showManufacturer">
        <img
          v-if="logo"
          class="grove__logo"
          :src="logo.src"
          :style="logoStyle"
          :alt="flavor.manufacturerName"
        />
        <div v-else class="grove__brand">{{ flavor.manufacturerName }}</div>
      </template>
      <div v-if="lineText" class="grove__line">{{ lineText }}</div>
    </div>
  </div>
</template>

<style scoped>
.grove {
  position: absolute;
  inset: 0;
  font-family: var(--font-grove);
  color: #fff;
}
.grove__ornament {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-select: none;
}
/* Центр блока — на 39% высоты: область 0…78%. */
.grove__main {
  position: absolute;
  top: 0;
  right: 6mm;
  bottom: 22%;
  left: 6mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3mm;
  text-align: center;
}
.grove__name {
  max-width: 96mm;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.grove__tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.4mm;
}
.grove__tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 5mm;
  padding: 0 2.4mm;
  border: 0.15mm solid #fff;
  border-radius: 999px;
  font-size: 2.6mm;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}
/* Крепость: три точки под тегами (StrengthDots), обводка той же толщины, что у тегов. */
.grove__strength {
  margin-top: -1.2mm;
}
.grove__maker {
  position: absolute;
  right: 6mm;
  bottom: 5.5mm;
  left: 6mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.2mm;
  text-align: center;
}
.grove__logo {
  display: block;
}
.grove__brand {
  font-size: 3.4mm;
  font-weight: 800;
  line-height: 1.1;
}
.grove__line {
  font-size: 1.7mm;
  font-weight: 600;
  line-height: 1;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.85);
}
</style>
