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
              <!-- <el-checkbox-group v-model="selectLinkList" @change="handleSelectLinkList">
                <el-checkbox v-for="item in linkList" :key="item.id" :label="item.id">{{ item.id }}</el-checkbox>
              </el-checkbox-group> -->
              <el-tree ref="linkTree" :data="linkList" show-checkbox node-key="id" :default-expanded-keys="linkOpenNode" :default-checked-keys="selectLinkList" :props="{ children: 'links', label: 'label' }" @check-change="handleLinkTreeChange"> </el-tree>
            </div>
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showHeatMapDialog" :loading="heatMapDataLoading" class="show_btn" type="primary" size="small" @click="handleShowHeatMapDialog">{{ $l("显示道路服务水平") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showHeatMapDialog = false">{{ $l("隐藏道路服务水平") }}</el-button>
            <HeatMapDialog :visible.sync="showHeatMapDialog" :form="heatMapData" :offset="0"></HeatMapDialog>
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showLinkFlowLayer" :loading="linkFlowLoading" class="show_btn" type="primary" size="small" @click="handleShowLinkFlowLayer">{{ $l("显示流量溯源分析") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showLinkFlowLayer = false">{{ $l("隐藏流量溯源分析") }}</el-button>
            <el-button class="open_btn" :icon="openLinkFlowSetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openLinkFlowSetting = !openLinkFlowSetting"></el-button>
          </div>
          <div class="setting_box" v-show="openLinkFlowSetting" v-loading="linkFlowLoading">
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("设置") }}</div>
              <div class="setting_item_value">
                <el-button type="primary" icon="el-icon-setting" @click="showLineFlowConfig = true" size="mini"></el-button>
                <GeoJSONSetting ref="lineFlowConfig" :visible.sync="showLineFlowConfig" :form="lineFlowConfigForm" :layout="lineFlowConfigLayout" @confirm="handleLineFlowConfigConfirm" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("Visual map") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="showLineFlowVisualMap" :active-value="true" :inactive-value="false" />
                <GeoJSONVisualMap ref="lineFlowVisualMap" v-show="showLineFlowVisualMap" :list="lineFlowConfigForm.colorBar.data" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("仅显示区域内居民") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="showLinkFlowAllArea" :active-value="true" :inactive-value="false" size="mini" @change="handleGetLinkFlow" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("仅显示选中路段") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="showLinkFlowAllTracks" :active-value="false" :inactive-value="true" size="mini" @change="handleGetLinkFlow" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("按时段显示") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="linkFlowUseTimeRange" :active-value="true" :inactive-value="false" @change="" />
              </div>
            </div>
            <div class="setting_item" v-if="linkFlowUseTimeRange">
              <TimeRangeSlider v-model="linkFlowTimeRange" />
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
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("按时段显示") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="originUseTimeRange" :active-value="true" :inactive-value="false" @change="" />
              </div>
            </div>
            <div class="setting_item" v-if="originUseTimeRange">
              <TimeRangeSlider v-model="originTimeRange" />
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
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("按时段显示") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="destinationsUseTimeRange" :active-value="true" :inactive-value="false" @change="" />
              </div>
            </div>
            <div class="setting_item" v-if="destinationsUseTimeRange">
              <TimeRangeSlider v-model="destinationsTimeRange" />
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
        <div class="form_item">
          <div class="form_item_header">
            <el-button v-if="!showAccessibilityLayer" :loading="accessibilityLoading" class="show_btn" type="primary" size="small" @click="handleShowAccessibilityLayer">{{ $l("显示可达性分析") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showAccessibilityLayer = false">{{ $l("隐藏可达性分析") }}</el-button>
            <el-button class="open_btn" :icon="openAccessibilitySetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openAccessibilitySetting = !openAccessibilitySetting"></el-button>
          </div>
          <div class="setting_box" v-show="openAccessibilitySetting">
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("设置") }}</div>
              <div class="setting_item_value">
                <el-button type="primary" icon="el-icon-setting" @click="showAccessibilityConfig = true" size="mini"></el-button>
                <GeoJSONSetting ref="accessibilityConfig" :visible.sync="showAccessibilityConfig" :form="accessibilityConfigForm" :layout="accessibilityConfigLayout" @confirm="handleAccessibilityConfigConfirm" />
              </div>
            </div>
            <div class="setting_item">
              <div class="setting_item_label">{{ $l("Visual map") }}</div>
              <div class="setting_item_value">
                <el-switch v-model="showAccessibilityVisualMap" :active-value="true" />
                <GeoJSONVisualMap v-show="showAccessibilityVisualMap && showAccessibilityLayer" :list="accessibilityConfigForm.colorBar.data" />
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
  "显示道路服务水平":{
    "zh-CN": "显示道路服务水平",
    "en-US": "Show level of service"
  },
  "隐藏道路服务水平":{
    "zh-CN": "隐藏道路服务水平",
    "en-US": "Hide level of service"
  },
  "显示流量溯源分析":{
    "zh-CN": "显示流量溯源分析",
    "en-US": "Show traffic traceability analysis"
  },
  "隐藏流量溯源分析":{
    "zh-CN": "隐藏流量溯源分析",
    "en-US": "Hide traffic traceability analysis"
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
  "仅显示区域内居民":{
    "zh-CN": "仅显示区域内居民",
    "en-US": "Show all area"
  },
  "仅显示选中路段":{
    "zh-CN": "仅显示选中路段",
    "en-US": "Show all tracks"
  },
  "按时段显示":{
    "zh-CN": "按时段显示",
    "en-US": "Use time range"
  },
  "颜色":{
    "zh-CN": "颜色",
    "en-US": "Color"
  },
  "Visual map":{
    "zh-CN": "Visual map",
    "en-US": "Visual map"
  },
  "线宽":{
    "zh-CN": "线宽",
    "en-US": "Line width"
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
}
</language>

<script>
import { guid, COLOR_LIST } from "@/utils/utils";
import { getLinkListTRG, getLinkTracksTRG, getOriginGridsTRG, getDestinationsGridsTRG, desireLinesTRG, accessibilityTRG, hotMapTRG } from "@/api/index";

import HeatMapDialog from "../components/HeatMapDialog.vue";

import { GeoJSONLayer, LINE_STYLE } from "../../GeoJSON/layer/GeoJSONLayer";
import GeoJSONVisualMap from "../../GeoJSON/component/GeoJSONVisualMap2.vue";
import GeoJSONSetting from "../../GeoJSON/component/GeoJSONSetting.vue";

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
    singlePathDetail: {
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
        const linkNum = this.linkList.reduce((a, b) => a + b.links.length, 0);
        return linkNum == this.selectLinkList.length;
      },
      set(val) {
        if (val) {
          this.selectLinkList = this.linkList.map((v1) => v1.links.map((v2) => v2.id)).flat(2);
        } else {
          this.selectLinkList = [];
        }
        try {
          this.$refs.linkTree.setCheckedKeys(this.selectLinkList);
        } catch (error) {}
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
        if (val) {
          this._Map.addLayer(this._LinkFlowLayer);
        } else {
          this._Map.removeLayer(this._LinkFlowLayer);
        }
      },
    },
    linkFlowUseTimeRange: {
      handler(val) {
        if (this.linkFlowUseTimeRange) {
          this._LinkFlowLayer.setTimeRange(this.linkFlowTimeRange);
        } else {
          this._LinkFlowLayer.setTimeRange(null);
        }
      },
    },
    linkFlowTimeRange: {
      handler(val) {
        if (this.linkFlowUseTimeRange) {
          this._LinkFlowLayer.setTimeRange(this.linkFlowTimeRange);
        } else {
          this._LinkFlowLayer.setTimeRange(null);
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
    originSize: {
      handler(val) {
        this._OriginGridsLayer.setSize(val);
      },
    },
    originUseTimeRange: {
      handler(val) {
        if (this.originUseTimeRange) {
          this._OriginGridsLayer.setTimeRange(this.originTimeRange);
        } else {
          this._OriginGridsLayer.setTimeRange(null);
        }
      },
    },
    originTimeRange: {
      handler(val) {
        if (this.originUseTimeRange) {
          this._OriginGridsLayer.setTimeRange(this.originTimeRange);
        } else {
          this._OriginGridsLayer.setTimeRange(null);
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
    destinationsSize: {
      handler(val) {
        this._DestinationsGridsLayer.setSize(val);
      },
    },
    destinationsUseTimeRange: {
      handler(val) {
        if (this.destinationsUseTimeRange) {
          this._DestinationsGridsLayer.setTimeRange(this.destinationsTimeRange);
        } else {
          this._DestinationsGridsLayer.setTimeRange(null);
        }
      },
    },
    destinationsTimeRange: {
      handler(val) {
        if (this.destinationsUseTimeRange) {
          this._DestinationsGridsLayer.setTimeRange(this.destinationsTimeRange);
        } else {
          this._DestinationsGridsLayer.setTimeRange(null);
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
    showAccessibilityLayer: {
      handler(val) {
        if (val) {
          this._Map.addLayer(this._AccessibilityLayer);
        } else {
          this._Map.removeLayer(this._AccessibilityLayer);
        }
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
      linkOpenNode: [],
      linkList: [],
      openLinkList: false,
      showLinkLayer: true,

      showHeatMapDialog: false,
      heatMapDataLoading: false,
      heatMapData: null,

      openLinkFlowSetting: false,
      linkFlowLoading: false,
      showLinkFlowLayer: false,
      showLinkFlowAllArea: false,
      showLinkFlowAllTracks: false,
      linkFlowUseTimeRange: false,
      linkFlowTimeRange: [0, 24 * 60 * 60],
      showLineFlowVisualMap: false,
      showLineFlowConfig: false,
      lineFlowConfigForm: {
        height: 30,
        colorBar: {
          valueKey: "value__Number",
          valueType: "Number",
          startColor: "#FEE0D2",
          endColor: "#99000D",
          model: "count",
          modelClass: 5,
          data: [
            { min: 0, max: 0.2, color: "#fee0d2", label: "0 ~ 0.2", use: true },
            { min: 0.2, max: 0.4, color: "#e9b3aa", label: "0.2 ~ 0.4", use: true },
            { min: 0.4, max: 0.6, color: "#d58683", label: "0.4 ~ 0.6", use: true },
            { min: 0.6, max: 0.8, color: "#c1595b", label: "0.6 ~ 0.8", use: true },
            { min: 0.8, max: 1, color: "#ad2c34", label: "0.8 ~ 1", use: true },
          ],
        },
      },
      lineFlowConfigLayout: [
        {
          label: "高度",
          en_label: "height",
          name: "height",
          type: "number",
          attrs: { min: 0 },
        },
        {
          label: "颜色",
          en_label: "color",
          name: "colorBar",
          type: "colorBar",
          options: {
            value__Number: {
              type: "Number",
              name: "value",
              min: 0,
              max: 1,
              values: [],
            },
          },
          attrs: {
            hideValueKey: true,
          },
        },
      ],

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
              name: "value",
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
              name: "value",
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
      desireLineLoading: false,
      showDesireLineLayer: false,
      desireLineColor: "#5470c6",
      desireLineWidth: 10,

      openAccessibilitySetting: false,
      accessibilityLoading: false,
      showAccessibilityLayer: false,
      showAccessibilityVisualMap: false,
      showAccessibilityConfig: false,
      accessibilityConfigForm: {
        opacity: 0.5,
        colorBar: {
          valueKey: "value__String",
          valueType: "String",
          startColor: "#FEE0D2",
          endColor: "#99000D",
          model: "count",
          modelClass: 6,
          data: [
            { min: 0, max: 0, color: "rgb(153, 0, 13)", label: "5 minute", use: true },
            { min: 1, max: 1, color: "rgb(203, 24, 29)", label: "15 minute", use: true },
            { min: 2, max: 2, color: "rgb(239, 59, 44)", label: "30 minute", use: true },
            { min: 3, max: 3, color: "rgb(252, 146, 114)", label: "60 minute", use: true },
            { min: 4, max: 4, color: "rgb(252, 187, 161)", label: "120 minute", use: true },
            { min: 5, max: 5, color: "rgb(254, 224, 210)", label: ">120 minute", use: true },
          ],
        },
      },
      accessibilityConfigLayout: [
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
            value__String: {
              type: "String",
              name: "value",
              map: {
                "5 minute": 0,
                "15 minute": 1,
                "30 minute": 2,
                "60 minute": 3,
                "120 minute": 4,
                ">120 minute": 5,
              },
              min: 0,
              max: 5,
              values: [],
            },
          },
          attrs: {
            hideValueKey: true,
            hideModel: true,
            hideAdd: true,
            hideDelete: true,
            hideColorRamp: true,
          },
        },
      ],
    };
  },
  created() {
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

    this._LinkGeoJSONLayer = new GeoJSONLayer({
      zIndex: 120,
      lineWidth: 10,
      lineStyle: LINE_STYLE.SOLID,
      lineColor: 0xf56c6c,
      lineOpacity: 1,
      lineColorBar: ["#00000000", "#f56c6c"],
      lineValue: "value",
    });

    this._LinkFlowLayer = new LinkFlowLayer({
      zIndex: 230,
      color: 0xff0000,
      height: this.lineFlowConfigForm.height,
      colorBar: this.lineFlowConfigForm.colorBar.data,
      timeRange: this.linkFlowUseTimeRange ? this.linkFlowTimeRange : null,
    });
    this._OriginGridsLayer = new GridsLayer({
      zIndex: 240,
      opacity: this.originConfigForm.opacity,
      colorBar: this.originConfigForm.colorBar.data,
      size: this.originSize,
      timeRange: this.originUseTimeRange ? this.originTimeRange : null,
      event: {
        ["update:values"]: (data) => {
          this.$nextTick(() => {
            const item = this.originConfigLayout.find((item) => item.name === "colorBar");
            const { gridList } = data.target;
            if (this.originUseTimeRange) {
              const values = gridList.map((item) => item.values.reduce((a, b) => a + b, 0));
              item.options.value__Number.values = values;
              item.options.value__Number.min = Math.min(...values);
              item.options.value__Number.max = Math.max(...values);
            } else {
              const values = gridList.map((item) => item.values).flat(2);
              item.options.value__Number.values = values;
              item.options.value__Number.min = Math.min(...values);
              item.options.value__Number.max = Math.max(...values);
            }
            if (this.originConfigForm.colorBar.data.length <= 0) {
              this.$refs.originConfig.handleAutogenerate(item);
              this.$refs.originConfig.handleConfirm();
            }
          });
        },
      },
    });
    this._DestinationsGridsLayer = new GridsLayer({
      zIndex: 240,
      opacity: this.destinationsConfigForm.opacity,
      colorBar: this.destinationsConfigForm.colorBar.data,
      size: this.destinationsSize,
      timeRange: this.destinationsUseTimeRange ? this.destinationsTimeRange : null,
      event: {
        ["update:values"]: (data) => {
          this.$nextTick(() => {
            this.$nextTick(() => {
              const item = this.destinationsConfigLayout.find((item) => item.name === "colorBar");
              const { gridList } = data.target;
              if (this.destinationsUseTimeRange) {
                const values = gridList.map((item) => item.values.reduce((a, b) => a + b, 0));
                item.options.value__Number.values = values;
                item.options.value__Number.min = 0; // Math.min(...values);
                item.options.value__Number.max = Math.max(...values);
              } else {
                const values = gridList.map((item) => item.values).flat(2);
                item.options.value__Number.values = values;
                item.options.value__Number.min = 0; // Math.min(...values);
                item.options.value__Number.max = Math.max(...values);
              }
              if (this.destinationsConfigForm.colorBar.data.length <= 0) {
                this.$refs.destinationsConfig.handleAutogenerate(item);
                this.$refs.destinationsConfig.handleConfirm();
              }
            });
          });
        },
      },
    });
    this._DesireLineLayer = new DesireLineLayer({ zIndex: 560, color: this.desireLineColor, lineWidth: this.desireLineWidth });
    this._AccessibilityLayer = new AccessibilityLayer({ zIndex: 60, colorBar: this.accessibilityConfigForm.colorBar.data, opacity: this.accessibilityConfigForm.opacity });

    this.getLinkList();
    this.handleTimeChange(this.rootVue.time);
  },
  mounted() {},
  beforeDestroy() {
    clearInterval(this._interval);
    this.handleDisable();
    this._SelectGeoJSONLayer.dispose();
    this._LinkGeoJSONLayer.dispose();
    this._LinkFlowLayer.dispose();
    this._OriginGridsLayer.dispose();
    this._DestinationsGridsLayer.dispose();
    this._DesireLineLayer.dispose();
    this._AccessibilityLayer.dispose();
  },
  methods: {
    initByConfig(config) {

      for (const key in config) {
        this[key] = config[key];
      }

      this.selectLinkList = config.selectLinkList || [];
      this.handleSelectLinkList();

      if (config.showHeatMapDialog) {
        this.handleShowHeatMapDialog();
      }
      if (config.showLinkFlowLayer) {
        this.handleShowLinkFlowLayer();
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
      if (config.showAccessibilityLayer) {
        this.handleShowAccessibilityLayer();
      }
      if (config.showAccessibilityLayer) {
        this.handleShowAccessibilityLayer();
      }
      this.handleLineFlowConfigConfirm(config.lineFlowConfigForm);
      this.handleOriginConfigConfirm(config.originConfigForm);
      this.handleDestinationsConfigConfirm(config.destinationsConfigForm);
      this.handleAccessibilityConfigConfirm(config.accessibilityConfigForm);
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
    // *********************** 其他 *********************** //
    handleTimeChange(time) {
      const num = Math.floor(time / 3600);
      if (this._OriginGridsLayer && this._OriginGridsLayer.time !== num) this._OriginGridsLayer.setTime(num);
      if (this._DestinationsGridsLayer && this._DestinationsGridsLayer.time !== num) this._DestinationsGridsLayer.setTime(num);
      if (this._DesireLineLayer && this._DesireLineLayer.time !== num) this._DesireLineLayer.setTime(num);
    },
    handleSetCenter() {
      this._Map.setCenter(this.singlePathDetail.shape[0]);
    },
    initSelectGeoJSONLayer() {},
    initLinkGeoJSONLayer() {},
    handleEnable() {
      if (this.showSelectGeoJSONLayer) this._Map.addLayer(this._SelectGeoJSONLayer);
      if (this.showLinkLayer) this._Map.addLayer(this._LinkGeoJSONLayer);
      if (this.showLinkFlowLayer) this._Map.addLayer(this._LinkFlowLayer);
      if (this.showOriginLayer) this._Map.addLayer(this._OriginGridsLayer);
      if (this.showDestinationsLayer) this._Map.addLayer(this._DestinationsGridsLayer);
      if (this.showDesireLineLayer) this._Map.addLayer(this._DesireLineLayer);
      if (this.showAccessibilityLayer) this._Map.addLayer(this._AccessibilityLayer);

      this.rootVue.$on("timeChange", this.handleTimeChange);
    },
    handleDisable() {
      if (this._SelectGeoJSONLayer) this._SelectGeoJSONLayer.removeFromParent();
      if (this._LinkGeoJSONLayer) this._LinkGeoJSONLayer.removeFromParent();
      if (this._LinkFlowLayer) this._LinkFlowLayer.removeFromParent();
      if (this._OriginGridsLayer) this._OriginGridsLayer.removeFromParent();
      if (this._DestinationsGridsLayer) this._DestinationsGridsLayer.removeFromParent();
      if (this._DesireLineLayer) this._DesireLineLayer.removeFromParent();
      if (this._AccessibilityLayer) this._AccessibilityLayer.removeFromParent();
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
        this.loading = false;
        res.data.forEach((v1) => {
          v1.label = `${v1.name || ""} (${v1.id})`;
          v1.links.forEach((v2) => {
            v2.label = `${v2.id}`;
          });
        });
        this.linkList = res.data;

        const center = this.singlePathDetail.shape[0];
        const lineArray = [];
        let i = 1;
        for (const sgm of this.linkList) {
          for (const link of sgm.links) {
            lineArray.push(7, ++i, link.fromCoord.x - center[0], link.fromCoord.y - center[1], 0, link.toCoord.x - center[0], link.toCoord.y - center[1], link.length);
          }
        }

        this._LinkGeoJSONLayer.setCenter(center);
        this._LinkGeoJSONLayer.setLineArray(lineArray);

        this.selectLinkList = this.linkList.map((v1) => v1.links.map((v2) => v2.id)).flat(2);
        this.handleSelectLinkList();

        if (this.config) {
          this.initByConfig(this.config);
        }
      });
    },
    handleLinkTreeChange() {
      const nodes = this.$refs.linkTree.getCheckedNodes(true);
      this.selectLinkList = nodes.map((v) => v.id);
      this.handleSelectLinkList();
    },
    handleSelectLinkList() {
      const propertiesList = [{}];
      for (const sgm of this.linkList) {
        for (const link of sgm.links) {
          propertiesList.push({ value: this.selectLinkList.includes(link.id) ? 1 : 0 });
        }
      }
      this._LinkGeoJSONLayer.setPropertiesList(propertiesList, { value: { min: 0, max: 1 } });
    },

    // *********************** 热力图 *********************** //
    async handleShowHeatMapDialog() {
      try {
        this.heatMapDataLoading = true;
        this.heatMapData = null;
        const res = await hotMapTRG({ linkIds: this.selectLinkList, allTracks: true });
        this.heatMapData = res.data.vc;
        this.showHeatMapDialog = true;
      } catch (error) {
      } finally {
        this.heatMapDataLoading = false;
      }
    },

    // *********************** 周边流量 *********************** //
    async handleGetLinkFlow() {
      try {
        this.linkFlowLoading = true;
        this._LinkFlowLayer.setData(null);
        const res = await getLinkTracksTRG({ linkIds: this.selectLinkList, allTracks: this.showLinkFlowAllTracks, startEndOnLink: this.showLinkFlowAllArea });
        this._LinkFlowLayer.setData(res.data);
      } catch (error) {
      } finally {
        this.linkFlowLoading = false;
      }
    },
    async handleShowLinkFlowLayer() {
      try {
        await this.handleGetLinkFlow();
        this.showLinkFlowLayer = true;
      } catch (error) {}
    },

    handleLineFlowConfigConfirm(data) {
      this.lineFlowConfigForm = data;
      const { colorBar, height } = data;
      this._LinkFlowLayer.setColorBar(colorBar.data);
      this._LinkFlowLayer.setHeight(height);
      this.showLineFlowConfig = false;
    },

    // *********************** 起点分布 *********************** //
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
    handleOriginConfigConfirm(data) {
      this.originConfigForm = data;
      const { colorBar, opacity } = data;
      this._OriginGridsLayer.setOpacity(opacity);
      this._OriginGridsLayer.setColorBar(colorBar.data);
      this.showOriginConfig = false;
    },
    // *********************** 讫点分布 *********************** //
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
    handleDestinationsConfigConfirm(data) {
      this.destinationsConfigForm = data;
      const { colorBar, opacity } = data;
      this._DestinationsGridsLayer.setOpacity(opacity);
      this._DestinationsGridsLayer.setColorBar(colorBar.data);
      this.showDestinationsConfig = false;
    },
    // *********************** 期望线 *********************** //
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

    // *********************** 可达性分析 *********************** //
    async handleShowAccessibilityLayer() {
      try {
        this.accessibilityLoading = true;
        const res = await accessibilityTRG({
          xyarr: this.singlePathDetail.shape,
          holes: this.singlePathDetail.holes,
        });
        this._AccessibilityLayer.setData(res.data);
        // const data = require("./data.json");
        // this._AccessibilityLayer.setData(data);
        this.showAccessibilityLayer = true;
      } catch (error) {
        console.log(error);
      } finally {
        this.accessibilityLoading = false;
      }
    },
    handleAccessibilityConfigConfirm(data) {
      this.accessibilityConfigForm = data;
      const { colorBar, opacity } = data;
      this._AccessibilityLayer.setOpacity(opacity);
      this._AccessibilityLayer.setColorBar(colorBar.data);
      this.showAccessibilityConfig = false;
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
