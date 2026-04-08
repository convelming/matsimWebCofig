import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      redirect: '/routeplan/index',
    },
    {
      path: '/routeplan',
      name: 'routeplan_layout',
      redirect: '/routeplan/index',
      component: () => import('@/views/MapLayout.vue'),
      children: [
        {
          path: 'index',
          name: 'routeplan_index',
          component: () => import('@/views/routeplan/index.vue'),
        },
      ],
    },
  ],
})

export default router
