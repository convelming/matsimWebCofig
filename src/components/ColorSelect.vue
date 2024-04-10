<template>
  <el-select class="ColorSelect" :value="s_value" @input="handleInput" placeholder="请选择">
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
export const ColorList = [
  ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"],
  ["rgb(254, 224, 210)", "rgb(252, 187, 161)", "rgb(252, 146, 114)", "rgb(251, 106, 74)", "rgb(239, 59, 44)", "rgb(203, 24, 29)", "rgb(153, 0, 13)"],
  ["rgb(251, 234, 215)", "rgb(249, 219, 195)", "rgb(247, 212, 175)", "rgb(245, 195, 153)", "rgb(245, 183, 133)", "rgb(241, 165, 102)", "rgb(237, 135, 52)"],
  ["rgb(251, 234, 215)", "rgb(248, 230, 196)", "rgb(247, 212, 175)", "rgb(243, 212, 155)", "rgb(245, 199, 133)", "rgb(241, 185, 102)", "rgb(237, 161, 52)"],
  ["rgb(249, 241, 217)", "rgb(248, 230, 196)", "rgb(245, 225, 177)", "rgb(243, 212, 155)", "rgb(239, 209, 139)", "rgb(235, 197, 108)", "rgb(227, 179, 60)"],
  ["rgb(249, 245, 217)", "rgb(247, 239, 197)", "rgb(245, 233, 177)", "rgb(241, 229, 157)", "rgb(239, 223, 139)", "rgb(235, 215, 108)", "rgb(227, 201, 60)"],
  ["rgb(240, 248, 213)", "rgb(235, 244, 190)", "rgb(222, 237, 169)", "rgb(221, 233, 147)", "rgb(215, 227, 124)", "rgb(205, 221, 92)", "rgb(187, 209, 38)"],
  ["rgb(240, 248, 213)", "rgb(225, 241, 191)", "rgb(222, 237, 169)", "rgb(205, 233, 147)", "rgb(195, 227, 124)", "rgb(181, 221, 92)", "rgb(155, 209, 38)"],
  ["rgb(223, 247, 213)", "rgb(207, 243, 189)", "rgb(193, 239, 169)", "rgb(177, 235, 147)", "rgb(161, 233, 124)", "rgb(137, 227, 92)", "rgb(96, 217, 38)"],
  ["rgb(215, 245, 223)", "rgb(193, 241, 207)", "rgb(173, 235, 191)", "rgb(151, 231, 175)", "rgb(131, 225, 161)", "rgb(100, 219, 137)", "rgb(48, 205, 96)"],
  ["rgb(211, 242, 236)", "rgb(188, 234, 227)", "rgb(171, 229, 211)", "rgb(149, 223, 201)", "rgb(129, 215, 191)", "rgb(106, 209, 179)", "rgb(42, 189, 147)"],
  ["rgb(211, 242, 236)", "rgb(188, 234, 227)", "rgb(163, 227, 223)", "rgb(139, 219, 215)", "rgb(116, 213, 207)", "rgb(82, 201, 195)", "rgb(24, 183, 175)"],
  ["rgb(207, 243, 245)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(135, 223, 231)", "rgb(112, 217, 227)", "rgb(86, 211, 221)", "rgb(16, 191, 207)"],
  ["rgb(211, 240, 246)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(143, 219, 235)", "rgb(119, 207, 229)", "rgb(97, 199, 224)", "rgb(28, 181, 215)"],
  ["rgb(211, 240, 246)", "rgb(186, 233, 242)", "rgb(163, 225, 238)", "rgb(143, 211, 231)", "rgb(119, 207, 229)", "rgb(97, 199, 224)", "rgb(30, 169, 207)"],
  ["rgb(209, 227, 243)", "rgb(185, 211, 237)", "rgb(161, 197, 229)", "rgb(137, 181, 223)", "rgb(108, 165, 215)", "rgb(78, 145, 207)", "rgb(18, 108, 191)"],
];

export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    colorsList: {
      type: Array,
      default: () => [],
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
    cursor: pointer;
    position: absolute;
    top: 5px;
    left: 10px;
    bottom: 5px;
    right: 35px;
    z-index: 10;
    height: auto;
    transition: unset;
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
