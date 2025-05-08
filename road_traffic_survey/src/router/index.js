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
  },
  {
    path: "/demo/page4",
    name: "demopage4",
    component: () => import(/* webpackChunkName: "demopage4" */ "../views/demo/page3/index3.vue"),
  },
  {
    path: "/demo/page5",
    name: "demopage5",
    component: () => import(/* webpackChunkName: "demopage5" */ "../views/demo/page3/index2.vue"),
  },
  {
    path: "/demo/page6",
    name: "demopage6",
    component: () => import(/* webpackChunkName: "demopage6" */ "../views/demo/page3/index4.vue"),
  }
];

const router = new VueRouter({
  routes,
});

export default router;
