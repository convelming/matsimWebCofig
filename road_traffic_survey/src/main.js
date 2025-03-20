import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/assets/css/style.scss";
import ElementUI from "element-ui";
import pagination from "@/components/pagination";
import Dialog from "@/components/Dialog.vue";
import UploadVideo from "@/components/UploadVideo.vue";
import Drawer from "@/components/Drawer/index.vue";

Vue.config.productionTip = false;

Vue.component("pagination", pagination);
Vue.component("Dialog", Dialog);
Vue.component("UploadVideo", UploadVideo);
Vue.component("Drawer", Drawer);
Vue.use(ElementUI);
Vue.prototype.$l = (val) => val;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
