import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "index",
    component: () => import(/* webpackChunkName: "index" */ "../views/index.vue"),
  },
  {
    // 线路方案调整
    path: "/planAdjustment/:database/:datasource",
    name: "planAdjustment",
    component: () => import(/* webpackChunkName: "planAdjustment" */ "../views/planAdjustment/index.vue"),
  },
  {
    // 公交运行分析
    path: "/operationsAnalysis/:database/:datasource",
    name: "operationsAnalysis",
    component: () => import(/* webpackChunkName: "operationsAnalysis" */ "../views/operationsAnalysis/index.vue"),
  },
  {
    // 公交运行分析配置
    path: "/operationsAnalysis/config/:database/:datasource",
    name: "operationsAnalysisConfig",
    component: () => import(/* webpackChunkName: "operationsAnalysisConfig" */ "../views/operationsAnalysis/config/index.vue"),
  },
  {
    // 方案对比分析
    path: "/comparativeAnalysis/:database1/:datasource1/:database2/:datasource2",
    name: "comparativeAnalysis",
    component: () => import(/* webpackChunkName: "comparativeAnalysis" */ "../views/comparativeAnalysis/index.vue"),
  },
  {
    // 公交系统评估
    path: "/systemEvaluation/:database/:datasource",
    name: "systemEvaluation",
    component: () => import(/* webpackChunkName: "systemEvaluation" */ "../views/systemEvaluation/index.vue"),
  },
];

// if (process.env.NODE_ENV == "development") {
  routes.push({
    path: "/test",
    name: "test",
    component: () => import(/* webpackChunkName: "test" */ "../views/test/index.vue"),
    children: [
      {
        path: "testpage1",
        name: "testpage1",
        component: () => import(/* webpackChunkName: "test" */ "../views/test/testpage1.vue"),
      },
      {
        path: "testpage2",
        name: "testpage2",
        component: () => import(/* webpackChunkName: "test" */ "../views/test/testpage2.vue"),
      },
    ],
  });
// }

const router = new VueRouter({
  routes,
});

export default router;
