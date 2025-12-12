import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

export const demoPage = [
  {
    path: "/demo/page1",
    name: "demopage1",
    title: "无人机拍摄路段3D演示",
    component: () => import(/* webpackChunkName: "demopage1" */ "@/views/demo/page1/index.vue"),
  },
  {
    path: "/demo/page2",
    name: "demopage2",
    title: "低空()",
    component: () => import(/* webpackChunkName: "demopage2" */ "@/views/demo/page2/index2.vue"),
  },
  {
    path: "/demo/page3",
    name: "demopage3",
    title: "低空(新丰县)",
    component: () => import(/* webpackChunkName: "demopage3" */ "@/views/demo/page3/index3.vue"),
  },
  {
    path: "/demo/page4",
    name: "demopage4",
    title: "低空(新丰县-goView项目嵌入页面1)",
    component: () => import(/* webpackChunkName: "demopage4" */ "@/views/demo/page3/index4.vue"),
  },
  {
    path: "/demo/page5",
    name: "demopage5",
    title: "低空(新丰县-地形图测试)",
    component: () => import(/* webpackChunkName: "demopage5" */ "@/views/demo/page3/index5.vue"),
  },
  {
    path: "/demo/page6",
    name: "demopage6",
    title: "低空(新丰县-goView项目嵌入页面2)",
    component: () => import(/* webpackChunkName: "demopage6" */ "@/views/demo/page3/index6.vue"),
  },
  {
    path: "/demo/page7",
    name: "demopage7",
    title: "低空(新丰县-无操作面板)",
    component: () => import(/* webpackChunkName: "demopage7" */ "@/views/demo/page3/index7.vue"),
  },
  {
    path: "/demo/page8",
    name: "demopage8",
    title: "低空(广州)",
    component: () => import(/* webpackChunkName: "demopage8" */ "@/views/demo/page3/index8.vue"),
  },
  {
    path: "/demo/page9",
    name: "demopage9",
    title: "低空(广州)",
    component: () => import(/* webpackChunkName: "demopage9" */ "@/views/demo/page3/index9.vue"),
  },
  {
    path: "/demo/page10",
    name: "demopage10",
    title: "低空(广州)",
    component: () => import(/* webpackChunkName: "demopage10" */ "@/views/demo/page3/index10.vue"),
  },
  {
    path: "/demo/page11",
    name: "demopage11",
    component: () => import(/* webpackChunkName: "demopage11" */ "@/views/demo/page3/index11.vue"),
  },
  {
    path: "/demo/page12",
    name: "demopage12",
    title: "",
    component: () => import(/* webpackChunkName: "demopage12" */ "@/views/demo/page3/index12.vue"),
  },
  {
    path: "/demo/page13",
    name: "demopage13",
    title: "",
    component: () => import(/* webpackChunkName: "demopage13" */ "@/views/demo/page3/index13.vue"),
  },
  {
    path: "/demo/page14",
    name: "demopage14",
    title: "",
    component: () => import(/* webpackChunkName: "demopage14" */ "@/views/demo/page3/index14.vue"),
  },
  {
    path: "/demo/page15",
    name: "demopage15",
    title: "",
    component: () => import(/* webpackChunkName: "demopage15" */ "@/views/demo/page3/index15.vue"),
  },
  {
    path: "/demo/UAVBox",
    name: "demoUAVBox",
    title: "无人机动画测试页面",
    component: () => import(/* webpackChunkName: "demoUAVBox" */ "@/views/demo/page3/UAVBox/index.vue"),
  },
];

const routes = [
  {
    path: "/",
    name: "index",
    component: () => import(/* webpackChunkName: "index" */ "@/views/home/index.vue"),
  },
  {
    path: "/index2",
    name: "index2",
    component: () => import(/* webpackChunkName: "index2" */ "@/views/home2/index.vue"),
  },
  {
    path: "/demo/Menu",
    name: "demoMenu",
    component: () => import(/* webpackChunkName: "demoMenu" */ "@/views/demo/menu.vue"),
  },
  ...demoPage,
];

const router = new VueRouter({
  routes,
});

export default router;
