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
    path: "/index2",
    name: "index2",
    component: () =>
      import(/* webpackChunkName: "index2" */ "../views/home2/index.vue"),
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
  },
  {
    path: "/demo/page7",
    name: "demopage7",
    component: () => import(/* webpackChunkName: "demopage7" */ "../views/demo/page3/index5.vue"),
  },
  {
    path: "/demo/page8",
    name: "demopage8",
    component: () => import(/* webpackChunkName: "demopage8" */ "../views/demo/page3/index6.vue"),
  },
  {
    path: "/demo/page9",
    name: "demopage9",
    component: () => import(/* webpackChunkName: "demopage9" */ "../views/demo/page3/index7.vue"),
  },
  {
    path: "/demo/page10",
    name: "demopage10",
    component: () => import(/* webpackChunkName: "demopage10" */ "../views/demo/page3/index8.vue"),
  },
  {
    path: "/demo/page11",
    name: "demopage11",
    component: () => import(/* webpackChunkName: "demopage11" */ "../views/demo/page3/index9.vue"),
  },
  {
    path: "/demo/page12",
    name: "demopage12",
    component: () => import(/* webpackChunkName: "demopage12" */ "../views/demo/page3/index10.vue"),
  },
  {
    path: "/demo/page13",
    name: "demopage13",
    component: () => import(/* webpackChunkName: "demopage13" */ "../views/demo/page3/index11.vue"),
  },
  {
    path: "/demo/page14",
    name: "demopage14",
    component: () => import(/* webpackChunkName: "demopage14" */ "../views/demo/page3/index12.vue"),
  },
  {
    path: "/demo/UAVBox",
    name: "demoUAVBox",
    component: () => import(/* webpackChunkName: "demoUAVBox" */ "../views/demo/page3/UAVBox/index.vue"),
  }
];

const router = new VueRouter({
  routes,
});

export default router;
