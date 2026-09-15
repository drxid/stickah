<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.svg" />
    <img src="src/assets/logo.svg" alt="Stickah" width="280" />
  </picture>
</h1>

<p align="center">
  Можно попробовать тут — <b><a href="https://drxid.github.io/stickah/">Stickah</a></b>
</p>

Генератор печатных наклеек для банок с табаком. Ищешь вкусы → выбираешь размер и дизайн → получаешь готовый лист A4, который можно распечатать или сохранить в PDF.Мне

## Стек

- **Vue 3** (`<script setup>`) + **TypeScript** + **Vite**
- **Pinia** — состояние (каталог / набор / шаблон)
- **vue-router** — мастер из трёх шагов
- **MiniSearch** — поиск по названию, бренду и линейке с опечатками, транслитом и исправлением раскладки
- **Lucide** (`@lucide/vue`) — иконки
- Печать через **CSS Paged Media** (`@page` A4) + `window.print()` — «Сохранить как PDF» даёт браузер

## Запуск

```bash
npm install
npm run dev        # дев-сервер
npm run build      # сборка в dist/ (с проверкой типов)
npm run typecheck  # только проверка типов
```

## Как пользоваться

1. **Набор** — найди вкус и нажми «+», чтобы добавить на лист. Можно задать число копий.
2. **Шаблон** — выбери размер наклейки и один дизайн (`Clean` / `Holo` / `Mono` / `Noir` / `Onyx` / `Grove`), отметь, что показывать.
3. **Печать** — посмотри лист(ы) A4 и нажми «Печать / Сохранить PDF».

## Логотипы брендов

Дизайн **Grove** (120×45 мм) ставит на наклейку SVG-логотип производителя из [tobacco_logos/](tobacco_logos).
Файл сопоставляется с производителем по имени без учёта регистра, пробелов и знаков
(`Blackburn.svg` → Black Burn, `Сарма.svg` → Сарма, `Dogma.svg` → id `dogma`), так что новый
логотип достаточно положить в папку. Логотипа нет — бренд пишется текстом.
Имя файла пишется так же, как бренд в каталоге: `Spectrum.svg`, а не `Спектрум.svg`.
Логотипы белые: фон наклейки тёмный.

## Данные

Каталог лежит в [public/data/catalog.json](public/data/catalog.json) в нормализованном виде
(производитель → линейка → вкус) и **собирается оффлайн-конвейером** в `scripts/`:

```
adapter (источник) → normalize (slug-id, дедуп, акценты) → validate → public/data/catalog.json
```

```bash
npm run catalog:build htreviews   # собрать каталог с htreviews.org (топ-58 брендов)
npm run catalog:build             # demo-каталог из заглушки scripts/raw/sample.json
npm run catalog:validate          # проверить целостность готового catalog.json
npm run catalog:overrides         # применить ручные поправки (scripts/overrides.ts) к готовому catalog.json
npm run catalog:add-brand baza    # добавить один бренд с htreviews (slug из адреса), не трогая остальные
npm run catalog:add-brand overdose imperskaya-kola   # только выбранные вкусы бренда (slug вкуса из адреса или название)
```

Текущий каталог собран адаптером **htreviews** ([scripts/adapters/htreviews.ts](scripts/adapters/htreviews.ts)):
58 брендов, ~170 линеек, ~4900 вкусов (имя, оригинал, линейка, крепость, профиль-теги,
акцентный цвет вкуса). Бренды берутся из `GET /getData?action=brands`, вкусы — из
`POST /postData {action:objectByBrand}`. Сколько брендов брать — env `HT_BRANDS` (по умолчанию 58).

Новый источник = новый адаптер (`{ id, fetchAll() }`) в [scripts/adapters](scripts/adapters),
зарегистрированный в [scripts/build-catalog.ts](scripts/build-catalog.ts). Приложение менять не нужно.

## Структура

```
src/
  data/       пресеты размеров и дизайнов (это данные, не хардкод)
  stores/     catalog / selection / template (Pinia)
  features/   search, selection, print (раскладка A4 + наклейки)
  views/      Step1Search / Step2Template / Step3Print
  styles/     tokens.css (дизайн-токены), base.css, print.css
```
