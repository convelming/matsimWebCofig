import Vue from "vue";
import Vuex from "vuex";
// import language from "./modules/language";
import datasource from "./modules/datasource";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    // language,
    datasource,
  },
});

export default store;
