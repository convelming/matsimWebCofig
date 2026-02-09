import Vue from "vue";
import App from "./App.vue";
import router from "./router.js";
import store from "./store.js";
import ElementUI from "element-ui";
import language from "@/language/index";
import "@/components/BeiAnBox/index.js";

import 'element-ui/lib/theme-chalk/index.css';
import "@/assets/css/style.css";
import "@/assets/css/element.style.scss";
import "./style.scss";

import Pagination from "@/components/Pagination.vue";
import Dialog from "@/components/Dialog.vue";
import DialogRight from "@/components/DialogRight.vue";
import TimeRangeSlider from "@/components/TimeRangeSlider.vue";
import TimeSlider from "@/components/TimeSlider.vue";
import RouteSelect from "@/components/RouteSelect.vue";
import Drawer from "@/components/Drawer/index.vue";
import ColorSelect from "@/components/ColorSelect.vue";
import IconSelect from "@/components/IconSelect.vue";
import ColorPicker from "@/components/ColorPicker.vue";
import Tags from "@/components/Tags.vue";
import Clock from "@/components/Clock/index.vue";
import AutoSize from "@/components/AutoSize.vue";

// Vue.config.productionTip = false;

Vue.component("Pagination", Pagination);
Vue.component("Dialog", Dialog);
Vue.component("DialogRight", DialogRight);
Vue.component("TimeRangeSlider", TimeRangeSlider);
Vue.component("TimeSlider", TimeSlider);
Vue.component("RouteSelect", RouteSelect);
Vue.component("Drawer", Drawer);
Vue.component("ColorSelect", ColorSelect);
Vue.component("IconSelect", IconSelect);
Vue.component("ColorPicker", ColorPicker);
Vue.component("Tags", Tags);
Vue.component("Clock", Clock);
Vue.component("AutoSize", AutoSize);
Vue.use(ElementUI);
Vue.use(language);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
  created() {
    this.$store.dispatch("initDataBase");
    setInterval(() => {
      this.$store.dispatch("getDataBaseList");
      const dataBase = this.$store.getters.dataBase;
      if (dataBase) {
        this.$store.dispatch("getDataSourceList", dataBase);
      }
    }, 1000 * 60 * 5);
  },
}).$mount("#app");
