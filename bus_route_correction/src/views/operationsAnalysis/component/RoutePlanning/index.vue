<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('RoutePlanning')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon" v-show="s_showLayer" src="@/assets/image/road_network_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_network_icon.png" />
        <span class="item_title">{{ $l("RoutePlanning") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("是否显示起降点：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showPoint"  @change="handleEmitOption"></el-switch>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("起降点大小：") }}</div>
        <div class="form_value">
          <el-slider style="padding: 0 calc(2em - 10px)" :disabled="!s_showLayer" v-model="pointSize" :min="0" :max="20" :step="0.1" @change="handleEmitOption"></el-slider>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("起降点颜色：") }}</div>
        <div class="form_value">
          <ColorPicker :disabled="!s_showLayer" :title="$l('公交站点颜色')" size="mini" :predefine="predefineColors" v-model="pointColor" @change="handleEmitOption" />
        </div>
      </div>
      <!-- <div class="form_item">
        <div class="form_label">{{ $l("是否显示航路：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="selectStop" @change="handleSelectStop"></el-switch>
        </div>
      </div> -->
      <div class="form_item">
        <div class="form_label">{{ $l("是否显示划设路线：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="selectStop" @change="handleSelectStop"></el-switch>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "RoutePlanning":{
    "zh-CN": "航路自动划设",
    "en-US": "Route Planning"
  },
  "是否显示起降点：":{
    "zh-CN": "是否显示起降点：",
    "en-US": "是否显示起降点："
  },
  "起降点大小：":{
    "zh-CN": "起降点大小：",
    "en-US": "起降点大小："
  },
  "起降点颜色：":{
    "zh-CN": "起降点颜色：",
    "en-US": "起降点颜色："
  },
  "是否显示划设路线：":{
    "zh-CN": "是否显示划设路线：",
    "en-US": "是否显示划设路线："
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap";
import { COLOR_LIST } from "@/utils/utils";

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
        this.handleEmitOption();
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
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,

      colors: 0,
      width: 1,
      offset: 0,
      color: "#E9CDAA",
      showNode: false,
      canSelect: false,

      colorsList: COLOR_LIST,

      loading: false,

      showPoint: true,
      pointColor: "#ff0000",
      pointSize: 2,

      showNetwork: true,
      showRoute: true,
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this.rootVue.$on("RoutePlanning_Get_Options", (data) => {
      this.handleEmitOption();
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
  },
  methods: {
    handleEmitOption() {
      this.rootVue.$emit("RoutePlanning_Options", {
        showLayer: this.s_showLayer,

        showPoint: this.showPoint,
        pointColor: this.pointColor,
        pointSize: this.pointSize,

        showNetwork: this.showNetwork,
        showRoute: this.showRoute,
      });
    },
    // 组件初始化事件
    handleEnable() {},
    // 组件卸载事件
    handleDisable() {},
    handleChangeShowLayer(value) {
      this.s_showLayer = value;
      this.$emit("update:showLayer", value);
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

.my_collapse_item {
}
.flex-align-center {
  display: flex;
  align-items: center;
}
</style>
