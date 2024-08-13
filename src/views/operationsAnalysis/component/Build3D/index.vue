<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('3D建筑')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/Build3D_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/Build3D_icon.png" />
        <span class="item_title">{{ $l("3D建筑") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("建筑颜色：") }}</div>
        <div class="form_value">
          <ColorPicker :disabled="!s_showLayer" size="mini" :predefine="predefineColors" v-model="buildColor" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("建筑透明度：") }}</div>
        <div class="form_value flex-align-center" style="justify-content: end">
          <el-input-number class="my_input_number_1" style="width: 100%; margin: 0 10px" :disabled="!s_showLayer" size="medium" v-model="buildOpacity" :min="0" :max="100" :step="1" step-strictly> </el-input-number>%
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "3D建筑":{
    "zh-CN": "建筑设施",
    "en-US": "Buildings&Facilities"
  },
  "建筑颜色：":{
    "zh-CN": "建筑颜色：",
    "en-US": "Colors"
  },
  "建筑透明度：":{
    "zh-CN": "建筑透明度：",
    "en-US": "Transparency："
  }
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { Build3DLayer } from "./layer/Build3DLayer";

export default {
  props: ["name", "showLayer", "lock2D"],
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
        this._Build3DLayer.setBuildOpacity(Math.round((val / 100) * 100) / 100);
      }
    },
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,
      buildColor: "#626364",
      buildOpacity: 80,
      _Build3DLayer: null,

      loading: false,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this._Build3DLayer = new Build3DLayer({
      buildColor: this.buildColor,
      buildOpacity: this.buildOpacity * 100,
      event: {
        [MAP_EVENT.HANDLE_PICK_LEFT]: ({ data }) => {
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
      this._Map.addLayer(this._Build3DLayer);
    },
    // 组件卸载事件
    handleDisable() {
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

.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
