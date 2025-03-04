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
        <!-- <div class="form_item">
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
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("大小") }}</div>
              <div class="setting_item_value">
                <el-input-number v-model="originSize" :min="GRID_STEP" :step="GRID_STEP" step-strictly size="mini" />
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
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("大小") }}</div>
              <div class="setting_item_value">
                <el-input-number v-model="destinationsSize" :min="GRID_STEP" :step="GRID_STEP" step-strictly size="mini" />
              </div>
            </div>
          </div>
        </div> -->

        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showOriginLayer" :loading="originLoading" class="show_btn" type="primary" size="small" @click="handleShowOriginLayer">{{ $l("显示起点分布") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showOriginLayer = false">{{ $l("隐藏起点分布") }}</el-button>
            <el-button class="open_btn" :icon="openOriginSetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openOriginSetting = !openOriginSetting"></el-button>
          </div>
          <div class="setting_box" v-show="openOriginSetting">
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("大小") }}</div>
              <div class="setting_item_value">
                <el-input-number v-model="originSize" :min="GRID_STEP" :step="GRID_STEP" step-strictly size="mini" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("设置") }}</div>
              <div class="setting_item_value">
                <el-button type="primary" icon="el-icon-setting" @click="showOriginConfig = true" size="mini"></el-button>
                <GeoJSONSetting ref="originConfig" :visible.sync="showOriginConfig" :form="originConfigForm" :layout="originConfigLayout" @confirm="handleOriginConfigConfirm" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("Visual map") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="showOriginVisualMap" :active-value="true" />
                <GeoJSONVisualMap v-show="showOriginVisualMap && showOriginLayer" :list="originConfigForm.colorBar.data" />
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
              <div class="setting_item_label">{{ $l("大小") }}</div>
              <div class="setting_item_value">
                <el-input-number v-model="destinationsSize" :min="GRID_STEP" :step="GRID_STEP" step-strictly size="mini" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("设置") }}</div>
              <div class="setting_item_value">
                <el-button type="primary" icon="el-icon-setting" @click="showDestinationsConfig = true" size="mini"></el-button>
                <GeoJSONSetting ref="destinationsConfig" :visible.sync="showDestinationsConfig" :form="destinationsConfigForm" :layout="destinationsConfigLayout" @confirm="handleDestinationsConfigConfirm" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("Visual map") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="showDestinationsVisualMap" :active-value="true" />
                <GeoJSONVisualMap v-show="showDestinationsVisualMap && showDestinationsLayer" :list="destinationsConfigForm.colorBar.data" />
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
  "透明度":{
    "zh-CN": "透明度",
    "en-US": "Opacity"
  },
  "设置":{
    "zh-CN": "设置",
    "en-US": "Config"
  },
  "Visual map":{
    "zh-CN": "Visual map",
    "en-US": "Visual map"
  },
}
</language>

<script>
import { guid, COLOR_LIST } from "@/utils/utils";
import { polygonOriginGridsTRG, polygonDestinationsGridsTRG, polygonDesireLinesTRG } from "@/api/index";

import HeatMapDialog from "../components/HeatMapDialog.vue";
import GeoJSONVisualMap from "../../GeoJSON/component/GeoJSONVisualMap2.vue";
import GeoJSONSetting from "../../GeoJSON/component/GeoJSONSetting.vue";

import { GeoJSONLayer, LINE_STYLE } from "../../GeoJSON/layer/GeoJSONLayer";
import { PolygonGridLayer } from "../layer/PolygonGridLayer";
import { DesireLineLayer } from "../layer/DesireLineLayer";

const GRID_STEP = 100;

