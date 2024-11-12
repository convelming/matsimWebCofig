<template>
  <Dialog class="SingleSymbol" :title="$l('SingleSymbol')" :visible="s_visible" @close="handleClose" left="center" width="450px">
    <div class="SingleSymbol_body">
      <el-form :model="s_form" ref="form" label-width="120px" :inline="false" size="small" label-position="left">
        <el-form-item :label="$l('Size:')" v-if="layout.includes('size')">
          <el-input-number v-model="s_form.size" :min="0" :step="1" />
        </el-form-item>
        <el-form-item :label="$l('Fill Color:')" v-if="layout.includes('fillColor')">
          <el-color-picker v-model="s_form.fillColor" :predefine="predefineColors" />
        </el-form-item>
        <el-form-item :label="$l('Stroke Color:')" v-if="layout.includes('strokeColor')">
          <el-color-picker v-model="s_form.strokeColor" :predefine="predefineColors" />
        </el-form-item>
        <el-form-item :label="$l('Stroke Style:')" v-if="layout.includes('strokeStyle')">
          <el-select v-model="s_form.strokeStyle">
            <el-option v-for="(v, k) in LINE_STYPE" :key="v" :label="k" :value="v"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$l('Opacity:')" v-if="layout.includes('opacity')">
          <el-slider v-model="s_form.opacity" :step="0.01" :min="0" :max="1" />
        </el-form-item>
        <el-form-item :label="$l('Icon:')" v-if="layout.includes('icon')">
          <IconSelect v-model="s_form.icon" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleConfirm">{{ $l("确定") }}</el-button>
          <el-button @click="handleClose">{{ $l("取消") }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </Dialog>
</template>

<language>
{
  "SingleSymbol":{
    "zh-CN": "单值图",
    "en-US": "Single Symbol"
  },
  "Size:":{
    "zh-CN": "大小：",
    "en-US": "Size:"
  },
  "Fill Color:":{
    "zh-CN": "填充颜色：",
    "en-US": "Fill Color:"
  },
  "Stroke Color:":{
    "zh-CN": "描边颜色：",
    "en-US": "Stroke Color:"
  },
  "Stroke Style:":{
    "zh-CN": "描边样式",
    "en-US": "Stroke Style:"
  },
  "Opacity:":{
    "zh-CN": "透明度：",
    "en-US": "Opacity:"
  },
  "Icon:":{
    "zh-CN": "图标：",
    "en-US": "Icon:"
  },
}
</language>

<script>
import { ICON_LIST, COLOR_LIST } from "@/utils/utils";
import { GeoJSONLayer, LINE_STYPE } from "../layer/GeoJSONLayer";
export default {
  name: "SingleSymbol",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      default: () => ({}),
    },
    layout: {
      type: String,
      default: "size,fillColor,strokeColor,strokeStyle,opacity,icon",
    },
  },
  components: {},
  computed: {},
  watch: {
    visible: {
      handler(val) {
        if (val !== this.s_visible) {
          this.s_visible = val;
        }
        if (val) {
          this.s_form = {
            size: 10,
            fillColor: "#ff0000",
            strokeColor: "#ff0000",
            strokeStyle: LINE_STYPE.SOLID,
            opacity: 1,
            icon: ICON_LIST[0],
            ...(this.form || {}),
          };
        }
      },
      immediate: true,
      deep: true,
    },
  },
  data() {
    return {
      LINE_STYPE: LINE_STYPE,
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_visible: false,
      s_form: {},
    };
  },
  created() {},
  mounted() {},
  methods: {
    handleClose() {
      this.s_visible = false;
      this.$emit("update:visible", this.s_visible);
    },
    handleConfirm() {
      this.$emit("confirm", this.s_form);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-form-item__content {
    text-align: right;
  }
  .el-input-number,
  .el-input,
  .el-select {
    width: 100%;
  }
}
.SingleSymbol {
}
</style>
