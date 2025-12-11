import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { onMounted, nextTick } from 'vue'
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
  scrollBehavior(to, from, savedPosition) {
    console.log('scrollBehavior')
    if (to.query.scroll) {
      // nextTick(() => {
      //   if (to.query.scroll) {
      //     const element = document.querySelector(`#${to.query.scroll}`)
      //     console.log(element)
      //     if (element) {
      //       element.scrollIntoView({ behavior: 'smooth' })
      //     }
      //   }
      // })
      return { top: document.getElementById(to.query.scroll).offsetTop }
    } else {
      return { top: 0 }
    }
  },
})

export default router
