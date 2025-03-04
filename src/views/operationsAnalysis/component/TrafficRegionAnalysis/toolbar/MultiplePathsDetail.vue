<template>
  <el-collapse-item class="toolbar_item MultiplePathsDetail" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div class="title" style="max-width: 100%">{{ $l("区域交通分析") }}</div>
    </div>
    <div class="toolbar_item_bodyer" v-loading="loading">
      <div class="form">
        <div class="form_item">
          <div class="form_item">
            <div class="form_item_header">
              <el-button v-if="!showSelectGeoJSONLayer" class="show_btn" type="primary" size="small" @click="showSelectGeoJSONLayer = true">{{ $l("显示区域") }}</el-button>
              <el-button v-else class="show_btn" type="info" size="small" @click="showSelectGeoJSONLayer = false">{{ $l("隐藏区域") }}</el-button>
              <el-button class="open_btn" icon="el-icon-aim" type="primary" size="small" @click="handleSetCenter"></el-button>
              <el-button class="open_btn" :icon="openPolygonList ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openPolygonList = !openPolygonList"></el-button>
            </div>
            <div v-if="openPolygonList">
              <div>
                <el-checkbox v-model="selectAll" @change="handleSelectPolygonList">{{ $l("全选") }}</el-checkbox>
              </div>
              <div class="link_list">
                <el-checkbox-group v-model="selectPolygonList" @change="handleSelectPolygonList">
                  <el-checkbox v-for="(item, index) in polygonList" :key="index" :label="index">polygon - {{ item }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showOriginLayer" :loading="originLoading" class="show_btn" type="primary" size="small" @click="handleShowOriginLayer">{{ $l("显示起点分布") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showOriginLayer = false">{{ $l("隐藏起点分布") }}</el-button>
            <el-button class="open_btn" :icon="openOriginSetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openOriginSetting = !openOriginSetting"></el-button>
          </div>
          <div class="setting_box" v-show="openOriginSetting">
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("颜色") }}</div>
              <div class="setting_item_value">
                <ColorSelect v-model="originColor" :colorsList="COLOR_LIST" size="mini" />
              </div>
            </div>
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showDestinationsLayer" :loading="destinationsLoading" class="show_btn" type="primary" size="small" @click="handleShowDestinationsLayer">{{ $l("显示讫点分布") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showDestinationsLayer = false">{{ $l("隐藏讫点分布") }}</el-button>
            <el-button class="open_btn" :icon="openDestinationsSetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openDestinationsSetting = !openDestinationsSetting"></el-button>
          </div>
          <div class="setting_box" v-show="openDestinationsSetting">
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("颜色") }}</div>
              <div class="setting_item_value">
                <ColorSelect v-model="destinationsColor" :colorsList="COLOR_LIST" size="mini" />
              </div>
            </div>
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showDesireLineLayer" :loading="desireLineLoading" class="show_btn" type="primary" size="small" @click="handleShowDesireLineLayer">{{ $l("显示期望线") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showDesireLineLayer = false">{{ $l("隐藏期望线") }}</el-button>
            <el-button class="open_btn" :icon="openDesireLineSetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openDesireLineSetting = !openDesireLineSetting"></el-button>
          </div>
          <div class="setting_box" v-show="openDesireLineSetting">
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("颜色") }}</div>
              <div class="setting_item_value">
                <el-color-picker size="mini" :predefine="predefineColors" v-model="desireLineColor" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("线宽") }}</div>
              <div class="setting_item_value" style="width: calc(100% - 80px)">
                <el-input-number v-model="desireLineWidth" :min="1" :step="1" :controls="true" controls-position="both" size="mini" style="width: 100%"> </el-input-number>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<language>
{
  "区域交通分析":{
    "zh-CN": "区域交通分析",
    "en-US": "区域交通分析"
  },
  "区域建筑交通分析":{
    "zh-CN": "区域建筑交通分析",
    "en-US": "区域建筑交通分析"
  },
  "显示区域":{
    "zh-CN": "显示区域",
    "en-US": "Show polygon"
  },
  "隐藏区域":{
    "zh-CN": "隐藏区域",
    "en-US": "Hide polygon"
  },
  "显示起点分布":{
    "zh-CN": "显示起点分布",
    "en-US": "Show origin grids"
  },
  "隐藏起点分布":{
    "zh-CN": "隐藏起点分布",
    "en-US": "Hide origin grids"
  },
  "显示讫点分布":{
    "zh-CN": "显示讫点分布",
    "en-US": "Show destinations"
  },
  "隐藏讫点分布":{
    "zh-CN": "隐藏讫点分布",
    "en-US": "Hide destinations"
  },
  "显示期望线":{
    "zh-CN": "显示期望线",
    "en-US": "Show desire lines"
  },
  "隐藏期望线":{
    "zh-CN": "隐藏期望线",
    "en-US": "Hide desire lines"
  },
  "颜色":{
    "zh-CN": "颜色",
    "en-US": "Color"
  },
  "高度":{
    "zh-CN": "高度",
    "en-US": "Height"
  },
  "大小":{
    "zh-CN": "大小",
    "en-US": "Size"
  },
  "全选":{
    "zh-CN": "全选",
    "en-US": "Select all"
  },
}
</language>

