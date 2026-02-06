import Vue from "vue";
import App from "./App.vue";
import store from "./store.js";
import ElementUI from "element-ui";
import language from "@/language/index";
import "@/components/BeiAnBox/index.js";

import 'element-ui/lib/theme-chalk/index.css';
import "@/assets/css/style.css";
import "@/assets/css/element.style.scss";
import "./style.css";

// Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.use(language);

Vue.config.productionTip = false;

new Vue({
  // router,
  store,
  render: (h) => h(App),
  created() {
    // this.$store.dispatch("initDataBase");
    // setInterval(() => {
    //   this.$store.dispatch("getDataBaseList");
    //   const dataBase = this.$store.getters.dataBase;
    //   if (dataBase) {
    //     this.$store.dispatch("getDataSourceList", dataBase);
    //   }
    // }, 1000 * 60 * 5);
  },
}).$mount("#app");
