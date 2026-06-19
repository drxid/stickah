# Stickah

Генератор печатных наклеек для банок с табаком. Ищешь вкусы → выбираешь размер и дизайн → получаешь готовый лист A4, который можно распечатать или сохранить в PDF.

## Стек

- **Vue 3** (`<script setup>`) + **TypeScript** + **Vite**
- **Pinia** — состояние (каталог / набор / шаблон)
- **vue-router** — мастер из трёх шагов
- **Fuse.js** — поиск с опечатками
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
2. **Шаблон** — выбери размер наклейки и один дизайн (`Clean` / `Holo` / `Mono`), отметь, что показывать.
3. **Печать** — посмотри лист(ы) A4 и нажми «Печать / Сохранить PDF».

## Данные

Каталог лежит в [public/data/catalog.json](public/data/catalog.json) в нормализованном виде
(производитель → линейка → вкус) и **собирается оффлайн-конвейером** в `scripts/`:

```
adapter (источник) → normalize (slug-id, дедуп, акценты) → validate → public/data/catalog.json
```

```bash
npm run catalog:build      # собрать каталог из адаптера (по умолчанию sample)
npm run catalog:validate   # проверить целостность готового catalog.json
```

Сейчас источник — заглушка [scripts/raw/sample.json](scripts/raw/sample.json) через `sampleAdapter`.
Когда появится реальный источник: добавить новый адаптер (`{ id, fetchAll() }`) в
[scripts/adapters](scripts/adapters) и зарегистрировать его в
[scripts/build-catalog.ts](scripts/build-catalog.ts). Приложение менять не нужно.

## Деплой

Пуш в `main` собирает и публикует сайт на GitHub Pages
([workflow](.github/workflows/deploy.yml)). Один раз нужно включить в репозитории
**Settings → Pages → Source: GitHub Actions**. Сайт будет доступен по адресу
`https://drxid.github.io/stickah/` (под этот путь в `vite.config.ts` включается `base`).

## Структура

```
src/
  data/       пресеты размеров и дизайнов (это данные, не хардкод)
  stores/     catalog / selection / template (Pinia)
  features/   search, selection, print (раскладка A4 + наклейки)
  views/      Step1Search / Step2Template / Step3Print
  styles/     tokens.css (дизайн-токены), base.css, print.css
```
