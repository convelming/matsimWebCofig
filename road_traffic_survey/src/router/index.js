import Vue from "vue";
import VueRouter from "vue-router";


Vue.use(VueRouter);

export const demoPage = [
  {
    path: "/demo/page1",
    name: "demopage1",
    component: () => import(/* webpackChunkName: "demopage1" */ "@/views/demo/page1/index.vue"),
    menu: {
      title: "无人机拍摄路段3D演示",
    },
  },
  {
    path: "/demo/page2",
    name: "demopage2",
    component: () => import(/* webpackChunkName: "demopage2" */ "@/views/demo/page2/index2.vue"),
    menu: {
      title: "低空()",
    },
  },
  {
    path: "/demo/page3",
    name: "demopage3",
    component: () => import(/* webpackChunkName: "demopage3" */ "@/views/demo/page3/index3.vue"),
    menu: {
      title: "低空(新丰县)",
    },
  },
  {
    path: "/demo/page4",
    name: "demopage4",
    component: () => import(/* webpackChunkName: "demopage4" */ "@/views/demo/page3/index4.vue"),
    menu: {
      title: "低空(新丰县-goView项目嵌入页面1)",
    },
  },
  {
    path: "/demo/page5",
    name: "demopage5",
    component: () => import(/* webpackChunkName: "demopage5" */ "@/views/demo/page3/index5.vue"),
    menu: {
      title: "低空(新丰县-地形图测试)",
    },
  },
  {
    path: "/demo/page6",
    name: "demopage6",
    component: () => import(/* webpackChunkName: "demopage6" */ "@/views/demo/page3/index6.vue"),
    menu: {
      title: "低空(新丰县-goView项目嵌入页面2)",
    },
  },
  {
    path: "/demo/page7",
    name: "demopage7",
    component: () => import(/* webpackChunkName: "demopage7" */ "@/views/demo/page3/index7.vue"),
    menu: {
      title: "低空(新丰县-无操作面板)",
    },
  },
  {
    path: "/demo/page8",
    name: "demopage8",
    component: () => import(/* webpackChunkName: "demopage8" */ "@/views/demo/page3/index8.vue"),
    menu: {
      title: "低空(广州-固定加载项目里面的数据文件)",
    },
  },
  {
    path: "/demo/page9",
    name: "demopage9",
    component: () => import(/* webpackChunkName: "demopage9" */ "@/views/demo/page3/index9.vue"),
    menu: {
      title: "低空(动态加载数据包ZIP)",
    },
  },
  {
    path: "/demo/page10",
    name: "demopage10",
    component: () => import(/* webpackChunkName: "demopage10" */ "@/views/demo/page3/index10.vue"),
    menu: {
      title: "低空(同page9)",
    },
  },
  {
    path: "/demo/page11",
    name: "demopage11",
    component: () => import(/* webpackChunkName: "demopage11" */ "@/views/demo/page3/index11.vue"),
    menu: {
      title: "广州市低空无人机航路规划",
    },
  },
  {
    path: "/demo/page12",
    name: "demopage12",
    component: () => import(/* webpackChunkName: "demopage12" */ "@/views/demo/page3/index12.vue"),
    menu: {
      title: "风场测试页面",
    },
  },
  {
    path: "/demo/page13",
    name: "demopage13",
    component: () => import(/* webpackChunkName: "demopage13" */ "@/views/demo/page3/index13.vue"),
    menu: {
      title: "类鸟群测试页面",
    },
  },
  {
    path: "/demo/page14",
    name: "demopage14",
    component: () => import(/* webpackChunkName: "demopage14" */ "@/views/demo/page3/index14.vue"),
    menu: {
      title: "查看GeoJson文件",
    },
  },
  {
    path: "/demo/page15",
    name: "demopage15",
    component: () => import(/* webpackChunkName: "demopage15" */ "@/views/demo/page3/index15.vue"),
    menu: {
      title: "GeoJson点根据st和et生成立柱",
    },
  },
  {
    path: "/demo/UAVBox",
    name: "demoUAVBox",
    component: () => import(/* webpackChunkName: "demoUAVBox" */ "@/views/demo/page3/UAVBox/index.vue"),
    menu: {
      title: "无人机动画测试页面",
    },
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
