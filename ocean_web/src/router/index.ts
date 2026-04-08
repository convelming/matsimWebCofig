import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/routeplan',
    },
    {
      path: '/routeplan',
      name: 'routeplan',
      component: () => import('@/views/routeplan/index.vue'),
    },
  ],
})

export default router
