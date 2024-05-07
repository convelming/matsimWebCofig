<template>
  <el-collapse-item class="BusStopForm" :name="name">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox :value="s_showLayer" @change="handleChangeShowLayer">{{ $l("线路比对分析") }}</el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("所有修改线路：") }}</div>
        <div class="form_value" style="display: flex; align-items: center">
          <el-switch :disabled="!s_showLayer" v-model="showRoutes1" style="margin-right: 20px" />
          <el-color-picker :disabled="!s_showLayer" :title="$l('修改前线路颜色')" size="mini" :predefine="predefineColors" v-model="routesColor1" style="margin-right: 20px" />
          <el-color-picker :disabled="!s_showLayer" :title="$l('修改后线路颜色')" size="mini" :predefine="predefineColors" v-model="routesColor2" style="margin-right: 20px" />
        </div>
      </div>
      <div class="form_tip">{{ $l("（虚线为修改前线路， 实线为修改后线路）") }}</div>
      <div class="form_item">
        <div class="form_label">{{ $l("受影响线路：") }}</div>
        <div class="form_value" style="display: flex; align-items: center">
          <el-switch :disabled="!s_showLayer" v-model="showRoutes3" style="margin-right: 20px" />
          <el-color-picker :disabled="!s_showLayer" :title="$l('受影响线路颜色')" size="mini" :predefine="predefineColors" v-model="routesColor3" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("受影响站点：") }}</div>
        <div class="form_value" style="display: flex; align-items: center">
          <el-switch :disabled="!s_showLayer" v-model="showStop1" style="margin-right: 20px" />
          <el-color-picker :disabled="!s_showLayer" :title="$l('受影响站点颜色')" size="mini" :predefine="predefineColors" v-model="stopColor1" />
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "线路比对分析":{
    "zh-CN": "线路比对分析",
    "en-US": "线路比对分析"
  },
  "所有修改线路：":{
    "zh-CN": "所有修改线路：",
    "en-US": "所有修改线路："
  },
  "修改前线路颜色":{
    "zh-CN": "修改前线路颜色",
    "en-US": "修改前线路颜色"
  },
  "修改后线路颜色":{
    "zh-CN": "修改后线路颜色",
    "en-US": "修改后线路颜色"
  },
  "（虚线为修改前线路， 实线为修改后线路）":{
    "zh-CN": "（虚线为修改前线路， 实线为修改后线路）",
    "en-US": "（虚线为修改前线路， 实线为修改后线路）"
  },
  "受影响线路：":{
    "zh-CN": "受影响线路：",
    "en-US": "受影响线路："
  },
  "受影响线路颜色":{
    "zh-CN": "受影响线路颜色",
    "en-US": "受影响线路颜色"
  },
  "受影响站点：":{
    "zh-CN": "受影响站点：",
    "en-US": "受影响站点："
  },
  "受影响站点颜色":{
    "zh-CN": "受影响站点颜色",
    "en-US": "受影响站点颜色"
  }
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { LinesLayer } from "./layer/LinesLayer";

export default {
  props: ["name", "showLayer"],
  inject: ["rootVue"], 
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
  },
  watch: {
    showLayer: {
      handler(val) {
        this.s_showLayer = val;
        if (val) {
          this.handleEnable();
        } else {
          this.handleDisable();
        }
      },
    },
  },
  data() {
    return {
      predefineColors: ["#E9CDAA", "#ff4500", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#409eff", "#c71585"],
      s_showLayer: true,

      showRoutes1: true,
      showRoutes3: true,
      showStop1: true,

      routesColor1: "#ff4500",
      routesColor2: "#ff8c00",
      routesColor3: "#ffd700",
      stopColor1: "#90ee90",

      _LinesLayer: null,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._LinesLayer = new LinesLayer({ zIndex: 20 });
  },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      if (this.s_showLayer) {
        this.handleEnable();
      }
    }, 1000);
  },
  beforeDestroy() {
    this.handleDisable();
    this._LinesLayer.dispose();
  },
  methods: {
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {
      this.rootVue.$on("setSelectedBuild", (busDetail) => {
        this._LinesLayer.setSelectBuildId(busDetail.pickColorNum);
      });
      // this._Map.addLayer(this._LinesLayer);
    },
    // 组件卸载事件
    handleDisable() {
      this.rootVue.$off("setSelectedBuild");
      this._Map.removeLayer(this._LinesLayer);
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-slider__marks-text {
    white-space: nowrap;
  }
}
.BusStopForm {
  .el-collapse-item__title {
    padding-left: 10px;
  }
  .form {
    box-sizing: border-box;
    width: 100%;
    padding: 10px 10px 0px 20px;

    .form_item {
      width: 100%;
      display: flex;
      line-height: 40px;
      & + .form_item {
        margin-top: 10px;
      }
      .form_label {
        flex-shrink: 0;
        padding-right: 10px;
      }
      .form_value {
        width: 100%;
      }
    }
    .form_tip {
      font-size: 12px;
      color: #555;
      padding-left: 2em;
      & + .form_item {
        margin-top: 10px;
      }
    }
  }
  .icon_button {
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 10px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    &.active {
      background-color: rgba($color: #409eff, $alpha: 1);
      color: #ffffff;
    }
    &.disabled {
      cursor: no-drop;
    }
    &.icon_stop {
      .img {
        width: 20px;
        height: 20px;
        display: block;
        object-fit: cover;
        padding: 4px;
      }
    }
  }
}
</style>
