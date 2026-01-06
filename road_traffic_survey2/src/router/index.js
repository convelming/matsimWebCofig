import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'NoMapLayout',
      redirect: '/home',
      component: () => import('@/views/NoMapLayout.vue'),
      children: [
        {
          path: '/home',
          name: 'home',
          component: () => import('@/views/home/index.vue'),
        },
        {
          path: '/news/detail',
          name: 'NewsDetail',
          component: () => import('@/views/home/News/NewsDetail.vue'),
        },
      ],
    },
    {
      path: '/maplayout',
      name: 'MapLayout',
      redirect: '/upload',
      component: () => import('@/views/MapLayout.vue'),
      children: [
        {
          path: '/upload',
          name: 'upload',
          component: () => import('@/views/upload/index.vue'),
        },
        {
          path: '/download',
          name: 'download',
          component: () => import('@/views/download/index.vue'),
        },
        {
          path: '/feedback',
          name: 'feedback',
          component: () => import('@/views/feedback/index.vue'),
        },
      ],
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

export default router
