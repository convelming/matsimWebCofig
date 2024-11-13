<template>
  <Dialog class="HeatMap" :title="$l('HeatMap')" :visible="s_visible" @close="handleClose" left="center" width="600px">
    <div class="HeatMap_body">
      <el-form :model="s_form" ref="form" label-width="120px" :inline="false" size="small" label-position="left">
        <el-form-item :label="$l('Size:')" v-if="layout.includes('size')">
          <el-input-number v-model="s_form.size" :min="0" :step="1" />
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
  "HeatMap":{
    "zh-CN": "HeatMap",
    "en-US": "HeatMap"
  },
}
</language>

<script>
import { ICON_LIST, COLOR_LIST } from "@/utils/utils";
import { GeoJSONLayer, LINE_STYLE } from "../layer/GeoJSONLayer";
export default {
  name: "HeatMap",
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
            strokeStyle: LINE_STYLE.SOLID,
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
      LINE_STYLE: LINE_STYLE,
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
.HeatMap {
}
</style>