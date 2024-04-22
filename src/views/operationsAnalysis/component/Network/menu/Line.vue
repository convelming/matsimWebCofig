<template>
  <div v-show="visible" @mousedown.stop class="BusStopMenu el-dropdown-menu el-popper el-popper" x-placement="bottom-end">
    <!-- <div class="el-dropdown-menu__item is-disabled">{{ $l("Transit Route") }} {{ route.routeId }}</div> -->
    <div v-for="v in menu_list" :key="v.value" class="el-dropdown-menu__item" @click="handleCommand({ data: menuData, command: v.value })">
      {{ $l(v.label) }}
    </div>
    <div x-arrow="" class="popper__arrow" style="left: 20px"></div>
  </div>
</template>

<language>
{
  "selectLinkAnalysis":{
    "zh-CN": "Select Link Analysis",
    "en-US": "Select Link Analysis"
  },
  "linkVolumes":{
    "zh-CN": "Link Volumes",
    "en-US": "Link Volumes"
  },
}
</language>

<script>
export const line_menu = [
  { label: "selectLinkAnalysis", value: "selectLinkAnalysis" },
  { label: "linkVolumes", value: "linkVolumes" },
];

export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    menuData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      menu_list: line_menu,
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
