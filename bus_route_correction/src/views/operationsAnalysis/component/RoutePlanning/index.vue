<template>
  <el-collapse-item class="my_collapse_item" :name="name" :class="{ active: s_showLayer }">
    <div class="el-collapse-item__title" slot="title" :title="$l('RoutePlanning')">
      <el-checkbox class="checkbox" :value="s_showLayer" @change="handleChangeShowLayer">
        <img class="item_icon active" v-show="s_showLayer" src="@/assets/image/road_network_icon_a.png" />
        <img class="item_icon" v-show="!s_showLayer" src="@/assets/image/road_network_icon.png" />
        <span class="item_title">{{ $l("RoutePlanning") }}</span>
        <span v-if="loading" class="el-icon-loading" style="margin-left: 10px"></span>
      </el-checkbox>
    </div>
    <div class="form">
      <div class="form_item">
        <div class="form_label">{{ $l("是否显示起降点：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showPoint" @change="handleEmitOption"></el-switch>
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
          <ColorPicker :disabled="!s_showLayer" size="mini" :predefine="predefineColors" v-model="pointColor" @change="handleEmitOption" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("是否显示划设路线：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showRoute" @change="handleEmitOption"></el-switch>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("划设路线颜色：") }}</div>
        <div class="form_value">
          <ColorPicker :disabled="!s_showLayer" size="mini" :predefine="predefineColors" v-model="routeColor" @change="handleEmitOption" />
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("划设路线大小：") }}</div>
        <div class="form_value">
          <el-slider style="padding: 0 calc(2em - 10px)" :disabled="!s_showLayer" v-model="routeSize" :min="0" :max="20" :step="0.1" @change="handleEmitOption"></el-slider>
        </div>
      </div>

      <div class="form_item">
        <div class="form_label">{{ $l("是否显示航路：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showNetwork" @change="handleChangeNetwork"></el-switch>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("是否显示航路区域：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showFlyableArea" @change="handleChangeNetwork"></el-switch>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("航路类型：") }}</div>
        <div class="form_value">
          <el-select v-model="networkMode" :disabled="!s_showLayer" size="small" multiple @change="handleChangeNetwork">
            <el-option v-for="value in networkModeList" :label="value" :value="value" :key="value" />
          </el-select>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("航路高度：") }}</div>
        <div class="form_value">
          <el-select v-model="networkHeight" :disabled="!s_showLayer" size="small" multiple @change="handleChangeNetwork">
            <el-option v-for="value in networkHeightList" :label="value" :value="value" :key="value" />
          </el-select>
        </div>
      </div>

      <div class="form_item">
        <div class="form_label">{{ $l("航路大小：") }}</div>
        <div class="form_value">
          <el-slider style="padding: 0 calc(2em - 10px)" :disabled="!s_showLayer" v-model="networkSize" :min="0" :max="20" :step="0.1" @change="handleEmitOption"></el-slider>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("航路颜色：") }}</div>
        <div class="form_value">
          <el-table class="small my_tabel" :data="tableList" border stripe>
            <el-table-column prop="color" label="color" width="60">
              <template slot-scope="{ row }">
                <el-color-picker style="display: block" v-model="row.color" size="small" :show-alpha="false" @change="handleChangeNetworkColor(row)"></el-color-picker>
              </template>
            </el-table-column>
            <el-table-column prop="label" label="label"> </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="form_item">
        <div class="form_label">{{ $l("无人机大小：") }}</div>
        <div class="form_value">
          <el-slider style="padding: 0 calc(2em - 10px)" :disabled="!s_showLayer" v-model="uavSize" :min="0" :max="20" :step="0.1" @change="handleEmitOption"></el-slider>
        </div>
      </div>
      <div class="form_item">
        <div class="form_label">{{ $l("是否查看无人机飞行视角：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="showUAVPage" @change="handleEmitOption"></el-switch>
        </div>
      </div>

      <div class="form_item">
        <div class="form_label">{{ $l("是否跟随无人机飞行：") }}</div>
        <div class="form_value">
          <el-switch :disabled="!s_showLayer" v-model="lockUAV" @change="handleEmitOption"></el-switch>
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
  "是否显示航路：":{
    "zh-CN": "是否显示航路：",
    "en-US": "是否显示航路："
  },
  "是否显示航路区域：":{
    "zh-CN": "是否显示航路区域：",
    "en-US": "是否显示航路区域："
  },
  "航路类型：":{
    "zh-CN": "航路类型：",
    "en-US": "航路类型："
  },
  "航路高度：":{
    "zh-CN": "航路高度：",
    "en-US": "航路高度："
  },
  "航路颜色：":{
    "zh-CN": "航路颜色：",
    "en-US": "航路颜色："
  },
  "划设路线颜色：":{
    "zh-CN": "划设路线颜色：",
    "en-US": "划设路线颜色："
  },
  "划设路线大小：":{
    "zh-CN": "划设路线大小：",
    "en-US": "划设路线大小："
  },
  "航路大小：":{
    "zh-CN": "航路大小：",
    "en-US": "航路大小："
  },
  "是否查看无人机飞行视角：":{
    "zh-CN": "是否查看无人机飞行视角：",
    "en-US": "是否查看无人机飞行视角："
  },
  "是否跟随无人机飞行：":{
    "zh-CN": "是否跟随无人机飞行：",
    "en-US": "是否跟随无人机飞行："
  },
  "无人机大小：":{
    "zh-CN": "无人机大小：",
    "en-US": "无人机大小："
  },
}
</language>

<script>
import { getNetworkModes } from "@/api/index";
import { MAP_EVENT } from "@/mymap";
import { COLOR_LIST } from "@/utils/utils";

import { NetworkLayer } from "./layer/NetworkLayer.js";
import { FlyableAreaLayer } from "./layer/FlyableAreaLayer";

export default {
  props: ["name", "showLayer", "lock2D"],
  inject: ["rootVue"],
  components: {},
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
    tableList() {
      let list = Object.values(this.Layer_Map);
      return list;
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
    networkSize: {
      handler(val) {
        Object.values(this.Layer_Map).forEach((v) => {
          Object.values(v.NetworkLayer_Map).forEach((v2) => {
            v2._NetworkLayer.setLineWidth(val);
          });
        });
      },
    },
  },
  data() {
    return {
      configKey: "routePlanningConfig",

      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      s_showLayer: true,

      colorsList: COLOR_LIST,

      loading: false,

      showPoint: true,
      pointSize: 1.5,
      pointColor: "#FF6161",

      showRoute: true,
      routeSize: 5,
      routeColor: "#409BFC",

      showNetwork: false,
      showFlyableArea: false,
      networkMode: [],
      networkModeList: [],
      networkHeight: ["60~120"],
      networkHeightList: ["0~60", "60~120", "120~300", "300~600", "600~1200"],
      // 60-120米的默认颜色#4ECBA8，120-300米的颜色#27BAB5，300-600米的颜色337FA8，600-1200的颜色4264A7 @曾任
      networkHeightColors: ["#4ECB78", "#4ECBA8", "#27BAB5", "#337FA8", "#4264A7"],
      colorsList: COLOR_LIST,
      networkSize: 5,

      showUAVPage: false,
      lockUAV: false,
      uavSize: 3,
      Layer_Map: {},
    };
  },
  created() {
    this.s_showLayer = this.showLayer;
    this.rootVue.$on("RoutePlanning_Get_Options", (data) => {
      if (data) {
        for (const key in data) {
          this[key] = data[key];
        }
      } else {
        this.handleEmitOption();
      }
    });
    getNetworkModes().then((res) => {
      this.networkModeList = res.data;
    });
    // this._NetworkLayer = new NetworkLayer({
    //   modes: "undefined",
    // });
  },
  mounted() {
    this._interval = setInterval(() => {
      if (!this._Map) return;
      clearInterval(this._interval);
      if (this.s_showLayer) {
        this.handleEnable();
      }
    }, 1000);
    this.handleChangeNetwork();
  },
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    initByConfig(config) {
      config = config || this.rootVue.defaultConfig.RoutePlanningConfig;
      this.s_showLayer = config.showLayer;
      this.$emit("update:showLayer", config.showLayer);
      this.$emit("update:lock2D", config.lock2D);

      this.showPoint = config.showPoint;
      this.pointColor = config.pointColor;
      this.pointSize = config.pointSize;

      this.showRoute = config.showRoute;
      this.routeSize = config.routeSize;
      this.routeColor = config.routeColor;

      this.showNetwork = config.showNetwork;
      this.showFlyableArea = config.showFlyableArea;
      this.networkSize = config.networkSize;
      this.networkHeightColors = config.networkHeightColors;
      for (let i = 0; i < this.tableList.length; i++) {
        const row = this.tableList[i];
        this.handleChangeNetworkColor({ ...row, color: this.networkHeightColors[i] });
      }

      this.showUAVPage = config.showUAVPage;
      this.lockUAV = config.lockUAV;
      this.uavSize = config.uavSize;
    },
    async exportConfig() {
      return {
        showPoint: this.showPoint,
        pointColor: this.pointColor,
        pointSize: this.pointSize,

        showRoute: this.showRoute,
        routeSize: this.routeSize,
        routeColor: this.routeColor,

        showNetwork: this.showNetwork,
        showFlyableArea: this.showFlyableArea,
        networkSize: this.networkSize,

        networkHeightColors: this.networkHeightColors,

        showUAVPage: this.showUAVPage,
        lockUAV: this.lockUAV,
        uavSize: this.uavSize,
      };
    },
    handleChangeNetworkColor(row) {
      const height = row.label;
      const color = row.color;
      const item = this.Layer_Map[height];
      const index = this.networkHeightList.indexOf(height);
      this.networkHeightColors[index] = color;
      Object.values(item.NetworkLayer_Map).forEach((v) => {
        v._NetworkLayer.setColors({
          0: color,
          1: color,
        });
      });
    },
    handleChangeNetwork() {
      Object.values(this.Layer_Map).forEach((v) => {
        v.show = false;
        Object.values(v.NetworkLayer_Map).forEach((v2) => {
          v2.show = false;
        });
      });
      for (let i = 0, l = this.networkHeightList.length; i < l; i++) {
        const height = this.networkHeightList[i];
        let item1 = this.Layer_Map[height];
        const [minh, maxh] = height.split("~");
        if (!item1) {
          item1 = {
            show: false,
            label: height,
            color: this.networkHeightColors[i],
            _FlyableAreaLayer: new FlyableAreaLayer({
              color: this.networkHeightColors[i],
              minh: minh,
              maxh: maxh,
            }),
            NetworkLayer_Map: {},
          };
          // this.Layer_Map[height] = item1;
          this.$set(this.Layer_Map, height, item1);
        }
        item1.show = this.networkHeight.includes(height);
        if (item1.show) {
          for (const mode of this.networkMode) {
            let item2 = item1.NetworkLayer_Map[mode];
            if (!item2) {
              item2 = {
                show: false,
                label: mode,
                _NetworkLayer: new NetworkLayer({
                  colors: {
                    0: item1.color,
                    1: item1.color,
                  },
                  modes: mode,
                  minh: minh,
                  maxh: maxh,
                  lineWidth: this.networkSize,
                }),
              };
              this.$set(item1.NetworkLayer_Map, mode, item2);
              // item1.NetworkLayer_Map[mode] = item2;
            }
            item2.show = true;
          }
        }
      }

      Object.values(this.Layer_Map).forEach((v) => {
        if (v.show && this.showFlyableArea) {
          this._Map.addLayer(v._FlyableAreaLayer);
        } else {
          v._FlyableAreaLayer.removeFromParent();
        }

        Object.values(v.NetworkLayer_Map).forEach((v2) => {
          if (v2.show && this.showNetwork) {
            this._Map.addLayer(v2._NetworkLayer);
          } else {
            v2._NetworkLayer.removeFromParent();
          }
        });
      });
    },
    handleEmitOption() {
      this.rootVue.$emit("RoutePlanning_Options", {
        showLayer: this.s_showLayer,

        showPoint: this.showPoint,
        pointColor: this.pointColor,
        pointSize: this.pointSize,

        showRoute: this.showRoute,
        routeSize: this.routeSize,
        routeColor: this.routeColor,

        showNetwork: this.showNetwork,
        showFlyableArea: this.showFlyableArea,
        networkMode: this.networkMode,
        networkModeList: this.networkModeList,
        networkSize: this.networkSize,

        showUAVPage: this.showUAVPage,
        lockUAV: this.lockUAV,
        uavSize: this.uavSize,
      });
    },
    // 组件初始化事件
    handleEnable() {},
    // 组件卸载事件
    handleDisable() {
      Object.values(this.Layer_Map).forEach((v) => {
        v._FlyableAreaLayer.dispose();
        Object.values(v.NetworkLayer_Map).forEach((v2) => {
          v2._NetworkLayer.dispose();
        });
      });
    },
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
