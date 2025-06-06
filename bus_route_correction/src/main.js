import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import language from "@/language/index";

import 'element-ui/lib/theme-chalk/index.css';
import "@/assets/css/style.css";
import "@/assets/css/element.style.scss";

import Pagination from "@/components/Pagination.vue";
import Dialog from "@/components/Dialog.vue";
import TimeRangeSlider from "@/components/TimeRangeSlider.vue";
import TimeSlider from "@/components/TimeSlider.vue";
import RouteSelect from "@/components/RouteSelect.vue";
import Drawer from "@/components/Drawer/index.vue";
import ColorSelect from "@/components/ColorSelect.vue";
import IconSelect from "@/components/IconSelect.vue";
import ColorPicker from "@/components/ColorPicker.vue";
import Tags from "@/components/Tags.vue";
import Clock from "@/components/Clock/index.vue";

// Vue.config.productionTip = false;

Vue.component("Pagination", Pagination);
Vue.component("Dialog", Dialog);
Vue.component("TimeRangeSlider", TimeRangeSlider);
Vue.component("TimeSlider", TimeSlider);
Vue.component("RouteSelect", RouteSelect);
Vue.component("Drawer", Drawer);
Vue.component("ColorSelect", ColorSelect);
Vue.component("IconSelect", IconSelect);
Vue.component("ColorPicker", ColorPicker);
Vue.component("Tags", Tags);
Vue.component("Clock", Clock);
Vue.use(ElementUI);
Vue.use(language);

Vue.config.productionTip = false;

Vue.prototype.isDev = process.env.NODE_ENV === "development";

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
