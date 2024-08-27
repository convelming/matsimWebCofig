<template>
  <el-select class="ColorSelect" v-bind="$attrs" :value="s_value" @input="handleInput" placeholder="请选择">
    <div slot="prefix" class="ColorSelect_color_list prefix" v-if="s_value !== null || s_value !== undefined">
      <div class="ColorSelect_color_item" v-for="(color, index2) in colorsList[s_value]" :style="`background-color:${color}`" :key="index2"></div>
    </div>
    <el-option v-for="(item, index) in colorsList" :key="index" :value="index" :label="index">
      <div class="ColorSelect_color_list">
        <div class="ColorSelect_color_item" v-for="(color, index2) in item" :style="`background-color:${color}`" :key="index2"></div>
      </div>
    </el-option>
  </el-select>
</template>

<script>
import { COLOR_LIST } from "@/utils/utils";

export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    colorsList: {
      type: Array,
      default: () => COLOR_LIST,
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
        colors: this.colorsList[val],
      });
    },
  },
};
</script>

<style lang="scss">
.ColorSelect {
  position: relative;
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
      top: 0px;
      bottom: 0px;
    }
  }
}
.ColorSelect_color_list {
  box-sizing: border-box;
  padding: 5px 0;
  display: flex;
  height: 100%;
  .ColorSelect_color_item {
    width: 100%;
    height: 100%;
  }
}
</style>
