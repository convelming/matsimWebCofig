import Vue from "vue";
import Vuex from "vuex";

import dict from "@/store/modules/dict";
import user from "@/store/modules/user";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    dict,
    user,
  },
  getters: {
    dict: (state) => state.dict.dict,
    token: (state) => state.user.token,
    avatar: (state) => state.user.avatar,
    id: (state) => state.user.id,
    name: (state) => state.user.name,
    nickName: (state) => state.user.nickName,
    introduction: (state) => state.user.introduction,
    roles: (state) => state.user.roles,
  },
});

export default store;
