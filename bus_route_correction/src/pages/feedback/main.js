import Vue from "vue";
import App from "./App.vue";
import ElementUI from "element-ui";
import language from "@/language/index";

import "element-ui/lib/theme-chalk/index.css";
// import "@/assets/css/style.css";
import "@/assets/css/element.style.scss";

import Quill from 'quill';
import "quill/dist/quill.core.css"; // 核心样式
// import "quill/dist/quill.bubble.css"; // 气泡式布局
import "quill/dist/quill.snows.css"; // 类似于雪地或者高对比度的视觉风格

import moment from "moment";

Vue.use(ElementUI);
Vue.use(language);

Vue.prototype.$moment = moment;

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  created() {},
}).$mount("#app");
