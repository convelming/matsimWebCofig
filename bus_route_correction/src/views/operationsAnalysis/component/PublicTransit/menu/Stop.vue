<template>
  <div v-show="visible" @mousedown.stop class="BusStopMenu el-dropdown-menu el-popper el-popper" x-placement="bottom-end">
    <template v-if="list.length == 1">
      <div class="el-dropdown-menu__item is-disabled">{{ $l("Stop") }} {{ stopName }}</div>
      <div v-for="(v, i) in one_stop_menu" :key="v.value" :class="{ 'el-dropdown-menu__item--divided': i == 0 }" class="el-dropdown-menu__item" @click="handleCommandOne({ data: {}, command: v.value })">{{ v[$l("label")] }}</div>
    </template>
    <template v-else-if="list.length >= 2">
      <div class="el-dropdown-menu__item is-disabled">{{ list.length }} {{ $l("stops selected") }}</div>
      <div v-for="(v, i) in many_stop_menu" :key="v.value" :class="{ 'el-dropdown-menu__item--divided': i == 0 }" class="el-dropdown-menu__item" @click="handleCommandMany({ data: {}, command: v.value })">{{ v[$l("label")] }}</div>
    </template>
    <div x-arrow="" class="popper__arrow" style="left: 20px"></div>
  </div>
</template>

<language>
{
  "Stop":{
    "zh-CN": "站点",
    "en-US": "Stop"
  },
  "stops selected":{
    "zh-CN": "选择站点",
    "en-US": "stops selected"
  },
  // 这个不需要修改
  "label":{
    "zh-CN": "cn_label",
    "en-US": "label"
  },
}
</language>

<script>
import { one_stop_menu, many_stop_menu } from "../enum";
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    list: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      stopName: "",
      one_stop_menu,
      many_stop_menu,
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
    handleCommandOne(data) {
      this.$emit("commandOne", data);
      this.$emit("update:visible", false);
    },
    handleCommandMany(data) {
      this.$emit("commandMany", data);
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
