import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "",
    name: "index",
    component: () => import(/* webpackChunkName: "pt_home" */ "./views/index.vue"),
  },
  {
    // 线路方案调整
    path: "/planAdjustment/:database/:datasource",
    name: "planAdjustment",
    component: () => import(/* webpackChunkName: "pt_planAdjustment" */ "./views/planAdjustment/index.vue"),
  },
  {
    // 公交运行分析
    path: "/operationsAnalysis/:database/:datasource",
    name: "operationsAnalysis",
    component: () => import(/* webpackChunkName: "pt_operationsAnalysis" */ "./views/operationsAnalysis/index.vue"),
  },
  {
    // 公交运行分析配置
    path: "/operationsAnalysis/config/:database/:datasource",
    name: "operationsAnalysisConfig",
    component: () => import(/* webpackChunkName: "pt_operationsAnalysisConfig" */ "./views/operationsAnalysis/config/index.vue"),
  },
  {
    // 公交运行分析配置
    path: "/operationsAnalysis/config2/:database/:datasource",
    name: "operationsAnalysisConfig",
    component: () => import(/* webpackChunkName: "pt_operationsAnalysisConfig" */ "./views/operationsAnalysis/config/index2.vue"),
  },
  {
    // 方案对比分析
    path: "/comparativeAnalysis/:database1/:datasource1/:database2/:datasource2",
    name: "comparativeAnalysis",
    component: () => import(/* webpackChunkName: "pt_comparativeAnalysis" */ "./views/comparativeAnalysis/index.vue"),
  },
  {
    // 公交系统评估
    path: "/systemEvaluation/:database/:datasource",
    name: "systemEvaluation",
    component: () => import(/* webpackChunkName: "pt_systemEvaluation" */ "./views/systemEvaluation/index.vue"),
  },
  {
    path: "/demo/page1",
    name: "demopage1",
    component: () => import(/* webpackChunkName: "pt_demo" */ "./views/demo/page1/index.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
