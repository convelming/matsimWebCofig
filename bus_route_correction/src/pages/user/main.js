import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import language from "@/language/index";
import router from "./router.js";
import store from "./store.js";
import "@/components/BeiAnBox/index.js";

import "element-ui/lib/theme-chalk/index.css";
import "@/assets/css/style.css";
import "@/assets/css/element.style.scss";

import moment from "moment";

Vue.use(ElementUI);
Vue.use(language);

Vue.prototype.$moment = moment;

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
  created() {},
}).$mount("#app");
