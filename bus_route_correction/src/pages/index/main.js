import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import language from "@/language/index";
import "@/components/BeiAnBox/index.js";

import "element-ui/lib/theme-chalk/index.css";
import "@/assets/css/style.css";
import "@/assets/css/element.style.scss";
import "./style.css";


Vue.use(ElementUI);
Vue.use(language);

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  created() {},
}).$mount("#app");
