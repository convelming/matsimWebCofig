import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/assets/css/style.css";
import ElementUI from "element-ui";
import "@/assets/css/element.style.scss";
import language from "@/language/index";

import Pagination from "@/components/Pagination.vue";
import Dialog from "@/components/Dialog.vue";
import TimeRangeSlider from "@/components/TimeRangeSlider.vue";
import TimeSlider from "@/components/TimeSlider.vue";
import RouteSelect from "@/components/RouteSelect.vue";
import Drawer from "@/components/Drawer/index.vue";
import ColorSelect from "@/components/ColorSelect.vue";
import Tags from "@/components/Tags.vue";
import Clock from "@/components/Clock/index.vue";
import Luopan from "@/mymap/components/Luopan/index.vue";

// Vue.config.productionTip = false;

Vue.component("Pagination", Pagination);
Vue.component("Dialog", Dialog);
Vue.component("TimeRangeSlider", TimeRangeSlider);
Vue.component("TimeSlider", TimeSlider);
Vue.component("RouteSelect", RouteSelect);
Vue.component("Drawer", Drawer);
Vue.component("ColorSelect", ColorSelect);
Vue.component("Tags", Tags);
Vue.component("Clock", Clock);
Vue.component("Luopan", Luopan);
Vue.use(ElementUI);
Vue.use(language);

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
