import Vue from "vue";
import Vuex from "vuex";
import app from "@admin/store/modules/app";
import tagsView from "@admin/store/modules/tagsView";
import permission from "@admin/store/modules/permission";
import settings from "@admin/store/modules/settings";

import dict from "@/store/modules/dict";
import user from "@/store/modules/user";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    dict,
    user,
    tagsView,
    permission,
    settings,
  },
  getters: {
    sidebar: (state) => state.app.sidebar,
    size: (state) => state.app.size,
    device: (state) => state.app.device,
    dict: (state) => state.dict.dict,
    visitedViews: (state) => state.tagsView.visitedViews,
    cachedViews: (state) => state.tagsView.cachedViews,
    token: (state) => state.user.token,
    avatar: (state) => state.user.avatar,
    name: (state) => state.user.name,
    introduction: (state) => state.user.introduction,
    roles: (state) => state.user.roles,
    permissions: (state) => state.user.permissions,
    permission_routes: (state) => state.permission.routes,
    topbarRouters: (state) => state.permission.topbarRouters,
    defaultRoutes: (state) => state.permission.defaultRoutes,
    sidebarRouters: (state) => state.permission.sidebarRouters,
  },
});

export default store;