<script>
import { guid, COLOR_LIST } from "@/utils/utils";
import { polygonOriginGridsTRG, polygonDestinationsGridsTRG, polygonDesireLinesTRG } from "@/api/index";

import HeatMapDialog from "../components/HeatMapDialog.vue";

import { GeoJSONLayer, LINE_STYLE } from "../../GeoJSON/layer/GeoJSONLayer";
import { PolygonGridLayer } from "../layer/PolygonGridLayer";
import { DesireLineLayer } from "../layer/DesireLineLayer";

const GRID_STEP = 100;

export default {
  name: "MultiplePathsDetail",
  inject: ["rootVue"],
  components: {
    HeatMapDialog,
  },
  props: {
    name: {
      type: String,
    },
    show: {
      type: Boolean,
      default: false,
    },
    multiplePathsDetail: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: [Object, undefined],
    },
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
    selectAll: {
      get() {
        return this.polygonList.length == this.selectPolygonList.length;
      },
      set(val) {
        if (val) {
          this.selectPolygonList = this.polygonList.map((v, i) => i);
        } else {
          this.selectPolygonList = [];
        }
      },
    },
  },
  watch: {
    show: {
      handler(val) {
        this.$nextTick(() => {
          this._interval = setInterval(() => {
            if (!this._Map) return;
            clearInterval(this._interval);
            if (this.show) {
              this.handleEnable();
            } else {
              this.handleDisable();
            }
          }, 1000);
        });
      },
      immediate: true,
    },
    showSelectGeoJSONLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._SelectGeoJSONLayer);
        } else {
          this._Map.removeLayer(this._SelectGeoJSONLayer);
        }
      },
    },
    showOriginLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._OriginGridsLayer);
        } else {
          this._Map.removeLayer(this._OriginGridsLayer);
        }
      },
    },
    originColor: {
      handler(val) {
        this._OriginGridsLayer.setColorBar(this.COLOR_LIST[this.originColor]);
      },
    },
    showDestinationsLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._DestinationsGridsLayer);
        } else {
          this._Map.removeLayer(this._DestinationsGridsLayer);
        }
      },
    },
    destinationsColor: {
      handler(val) {
        this._DestinationsGridsLayer.setColorBar(this.COLOR_LIST[this.destinationsColor]);
      },
    },
    showDesireLineLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._DesireLineLayer);
        } else {
          this._Map.removeLayer(this._DesireLineLayer);
        }
      },
    },
    desireLineColor: {
      handler(val) {
        this._DesireLineLayer.setColor(val);
      },
    },
    desireLineWidth: {
      handler(val) {
        this._DesireLineLayer.setLineWidth(val);
      },
    },
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      COLOR_LIST,
      GRID_STEP,
      loading: false,

      showSelectGeoJSONLayer: true,
      selectPolygonList: [],
      polygonList: [],
      openPolygonList: false,

      openOriginSetting: false,
      originLoading: false,
      showOriginLayer: false,
      originColor: 0,

      openDestinationsSetting: false,
      destinationsLoading: false,
      showDestinationsLayer: false,
      destinationsColor: 0,

      openDesireLineSetting: false,
      showDesireLineLayer: false,
      desireLineLoading: false,
      desireLineColor: "#5470c6",
      desireLineWidth: 10,

      openReachabilitySetting: false,
    };
  },
  created() {
    this._SelectGeoJSONLayer = new GeoJSONLayer({
      zIndex: 110,
      polygonOpacity: 0.5,
      polygonBorderStyle: LINE_STYLE.NONE,

      polygonColorBar: ["#00000000", "#409eff"],
      polygonValue: "value",
    });
    this._SelectGeoJSONLayer.setCenter(this.multiplePathsDetail._center);
    this._SelectGeoJSONLayer.setPolygonArray(this.multiplePathsDetail._polygonArray);
    console.log(this.multiplePathsDetail._center);
    console.log(this.multiplePathsDetail._polygonArray);

    this._OriginGridsLayer = new PolygonGridLayer({ zIndex: 140, colorBar: this.COLOR_LIST[this.originColor] });
    this._DestinationsGridsLayer = new PolygonGridLayer({ zIndex: 150, colorBar: this.COLOR_LIST[this.destinationsColor] });
    this._DesireLineLayer = new DesireLineLayer({ zIndex: 460, color: this.desireLineColor, lineWidth: this.desireLineWidth });

    this.initData();
    this.handleTimeChange(this.rootVue.time);
  },
  mounted() {},
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    initByConfig(config) {
      for (const key in config) {
        this[key] = config[key];
      }
      if (config.showOriginLayer) {
        this.handleShowOriginLayer();
      }
      if (config.showDestinationsLayer) {
        this.handleShowDestinationsLayer();
      }
      if (config.showDesireLineLayer) {
        this.handleShowDesireLineLayer();
      }
    },
    async exportConfig() {
      return JSON.parse(
        JSON.stringify({
          showSelectGeoJSONLayer: this.showSelectGeoJSONLayer,
          selectPolygonList: this.selectPolygonList,
          openPolygonList: this.openPolygonList,

          showOriginLayer: this.showOriginLayer,
          originColor: this.originColor,

          showDestinationsLayer: this.showDestinationsLayer,
          destinationsColor: this.destinationsColor,

          showDesireLineLayer: this.showDesireLineLayer,
          desireLineColor: this.desireLineColor,
          desireLineWidth: this.desireLineWidth,
        })
      );
    },
    handleTimeChange(time) {
      const num = Math.floor(time / 3600);
      if (this._OriginGridsLayer && this._OriginGridsLayer.time !== num) this._OriginGridsLayer.setTime(num);
      if (this._DestinationsGridsLayer && this._DestinationsGridsLayer.time !== num) this._DestinationsGridsLayer.setTime(num);
      if (this._DesireLineLayer && this._DesireLineLayer.time !== num) this._DesireLineLayer.setTime(num);
    },
    handleSetCenter() {
      this._Map.setCenter(this.multiplePathsDetail._center);
    },
    initData() {
      this.polygonList = this.multiplePathsDetail.polygonList.map((v) => v.id);
      this.selectPolygonList = this.polygonList.map((v, i) => i);
      if (this.config) {
        this.initByConfig(this.config);
      }
      this.handleSelectPolygonList();
    },
    async handleShowOriginLayer() {
      if (!this._OriginGridsLoaded) {
        try {
          this.originLoading = true;
          const polygons = this.multiplePathsDetail.polygonList.map((v) => ({
            shape: v._shape,
            holes: v._holes,
            id: v.id,
          }));
          this._OriginGridsLayer.setData(null);
          const res = await polygonOriginGridsTRG({ polygons: polygons });
          polygons.forEach((v) => {
            v.values = res.data[v.id] || [];
          });
          this._OriginGridsLayer.setData(polygons, "values");
          this._OriginGridsLoaded = true;
        } catch (error) {}
        this.originLoading = false;
      }
      this.showOriginLayer = true;
    },
    async handleShowDestinationsLayer() {
      if (!this._DestinationsGridsLoaded) {
        try {
          this.destinationsLoading = true;
          const polygons = this.multiplePathsDetail.polygonList.map((v) => ({
            shape: v._shape,
            holes: v._holes,
            id: v.id,
          }));
          this._DestinationsGridsLayer.setData(null);
          const res = await polygonDestinationsGridsTRG({ polygons: polygons });
          polygons.forEach((v) => {
            v.values = res.data[v.id] || [];
          });
          this._DestinationsGridsLayer.setData(polygons, "values");
          this._DestinationsGridsLoaded = true;
        } catch (error) {}
        this.destinationsLoading = false;
      }
      this.showDestinationsLayer = true;
    },
    async handleShowDesireLineLayer() {
      if (!this._DesireLineLoaded) {
        try {
          this.desireLineLoading = true;
          const polygons = this.multiplePathsDetail.polygonList.map((v) => ({
            shape: v._shape,
            holes: v._holes,
            id: v.id,
          }));
          this._DesireLineLayer.setData(null);
          const res = await polygonDesireLinesTRG({ polygons: polygons });
          this._DesireLineLayer.setData(res.data);
          this._DesireLineLoaded = true;
        } catch (error) {}
        this.desireLineLoading = false;
      }
      this.showDesireLineLayer = true;
    },
    handleSelectPolygonList() {
      const propertiesList = new Array(this.polygonList.length + 1).fill(0).map((v, i) => (i == 0 ? {} : { value: 0 }));
      const showIds = [];
      this.selectPolygonList.forEach((v) => {
        propertiesList[v + 1].value = 1;
        showIds.push(this.polygonList[v]);
      });
      this._SelectGeoJSONLayer.setPropertiesList(propertiesList, { value: { min: 0, max: 1 } });

      this._OriginGridsLayer.setShowIds(showIds);
      this._DestinationsGridsLayer.setShowIds(showIds);
      this._DesireLineLayer.setShowIds(showIds);
    },
    handleEnable() {
      if (this.showSelectGeoJSONLayer) this._Map.addLayer(this._SelectGeoJSONLayer);
      if (this.showOriginLayer) this._Map.addLayer(this._OriginGridsLayer);
      if (this.showDestinationsLayer) this._Map.addLayer(this._DestinationsGridsLayer);
      if (this.showDesireLineLayer) this._Map.addLayer(this._DesireLineLayer);
      this.rootVue.$on("timeChange", this.handleTimeChange);
      console.log("handleEnable", this._Map, this.selectPolygonList);
    },
    handleDisable() {
      this._Map.removeLayer(this._SelectGeoJSONLayer);
      this._Map.removeLayer(this._OriginGridsLayer);
      this._Map.removeLayer(this._DestinationsGridsLayer);
      this._Map.removeLayer(this._DesireLineLayer);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
  },
};
</script>

<style lang="scss" scoped>
.MultiplePathsDetail {
  .link_list {
    width: 100%;
    height: 300px;
    overflow-x: hidden;
    overflow-y: scroll;
    .el-checkbox {
      display: block;
    }
  }
  .setting_box {
    width: 100%;

    .setting_item {
      width: 100%;
      & + .setting_item {
        margin-top: 10px;
      }
      display: flex;
      &_label {
        white-space: nowrap;
        flex: 1;
      }
    }
  }
}
.toolbar_item {
  font-size: 13px;
  .toolbar_item_bodyer {
    .form {
      width: 100%;

      .form_item {
        width: 100%;
        & + .form_item {
          margin-top: 10px;
        }
      }
      .form_item_header {
        display: flex;
        margin-bottom: 10px;
        .open_btn {
          width: 44px;
        }
        .show_btn {
          width: 100%;
        }
      }
    }
  }
}
</style>
