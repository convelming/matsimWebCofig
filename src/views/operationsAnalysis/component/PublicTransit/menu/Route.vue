<template>
  <div
    v-show="visible"
    @mousedown.stop
    class="BusStopMenu el-dropdown-menu el-popper el-popper"
    x-placement="bottom-end"
  >
    <div class="el-dropdown-menu__item is-disabled">
      {{ $l("Transit Route") }} {{ route.routeId }}
    </div>
    <div
      v-for="(v, i) in route_menu"
      :key="v.value"
      :class="{ 'el-dropdown-menu__item--divided': i == 0 }"
      class="el-dropdown-menu__item"
      @click="handleCommand({ data: route, command: v.value })"
    >
      {{ v[$l("label")] }}
    </div>
    <div x-arrow="" class="popper__arrow" style="left: 20px"></div>
  </div>
</template>

<language>
{
  "Transit Route":{
    "zh-CN": "交通路线",
    "en-US": "Transit Route"
  },
  // 这个不需要修改
  "label":{
    "zh-CN": "cn_label",
    "en-US": "label"
  },
}
</language>

<script>
import { route_menu } from "../enum";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    route: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      route_menu,
    };
  },
  computed: {},
  mounted() {
    document.body.appendChild(this.$el);
  },
  beforeDestroy() {
    if (this.$el) document.body.removeChild(this.$el);
  },
  methods: {
    handleCommand(data) {
      this.$emit("command", data);
      this.$emit("update:visible", false);
    },
  },
};
</script>

<style lang="scss">
.BusStopMenu {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}
</style>
