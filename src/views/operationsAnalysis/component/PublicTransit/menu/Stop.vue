<template>
  <div
    v-show="visible"
    @mousedown.stop
    class="BusStopMenu el-dropdown-menu el-popper el-popper"
    x-placement="bottom-end"
  >
    <template v-if="list.length == 1">
      <div class="el-dropdown-menu__item is-disabled">
        {{ $l("Stop") }} {{ stopName }}
      </div>
      <div
        v-for="(v, i) in one_stop_menu"
        :key="v.value"
        :class="{ 'el-dropdown-menu__item--divided': i == 0 }"
        class="el-dropdown-menu__item"
        @click="handleCommandOne({ data: {}, command: v.value })"
      >
        {{ $l(v.label) }}
      </div>
    </template>
    <template v-else-if="list.length >= 2">
      <div class="el-dropdown-menu__item is-disabled">
        {{ list.length }} {{ $l("stops selected") }}
      </div>
      <div
        v-for="(v, i) in many_stop_menu"
        :key="v.value"
        :class="{ 'el-dropdown-menu__item--divided': i == 0 }"
        class="el-dropdown-menu__item"
        @click="handleCommandMany({ data: {}, command: v.value })"
      >
        {{ $l(v.label) }}
      </div>
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
  "Copy Id":{
    "zh-CN": "复制编号",
    "en-US": "Copy Id"
  },
  "Copy Name":{
    "zh-CN": "复制名称",
    "en-US": "Copy Name"
  },
  "Copy Link Id":{
    "zh-CN": "复制路线编号",
    "en-US": "Copy Link Id"
  },
  "Transit Stop Details":{
    "zh-CN": "中转站详情",
    "en-US": "Transit Stop Details"
  },
  "Stop Load...":{
    "zh-CN": "站点加载...",
    "en-US": "Stop Load..."
  },
  "Transfers At Stop...":{
    "zh-CN": "中转站...",
    "en-US": "Transfers At Stop..."
  },
  "Passengers At Stop":{
    "zh-CN": "停靠站点的乘客",
    "en-US": "Passengers At Stop"
  },
  "stops selected":{
    "zh-CN": "选择站点",
    "en-US": "stops selected"
  },
  "Copy Name":{
    "zh-CN": "复制名称",
    "en-US": "Copy Name"
  },
  "Copy Link Id":{
    "zh-CN": "复制路线编号",
    "en-US": "Copy Link Id"
  },
  "Transit Stop Details":{
    "zh-CN": "中转站详情",
    "en-US": "Transit Stop Details"
  },
  "Stop Load...":{
    "zh-CN": "站点加载...",
    "en-US": "Stop Load..."
  },
  "Transfers At Stop...":{
    "zh-CN": "中转站...",
    "en-US": "Transfers At Stop..."
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
