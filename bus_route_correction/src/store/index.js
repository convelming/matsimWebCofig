import Vue from "vue";
import Vuex from "vuex";
import datasource from "./modules/datasource";

import dict from "./modules/dict";
import user from "./modules/user";
import getters from "./getters";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    datasource,
    dict,
    user,
  },
  getters,
});

export default store;
