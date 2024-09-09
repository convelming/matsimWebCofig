<template>
  <el-select class="IconSelect" v-bind="$attrs" :value="s_value" @input="handleInput" placeholder="请选择" popper-class="IconSelect_popper">
    <img slot="prefix" v-if="s_value !== null || s_value !== undefined" class="IconSelect_option prefix" :src="s_value" alt="" />
    <el-option v-for="(item, index) in iconList" :key="index" :value="item" :label="index">
      <img class="IconSelect_option" :src="item" alt="" />
    </el-option>
  </el-select>
</template>

<script>
import { ICON_LIST } from "@/utils/utils";

export default {
  props: {
    value: {
      type: [String, Number],
      default: "",
    },
    iconList: {
      type: Array,
      default: () => ICON_LIST,
    },
  },
  watch: {
    value: {
      handler(val) {
        this.s_value = val;
      },
      immediate: true,
    },
  },
  data() {
    return {
      s_value: 0,
    };
  },
  methods: {
    handleInput(val) {
      this.$emit("input", val);
      this.$emit("change", {
        value: val,
        colors: this.iconList[val],
      });
    },
  },
};
</script>

<style lang="scss">
.IconSelect {
  position: relative;
  background-color: #e6e6e6;
  .el-input__prefix {
    position: absolute;
    top: 5px;
    left: 10px;
    bottom: 5px;
    right: 35px;
    z-index: 10;
    height: auto;
    transition: unset;
    pointer-events: none;
  }
  &.el-select--mini,
  &.el-select--small {
    .el-input__prefix {
      top: 1px;
      bottom: 1px;
      left: 5px;
      right: 25px;
    }
  }
}
.IconSelect_popper {
  background-color: #dadada;
  .el-select-dropdown__item.hover {
    background-color: #e6e6e6;
    .IconSelect_option {
      background-color: #e6e6e6;
    }
  }
}
.IconSelect_option {
  background-color: #dadada;
  width: 100%;
  height: 100%;
  object-fit: contain;
  margin: auto;
}
</style>
