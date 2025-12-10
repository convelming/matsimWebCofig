import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home.vue'),
    },
    {
      path: '/bygk',
      name: 'bygk',
      component: () => import('@/views/bygk.vue'),
    },
    {
      path: '/xwzx',
      name: 'xwzx',
      component: () => import('@/views/xwzx.vue'),
    },
    {
      path: '/xmzs',
      name: 'xmzs',
      component: () => import('@/views/xmzs.vue'),
    },
    {
      path: '/kycg',
      name: 'kycg',
      component: () => import('@/views/kycg.vue'),
    },
    {
      path: '/rczp',
      name: 'rczp',
      component: () => import('@/views/rczp.vue'),
    },
  ],
})

export default router
