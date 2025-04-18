import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "index",
    component: () =>
      import(/* webpackChunkName: "index" */ "../views/home/index.vue"),
  },
  {
    path: "/demo/page1",
    name: "demopage1",
    component: () => import(/* webpackChunkName: "demopage1" */ "../views/demo/page1/index.vue"),
  },
  {
    path: "/demo/page2",
    name: "demopage2",
    component: () => import(/* webpackChunkName: "demopage2" */ "../views/demo/page2/index.vue"),
  },
  {
    path: "/demo/page3",
    name: "demopage3",
    component: () => import(/* webpackChunkName: "demopage3" */ "../views/demo/page3/index.vue"),
  }
];

const router = new VueRouter({
  routes,
});

export default router;
