import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "login",
    component: () => import(/* webpackChunkName: "user_login" */ "./views/login.vue"),
  },
  {
    path: "/info",
    name: "info",
    component: () => import(/* webpackChunkName: "user_info" */ "./views/info.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import(/* webpackChunkName: "user_register" */ "./views/register.vue"),
  },
  {
    path: "/forgetPasswork",
    name: "forgetPasswork",
    component: () => import(/* webpackChunkName: "user_forgetPasswork" */ "./views/forgetPasswork.vue"),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
