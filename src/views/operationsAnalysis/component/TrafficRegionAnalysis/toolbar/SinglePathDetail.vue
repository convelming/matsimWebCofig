<template>
  <el-collapse-item class="toolbar_item SinglePathDetail" :name="name">
    <div class="toolbar_item_header" slot="title">
      <div v-if="singlePathDetail.type == 'link'" class="title" style="max-width: 100%">{{ $l("区域路段交通分析") }}</div>
      <div v-if="singlePathDetail.type == 'build'" class="title" style="max-width: 100%">{{ $l("区域建筑交通分析") }}</div>
    </div>
    <div class="toolbar_item_bodyer" v-loading="loading">
      <div class="form">
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showSelectGeoJSONLayer" class="show_btn" type="primary" size="small" @click="showSelectGeoJSONLayer = true">{{ $l("显示区域") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showSelectGeoJSONLayer = false">{{ $l("隐藏区域") }}</el-button>
            <el-button class="open_btn" icon="el-icon-aim" type="primary" size="small" @click="handleSetCenter"></el-button>
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showLinkLayer" class="show_btn" type="primary" size="small" @click="showLinkLayer = true">{{ $l("显示Link") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showLinkLayer = false">{{ $l("隐藏Link") }}</el-button>
            <el-button class="open_btn" :icon="openLinkList ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openLinkList = !openLinkList"></el-button>
          </div>
          <div v-if="openLinkList">
            <div>
              <el-checkbox v-model="selectAll" @change="handleSelectLinkList">{{ $l("全选") }}</el-checkbox>
            </div>
            <div class="link_list">
              <el-checkbox-group v-model="selectLinkList" @change="handleSelectLinkList">
                <el-checkbox v-for="item in linkList" :key="item.id" :label="item.id">{{ item.id }}</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showHeatMapDialog" :loading="heatMapDataLoading" class="show_btn" type="primary" size="small" @click="handleShowHeatMapDialog">{{ $l("显示热力图") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showHeatMapDialog = false">{{ $l("隐藏热力图") }}</el-button>
            <HeatMapDialog :visible.sync="showHeatMapDialog" :form="heatMapData" :offset="0"></HeatMapDialog>
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showLinkFlowLayer" :loading="linkFlowLoading" class="show_btn" type="primary" size="small" @click="handleShowLinkFlowLayer">{{ $l("显示周边流量") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showLinkFlowLayer = false">{{ $l("隐藏周边流量") }}</el-button>
            <el-button class="open_btn" :icon="openLinkFlowSetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openLinkFlowSetting = !openLinkFlowSetting"></el-button>
          </div>
          <div class="setting_box" v-show="openLinkFlowSetting">
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("仅显示选中路段") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="showLinkFlowLayerType" active-value="all" inactive-value="part" size="mini"></el-switch>
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("颜色") }}</div>
              <div class="setting_item_value">
                <ColorSelect v-model="linkFlowColor" :colorsList="COLOR_LIST" size="mini" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("高度") }}</div>
              <div class="setting_item_value">
                <el-input-number v-model="linkFlowHeight" :min="0" :step="1" size="mini" />
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
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showAccessibilityLayer" :loading="accessibilityLoading" class="show_btn" type="primary" size="small" @click="handleShowAccessibilityLayer">{{ $l("显示可达性分析") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showAccessibilityLayer = false">{{ $l("隐藏可达性分析") }}</el-button>
            <el-button class="open_btn" :icon="openAccessibilitySetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openAccessibilitySetting = !openAccessibilitySetting"></el-button>
          </div>
          <div class="setting_box" v-show="openAccessibilitySetting">
            <div class="setting_item" v-for="item in accessibilityColorBar">
              <div class="setting_item_label">
                <el-checkbox v-model="item.show" @change="handleSetAccessibilityLayerColorBar">{{ item.label }}</el-checkbox>
              </div>
              <div class="setting_item_value">
                <el-color-picker size="mini" :predefine="predefineColors" v-model="item.color" @change="handleSetAccessibilityLayerColorBar" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("透明度") }}</div>
              <div class="setting_item_value" style="width: calc(100% - 80px)">
                <el-slider v-model="accessibilityOpacity" :min="0" :max="1" :step="0.01" />
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
  "区域路段交通分析":{
    "zh-CN": "区域路段交通分析",
    "en-US": "区域路段交通分析"
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
  "显示Link":{
    "zh-CN": "显示Link",
    "en-US": "Show link"
  },
  "隐藏Link":{
    "zh-CN": "隐藏Link",
    "en-US": "Hide link"
  },
  "显示热力图":{
    "zh-CN": "显示热力图",
    "en-US": "Show heatmap"
  },
  "隐藏热力图":{
    "zh-CN": "隐藏热力图",
    "en-US": "Hide heatmap"
  },
  "显示周边流量":{
    "zh-CN": "显示周边流量",
    "en-US": "Show link tracks"
  },
  "隐藏周边流量":{
    "zh-CN": "隐藏周边流量",
    "en-US": "Hide link tracks"
  },
  "仅显示选中路段":{
    "zh-CN": "仅显示选中路段",
    "en-US": "Show all tracks"
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
  "显示可达性分析":{
    "zh-CN": "显示可达性分析",
    "en-US": "显示可达性分析"
  },
  "隐藏可达性分析":{
    "zh-CN": "隐藏可达性分析",
    "en-US": "隐藏可达性分析"
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
}
</language>

<script>
import { guid, COLOR_LIST } from "@/utils/utils";
import { getLinkListTRG, getLinkTracksTRG, getOriginGridsTRG, getDestinationsGridsTRG, desireLinesTRG, accessibilityTRG } from "@/api/index";

import HeatMapDialog from "../components/HeatMapDialog.vue";

import { GeoJSONLayer, LINE_STYLE } from "../../GeoJSON/layer/GeoJSONLayer";
import { LinkFlowLayer } from "../layer/LinkFlowLayer";
import { GridsLayer } from "../layer/GridsLayer";
import { DesireLineLayer } from "../layer/DesireLineLayer";
import { AccessibilityLayer } from "../layer/AccessibilityLayer";

const GRID_STEP = 100;

export default {
  name: "SinglePathDetail",
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
    singlePathDetail: {
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
        return this.linkList.length == this.selectLinkList.length;
      },
      set(val) {
        if (val) {
          this.selectLinkList = this.linkList.map((v) => v.id);
        } else {
          this.selectLinkList = [];
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
    showLinkLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._LinkGeoJSONLayer);
        } else {
          this._Map.removeLayer(this._LinkGeoJSONLayer);
        }
      },
    },
    showLinkFlowLayer: {
      handler(val) {
        this._handleShowLinkFlowLayer();
      },
    },
    showLinkFlowLayerType: {
      handler(val) {
        this._handleShowLinkFlowLayer();
      },
    },
    linkFlowColor: {
      handler(val) {
        this._LinkFlowLayer1.setColorBar(this.COLOR_LIST[val]);
        this._LinkFlowLayer2.setColorBar(this.COLOR_LIST[val]);
      },
    },
    linkFlowHeight: {
      handler(val) {
        this._LinkFlowLayer1.setHeight(val);
        this._LinkFlowLayer2.setHeight(val);
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
    originSize: {
      handler(val) {
        this._OriginGridsLayer.setSize(val / GRID_STEP);
      },
    },
    originColor: {
      handler(val) {
        this._OriginGridsLayer.setColorBar(this.COLOR_LIST[this.originColor]);
      },
    },
    destinationsSize: {
      handler(val) {
        this._DestinationsGridsLayer.setSize(val / GRID_STEP);
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
    showAccessibilityLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._AccessibilityLayer);
        } else {
          this._Map.removeLayer(this._AccessibilityLayer);
        }
      },
    },
    accessibilityOpacity: {
      handler(val) {
        this._AccessibilityLayer.setOpacity(val);
      },
    },
  },
  data() {
    return {
      predefineColors: ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc"],
      COLOR_LIST,
      GRID_STEP,
      loading: true,

      showSelectGeoJSONLayer: true,

      selectLinkList: [],
      linkList: [],
      openLinkList: false,
      showLinkLayer: true,

      showHeatMapDialog: false,
      heatMapDataLoading: false,
      heatMapData: null,

      openLinkFlowSetting: false,
      linkFlowLoading: false,
      showLinkFlowLayer: false,
      showLinkFlowLayerType: "all", // part
      linkFlowColor: 0,
      linkFlowHeight: 30,

      openOriginSetting: false,
      originLoading: false,
      showOriginLayer: false,
      originColor: 0,
      originSize: GRID_STEP,

      openDestinationsSetting: false,
      destinationsLoading: false,
      showDestinationsLayer: false,
      destinationsColor: 0,
      destinationsSize: GRID_STEP,

      openDesireLineSetting: false,
      showDesireLineLayer: false,
      desireLineLoading: false,
      desireLineColor: "#5470c6",

      openAccessibilitySetting: false,
      showAccessibilityLayer: false,
      accessibilityLoading: false,
      accessibilityOpacity: 0.5,
      accessibilityColorBar: [
        { label: "5", key: "5", show: true, color: "rgb(153, 0, 13)" },
        { label: "15", key: "15", show: true, color: "rgb(203, 24, 29)" },
        { label: "30", key: "30", show: true, color: "rgb(239, 59, 44)" },
        { label: "60", key: "60", show: true, color: "rgb(252, 146, 114)" },
        { label: "120", key: "120", show: true, color: "rgb(252, 187, 161)" },
        { label: ">120", key: ">120", show: true, color: "rgb(254, 224, 210)" },
      ],
    };
  },
  created() {
    this.initSelectGeoJSONLayer();
    this.initLinkGeoJSONLayer();
    this.getLinkList();

    this._LinkFlowLayer1 = new LinkFlowLayer({ zIndex: 230, color: 0xff0000, height: this.linkFlowHeight, colorBar: this.COLOR_LIST[this.linkFlowColor] });
    this._LinkFlowLayer2 = new LinkFlowLayer({ zIndex: 230, color: 0xff0000, height: this.linkFlowHeight, colorBar: this.COLOR_LIST[this.linkFlowColor] });
    this._OriginGridsLayer = new GridsLayer({ zIndex: 240, colorBar: this.COLOR_LIST[this.originColor], size: this.originSize / GRID_STEP, step: GRID_STEP });
    this._DestinationsGridsLayer = new GridsLayer({ zIndex: 240, colorBar: this.COLOR_LIST[this.destinationsColor], size: this.destinationsSize / GRID_STEP, step: GRID_STEP });
    this._DesireLineLayer = new DesireLineLayer({ zIndex: 560, color: this.desireLineColor });
    this._AccessibilityLayer = new AccessibilityLayer({ zIndex: 60, color: this.desireLineColor, colorBar: this.accessibilityColorBar, opacity: this.accessibilityOpacity });

    this.handleTimeChange(this.rootVue.time);
  },
  mounted() {},
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    handleTimeChange(time) {
      const num = Math.floor(time / 3600);
      if (this._OriginGridsLayer && this._OriginGridsLayer.time !== num) this._OriginGridsLayer.setTime(num);
      if (this._DestinationsGridsLayer && this._DestinationsGridsLayer.time !== num) this._DestinationsGridsLayer.setTime(num);
      if (this._DesireLineLayer && this._DesireLineLayer.time !== num) this._DesireLineLayer.setTime(num);
    },
    handleSetCenter() {
      this._Map.setCenter(this.singlePathDetail.shape[0]);
    },
    initSelectGeoJSONLayer() {
      this._SelectGeoJSONLayer = new GeoJSONLayer({
        zIndex: 210,
        polygonColor: 0x409eff,
        polygonOpacity: 0.5,
        polygonBorderWidth: 1,
        polygonBorderColor: 0x409eff,
        polygonBorderStyle: LINE_STYLE.SOLID,
      });
      const center = this.singlePathDetail.shape[0];
      const polygonArray = [0, 0];
      polygonArray[polygonArray.length] = this.singlePathDetail.shape.length * 2;
      for (const point of this.singlePathDetail.shape) {
        polygonArray[polygonArray.length] = point[0] - center[0];
        polygonArray[polygonArray.length] = point[1] - center[1];
      }
      for (const hole of this.singlePathDetail.holes) {
        polygonArray[polygonArray.length] = hole.length * 2;
        for (const point of hole) {
          polygonArray[polygonArray.length] = point[0] - center[0];
          polygonArray[polygonArray.length] = point[1] - center[1];
        }
      }
      polygonArray[0] = polygonArray.length - 1;
      this._SelectGeoJSONLayer.setCenter(center);
      this._SelectGeoJSONLayer.setPolygonArray(polygonArray);
    },
    initLinkGeoJSONLayer() {
      this._LinkGeoJSONLayer = new GeoJSONLayer({
        zIndex: 120,
        lineWidth: 10,
        lineStyle: LINE_STYLE.SOLID,
        lineColor: 0xf56c6c,
        lineOpacity: 1,
        lineColorBar: ["#00000000", "#f56c6c"],
        lineValue: "value",
      });
    },
    handleEnable() {
      if (this.showSelectGeoJSONLayer) this._Map.addLayer(this._SelectGeoJSONLayer);
      if (this.showLinkLayer) this._Map.addLayer(this._LinkGeoJSONLayer);
      if (this.showOriginLayer) this._Map.addLayer(this._OriginGridsLayer);
      if (this.showDestinationsLayer) this._Map.addLayer(this._DestinationsGridsLayer);
      if (this.showDesireLineLayer) this._Map.addLayer(this._DesireLineLayer);
      if (this.showAccessibilityLayer) this._Map.addLayer(this._AccessibilityLayer);

      this._handleShowLinkFlowLayer();
      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    handleDisable() {
      this._Map.removeLayer(this._SelectGeoJSONLayer);
      this._Map.removeLayer(this._LinkGeoJSONLayer);
      this._Map.removeLayer(this._OriginGridsLayer);
      this._Map.removeLayer(this._DestinationsGridsLayer);
      this._Map.removeLayer(this._DesireLineLayer);
      this._Map.removeLayer(this._AccessibilityLayer);

      this._Map.removeLayer(this._LinkFlowLayer1);
      this._Map.removeLayer(this._LinkFlowLayer2);
      this.rootVue.$off("timeChange", this.handleTimeChange);
    },
    getLinkList() {
      getLinkListTRG({
        xyarr: this.singlePathDetail.shape,
        holes: this.singlePathDetail.holes,
        linkOrFacility: {
          link: "link",
          build: "facility",
        }[this.singlePathDetail.type],
      }).then((res) => {
        console.log(res);
        this.loading = false;
        this.selectLinkList = res.data.map((v) => v.id);
        this.linkList = res.data;

        const center = this.singlePathDetail.shape[0];
        const lineArray = [];
        let i = 1;
        for (const link of this.linkList) {
          lineArray.push(7, ++i, link.fromCoord.x - center[0], link.fromCoord.y - center[1], 0, link.toCoord.x - center[0], link.toCoord.y - center[1], link.length);
        }

        this._LinkGeoJSONLayer.setCenter(center);
        this._LinkGeoJSONLayer.setLineArray(lineArray);

        this.handleSelectLinkList();
      });
    },
    handleSelectLinkList() {
      const propertiesList = [{}];
      for (const link of this.linkList) {
        propertiesList.push({ value: this.selectLinkList.includes(link.id) ? 1 : 0 });
      }
      this._LinkGeoJSONLayer.setPropertiesList(propertiesList, { value: { min: 0, max: 1 } });
    },
    async getLinkTracksTRG() {
      try {
        this.heatMapDataLoading = true;
        this.linkFlowLoading = true;

        this.heatMapData = null;
        this._LinkFlowLayer1.setData(null);
        this._LinkFlowLayer2.setData(null);

        await Promise.all([getLinkTracksTRG({ linkIds: this.selectLinkList, allTracks: true }), getLinkTracksTRG({ linkIds: this.selectLinkList, allTracks: false })]).then(([res1, res2]) => {
          console.log(res1, res2);
          this.heatMapData = res1.data.vc;

          this._LinkFlowLayer1.setData(res1.data);
          this._LinkFlowLayer2.setData(res2.data);

          this.heatMapDataLoading = false;
          this.linkFlowLoading = false;
        });
      } catch (error) {
      } finally {
        this.heatMapDataLoading = false;
        this.linkFlowLoading = false;
      }
    },
    async handleShowHeatMapDialog() {
      await this.getLinkTracksTRG();
      this.showHeatMapDialog = true;
    },
    async handleShowLinkFlowLayer() {
      await this.getLinkTracksTRG();
      this.showLinkFlowLayer = true;
      this._handleShowLinkFlowLayer();
    },
    _handleShowLinkFlowLayer() {
      console.log(this.showLinkFlowLayer, this.showLinkFlowLayerType);

      if (this.showLinkFlowLayer && this.showLinkFlowLayerType == "all") {
        this._Map.addLayer(this._LinkFlowLayer1);
        this._Map.removeLayer(this._LinkFlowLayer2);
      } else if (this.showLinkFlowLayer && this.showLinkFlowLayerType == "part") {
        this._Map.removeLayer(this._LinkFlowLayer1);
        this._Map.addLayer(this._LinkFlowLayer2);
      } else {
        this._Map.removeLayer(this._LinkFlowLayer1);
        this._Map.removeLayer(this._LinkFlowLayer2);
      }
    },
    async handleShowOriginLayer() {
      try {
        this.originLoading = true;
        this._OriginGridsLayer.setData(null);
        const res = await getOriginGridsTRG({
          linkIds: this.selectLinkList,
          width: GRID_STEP,
        });
        this._OriginGridsLayer.setData(res.data);
        this.showOriginLayer = true;
      } catch (error) {
        console.log(error);
      } finally {
        this.originLoading = false;
      }
    },
    async handleShowDestinationsLayer() {
      try {
        this.destinationsLoading = true;
        this._DestinationsGridsLayer.setData(null);
        const res = await getDestinationsGridsTRG({
          linkIds: this.selectLinkList,
          width: GRID_STEP,
        });
        this._DestinationsGridsLayer.setData(res.data);
        this.showDestinationsLayer = true;
      } catch (error) {
        console.log(error);
      } finally {
        this.destinationsLoading = false;
      }
    },
    async handleShowDesireLineLayer() {
      try {
        this.desireLineLoading = true;
        this._DesireLineLayer.setData(null);
        const res = await desireLinesTRG({
          xyarr: this.singlePathDetail.shape,
          holes: this.singlePathDetail.holes,
        });
        this._DesireLineLayer.setShowIds([null]);
        this._DesireLineLayer.setData(res.data);
        this.showDesireLineLayer = true;
      } catch (error) {
        console.log(error);
      } finally {
        this.desireLineLoading = false;
      }
    },
    async handleShowAccessibilityLayer() {
      try {
        this.accessibilityLoading = true;
        const res = await accessibilityTRG({
          xyarr: this.singlePathDetail.shape,
          holes: this.singlePathDetail.holes,
        });
        this._AccessibilityLayer.setData(res.data);
        this.showAccessibilityLayer = true;
      } catch (error) {
        console.log(error);
      } finally {
        this.accessibilityLoading = false;
      }
    },
    handleSetAccessibilityLayerColorBar() {
      this._AccessibilityLayer.setColorBar(this.accessibilityColorBar);
    },
  },
};
</script>

<style lang="scss" scoped>
.SinglePathDetail {
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
      display: flex;
      align-items: center;
      width: 100%;
      & + .setting_item {
        margin-top: 10px;
      }
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
