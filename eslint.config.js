// Flat config (ESLint 10). Стиль (кавычки, точки с запятой, перенос строк) — за Prettier,
// поэтому eslint-config-prettier идёт последним и гасит конфликтующие правила.
import js from '@eslint/js';
import globals from 'globals';
import vue from 'eslint-plugin-vue';
import ts from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default ts.config(
  { ignores: ['dist/**', 'public/data/**'] },

  js.configs.recommended,
  ts.configs.recommended,
  vue.configs['flat/recommended'],

  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        // В .vue разбором <script lang="ts"> занимается парсер TypeScript.
        parser: ts.parser,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  prettier,
);
