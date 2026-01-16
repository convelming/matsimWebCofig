import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "list",
    component: () => import(/* webpackChunkName: "feedback_list" */ "./view/list.vue"),
  },
  {
    path: "/detail",
    name: "detail",
    component: () => import(/* webpackChunkName: "feedback_detail" */ "./view/detail.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
