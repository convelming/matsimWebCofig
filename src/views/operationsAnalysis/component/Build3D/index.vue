<template>
  <el-collapse-item class="BusStopForm" :name="name">
    <div class="el-collapse-item__title" slot="title">
      <el-checkbox :value="s_showLayer" @change="handleChangeShowLayer">
        <span>{{ $l("3D建筑") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px;"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("建筑颜色：") }}</div>
        <div class="form_value">
          <el-color-picker :disabled="!s_showLayer" size="mini" :predefine="predefineColors" v-model="buildColor" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("建筑透明度：") }}</div>
        <div class="form_value">
          <el-slider :disabled="!s_showLayer" v-model="buildOpacity" :min="0" :max="1" :step="0.1" />
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "3D建筑":{
    "zh-CN": "3D建筑",
    "en-US": "3DBuilding"
  },
  "建筑颜色：":{
    "zh-CN": "建筑颜色：",
    "en-US": "Building Colors："
  },
  "建筑透明度：":{
    "zh-CN": "建筑透明度：",
    "en-US": "Architectural transparency："
  }
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { Build3DLayer } from "./layer/Build3DLayer";

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
    buildColor(val) {
      if (this._Build3DLayer) {
        this._Build3DLayer.setBuildColor(val);
      }
    },
    buildOpacity(val) {
      if (this._Build3DLayer) {
        this._Build3DLayer.setBuildOpacity(val);
      }
    },
  },
  data() {
    return {
      predefineColors: ["#E9CDAA", "#ff4500", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#409eff", "#c71585"],
      s_showLayer: true,
      buildColor: "#E9CDAA",
      buildOpacity: 0.8,
      _Build3DLayer: null,

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._Build3DLayer = new Build3DLayer({
      buildColor: this.buildColor,
      buildOpacity: this.buildOpacity,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
          this._Build3DLayer.setSelectBuildId(data.pickColorNum);
          this.rootVue.handleShowBuildDetail({
            uuid: data.pickColorNum,
            buildDetail: data,
          });
        },
        [MAP_EVENT.LAYER_LOADING]: ({ data }) => {
          this.loading = data;
        },
      },
    });
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
    this._Build3DLayer.dispose();
  },
  methods: {
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
    },
    // 组件初始化事件
    handleEnable() {
      this.rootVue.$on("setSelectedBuild", (busDetail) => {
        this._Build3DLayer.setSelectBuildId(busDetail.pickColorNum);
      });
      this._Map.addLayer(this._Build3DLayer);
    },
    // 组件卸载事件
    handleDisable() {
      this.rootVue.$off("setSelectedBuild");
      this._Map.removeLayer(this._Build3DLayer);
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