export default {
  name: "MultiplePathsDetail",
  inject: ["rootVue"],
  components: {
    HeatMapDialog,
    GeoJSONVisualMap,
    GeoJSONSetting,
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
    showDestinationsLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._DestinationsGridsLayer);
        } else {
          this._Map.removeLayer(this._DestinationsGridsLayer);
        }
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
      originUseTimeRange: false,
      originTimeRange: [0, 24 * 60 * 60],
      showOriginVisualMap: false,
      showOriginConfig: false,
      originSize: GRID_STEP,
      originConfigForm: {
        opacity: 1,
        colorBar: {
          valueKey: "value__Number",
          valueType: "Number",
          startColor: "#FEE0D2",
          endColor: "#99000D",
          model: "count",
          modelClass: 5,
          data: [],
        },
      },
      originConfigLayout: [
        {
          label: "透明度",
          en_label: "Opacity",
          name: "opacity",
          type: "slider",
          attrs: { min: 0, max: 1, step: 0.01 },
        },
        {
          label: "颜色",
          en_label: "color",
          name: "colorBar",
          type: "colorBar",
          options: {
            value__Number: {
              type: "Number",
              name: "values",
              min: 0,
              max: 100,
              values: [],
            },
          },
          attrs: {
            hideValueKey: true,
          },
        },
      ],

      openDestinationsSetting: false,
      destinationsLoading: false,
      showDestinationsLayer: false,
      destinationsUseTimeRange: false,
      destinationsTimeRange: [0, 24 * 60 * 60],
      showDestinationsVisualMap: false,
      showDestinationsConfig: false,
      destinationsSize: GRID_STEP,
      destinationsConfigForm: {
        opacity: 1,
        colorBar: {
          valueKey: "value__Number",
          valueType: "Number",
          startColor: "#FEE0D2",
          endColor: "#99000D",
          model: "count",
          modelClass: 5,
          data: [],
        },
      },
      destinationsConfigLayout: [
        {
          label: "透明度",
          en_label: "Opacity",
          name: "opacity",
          type: "slider",
          attrs: { min: 0, max: 1, step: 0.01 },
        },
        {
          label: "颜色",
          en_label: "color",
          name: "colorBar",
          type: "colorBar",
          options: {
            value__Number: {
              type: "Number",
              name: "values",
              min: 0,
              max: 100,
              values: [],
            },
          },
          attrs: {
            hideValueKey: true,
          },
        },
      ],

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

    this._OriginGridsLayer = new PolygonGridLayer({ zIndex: 140, colorBar: this.COLOR_LIST[this.originColor] });
    this._DestinationsGridsLayer = new PolygonGridLayer({ zIndex: 150, colorBar: this.COLOR_LIST[this.destinationsColor] });
    this._DesireLineLayer = new DesireLineLayer({ zIndex: 460, color: this.desireLineColor, lineWidth: this.desireLineWidth });

    this.initData();
    this.handleSelectPolygonList();
    this.handleTimeChange(this.rootVue.time);
  },
  mounted() {},
  beforeDestroy() {
    this.handleDisable();

    this._SelectGeoJSONLayer.dispose();
    this._OriginGridsLayer.dispose();
    this._DestinationsGridsLayer.dispose();
    this._DesireLineLayer.dispose();
  },
  methods: {
    initByConfig(config) {
      for (const key in config) {
        this[key] = config[key];
      }
    },
    exportConfig() {
      return JSON.parse(
        JSON.stringify({
          showSelectGeoJSONLayer: this.showSelectGeoJSONLayer,

          selectLinkList: this.selectLinkList,

          showLinkLayer: this.showLinkLayer,
          openLinkList: this.openLinkList,

          showHeatMapDialog: this.showHeatMapDialog,

          showLinkFlowLayer: this.showLinkFlowLayer,
          showLinkFlowAllArea: this.showLinkFlowAllArea,
          showLinkFlowAllTracks: this.showLinkFlowAllTracks,
          linkFlowUseTimeRange: this.linkFlowUseTimeRange,
          linkFlowTimeRange: this.linkFlowTimeRange,
          showLineFlowVisualMap: this.showLineFlowVisualMap,
          lineFlowConfigForm: this.lineFlowConfigForm,

          showOriginLayer: this.showOriginLayer,
          originUseTimeRange: this.originUseTimeRange,
          originTimeRange: this.originTimeRange,
          showOriginVisualMap: this.showOriginVisualMap,
          originSize: this.originSize,
          originConfigForm: this.originConfigForm,

          showDestinationsLayer: this.showDestinationsLayer,
          destinationsUseTimeRange: this.destinationsUseTimeRange,
          destinationsTimeRange: this.destinationsTimeRange,
          showDestinationsVisualMap: this.showDestinationsVisualMap,
          destinationsSize: this.destinationsSize,
          destinationsConfigForm: this.destinationsConfigForm,

          showDesireLineLayer: this.showDesireLineLayer,
          desireLineColor: this.desireLineColor,
          desireLineWidth: this.desireLineWidth,

          showAccessibilityLayer: this.showAccessibilityLayer,
          accessibilityColorBar: this.accessibilityColorBar,

          showAccessibilityVisualMap: this.showAccessibilityVisualMap,
          accessibilityConfigForm: this.accessibilityConfigForm,
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
          // const configItem = this.originConfigLayout.find((item) => item.name === "colorBar");
          // configItem.options.value__Number.values = [];
          polygons.forEach((v) => {
            v.values = res.data[v.id] || [];
          });
          console.log(polygons);
          
          this._OriginGridsLayer.setData(polygons, "values");
          this._OriginGridsLoaded = true;
        } catch (error) {}
        this.originLoading = false;
      }
      this.showOriginLayer = true;
    },
    handleOriginConfigConfirm(data) {
      this.originConfigForm = data;
      const { colorBar, opacity } = data;
      this._OriginGridsLayer.setOpacity(opacity);
      this._OriginGridsLayer.setColorBar(colorBar.data);
      this.showOriginConfig = false;
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
    handleDestinationsConfigConfirm(data) {
      this.destinationsConfigForm = data;
      const { colorBar, opacity } = data;
      this._DestinationsGridsLayer.setOpacity(opacity);
      this._DestinationsGridsLayer.setColorBar(colorBar.data);
      this.showDestinationsConfig = false;
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
