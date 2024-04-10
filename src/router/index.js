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
    path: "/planAdjustment/:database/:datasource",
    name: "planAdjustment",
    component: () => import(/* webpackChunkName: "planAdjustment" */ "../views/planAdjustment/index.vue"),
  },
  {
    path: "/operationsAnalysis/:database/:datasource",
    name: "operationsAnalysis",
    component: () => import(/* webpackChunkName: "operationsAnalysis" */ "../views/operationsAnalysis/index.vue"),
  },
  {
    path: "/operationsAnalysis/config/:database/:datasource",
    name: "operationsAnalysisConfig",
    component: () => import(/* webpackChunkName: "operationsAnalysisConfig" */ "../views/operationsAnalysis/config/index.vue"),
  },
  {
    path: "/comparativeAnalysis/:database/:datasource",
    name: "comparativeAnalysis",
    component: () => import(/* webpackChunkName: "comparativeAnalysis" */ "../views/comparativeAnalysis/index.vue"),
  },
  {
    path: "/systemEvaluation/:database/:datasource",
    name: "systemEvaluation",
    component: () => import(/* webpackChunkName: "systemEvaluation" */ "../views/systemEvaluation/index.vue"),
  },
  // {
  //   path: "/test",
  //   name: "test",
  //   component: () => import(/* webpackChunkName: "test" */ "../views/test/index.vue"),
  //   children: [
  //     {
  //       path: "testpage1",
  //       name: "testpage1",
  //       component: () => import(/* webpackChunkName: "test" */ "../views/test/testpage1.vue"),
  //     },
  //   ],
  // },
];

const router = new VueRouter({
  routes,
});

export default router;
