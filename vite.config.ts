import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// base: '/stickah/' нужен для деплоя на GitHub Pages (project site).
// Для локальной разработки это не мешает.
export default defineConfig({
  base: process.env.GH_PAGES ? '/stickah/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
