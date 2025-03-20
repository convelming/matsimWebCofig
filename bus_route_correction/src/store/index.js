import Vue from "vue";
import Vuex from "vuex";
import datasource from "./modules/datasource";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    datasource,
  },
});

export default store;
