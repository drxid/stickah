import { createRouter, createWebHistory } from 'vue-router'
import { useSelectionStore } from '@/stores/selection'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'search', component: () => import('@/views/Step1Search.vue') },
    { path: '/template', name: 'template', component: () => import('@/views/Step2Template.vue') },
    { path: '/print', name: 'print', component: () => import('@/views/Step3Print.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// Шаги 2 и 3 недоступны с пустым набором.
router.beforeEach((to) => {
  const selection = useSelectionStore()
  if ((to.name === 'template' || to.name === 'print') && selection.count === 0) {
    return { name: 'search' }
  }
  return true
})

export default router
