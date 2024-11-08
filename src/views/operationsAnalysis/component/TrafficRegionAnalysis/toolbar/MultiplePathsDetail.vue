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
                  <el-checkbox v-for="(item, index) in multiplePathsDetail.polygonList" :key="index" :label="index">polygon{{ index }}</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>
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
            <el-button class="show_btn" type="primary" size="small" @click="">{{ $l("显示期望线") }}</el-button>
            <el-button class="open_btn" :icon="openDesireLineSetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openDesireLineSetting = !openDesireLineSetting"></el-button>
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

import { GeoJSONLayer, LINE_STYPE } from "../../GeoJSON/layer/GeoJSONLayer";
import { GridsLayer } from "../layer/GridsLayer";

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
  },
  computed: {
    _Map() {
      return this.rootVue._Map;
    },
    selectAll: {
      get() {
        return this.multiplePathsDetail.polygonList.length == this.selectPolygonList.length;
      },
      set(val) {
        if (val) {
          this.selectPolygonList = new Array(this.multiplePathsDetail.polygonList.length).fill(0).map((v, i) => i);
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
    originSize: {
      handler(val) {
        this._OriginGridsLayer.setSize(val / GRID_STEP);
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
        this._DestinationsGridsLayer.setSize(val / GRID_STEP);
      },
    },
  },
  data() {
    return {
      COLOR_LIST,
      GRID_STEP,
      loading: false,

      showSelectGeoJSONLayer: true,
      selectPolygonList: [],
      openPolygonList: false,

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

      openReachabilitySetting: false,
    };
  },
  created() {
    this.initData();
    this.initSelectGeoJSONLayer();

    this._OriginGridsLayer = new GeoJSONLayer({ zIndex: 140, polygonColorBar: this.COLOR_LIST[this.originColor] });
    this._OriginGridsLayer.setCenter(this._center);
    this._OriginGridsLayer.setPolygonArray(this._polygonArray);

    this._DestinationsGridsLayer = new GeoJSONLayer({ zIndex: 140, polygonColorBar: this.COLOR_LIST[this.destinationsColor] });
    this._DestinationsGridsLayer.setCenter(this._center);
    this._DestinationsGridsLayer.setPolygonArray(this._polygonArray);
  },
  mounted() {},
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    handleSetCenter() {
      this._Map.setCenter(this._center);
    },
    initData() {
      let center = null;
      const polygonList = this.multiplePathsDetail.polygonList;
      const polygonArray = [];
      for (let i1 = 0, l1 = polygonList.length; i1 < l1; i1++) {
        const { shape, holes } = polygonList[i1];
        if (!center) center = shape[0];
        const array = [0, i1 + 1];
        array[array.length] = shape.length * 2;
        for (const point of shape) {
          array[array.length] = point[0] - center[0];
          array[array.length] = point[1] - center[1];
        }
        for (const hole of holes) {
          array[array.length] = hole.length * 2;
          for (const point of hole) {
            array[array.length] = point[0] - center[0];
            array[array.length] = point[1] - center[1];
          }
        }
        array[0] = array.length - 1;
        polygonArray.push(...array);
      }
      this._center = center;
      this._polygonArray = polygonArray;
      this.selectPolygonList = new Array(this.multiplePathsDetail.polygonList.length).fill(0).map((v, i) => i);
    },
    initSelectGeoJSONLayer() {
      this._SelectGeoJSONLayer = new GeoJSONLayer({
        zIndex: 110,
        polygonColor: 0x409eff,
        polygonOpacity: 0.5,
        polygonBorderWidth: 1,
        polygonBorderColor: 0x409eff,
        polygonBorderStyle: LINE_STYPE.SOLID,

        polygonColorBar: ["#00000000", "#409eff"],
        polygonValue: "value",
      });
      this._SelectGeoJSONLayer.setCenter(this._center);
      this._SelectGeoJSONLayer.setPolygonArray(this._polygonArray);
      this.handleSelectPolygonList();
    },
    handleSelectPolygonList() {
      const propertiesList = new Array(this.multiplePathsDetail.polygonList.length + 1).fill(0).map((v, i) => (i == 0 ? {} : { value: 0 }));
      this.selectPolygonList.forEach((v) => (propertiesList[v + 1].value = 1));
      this._SelectGeoJSONLayer.setPropertiesList(propertiesList, { value: { min: 0, max: 1 } });
    },
    handleEnable() {
      if (this.showSelectGeoJSONLayer) this._Map.addLayer(this._SelectGeoJSONLayer);
      if (this.showOriginLayer) this._Map.addLayer(this._OriginGridsLayer);
      if (this.showDestinationsLayer) this._Map.addLayer(this._DestinationsGridsLayer);
    },
    handleDisable() {
      this._Map.removeLayer(this._SelectGeoJSONLayer);
      this._Map.removeLayer(this._OriginGridsLayer);
      this._Map.removeLayer(this._DestinationsGridsLayer);
    },
    async handleShowOriginLayer() {
      try {
        this.originLoading = true;
        this._OriginGridsLayer.setData(null);
        const res = await polygonOriginGridsTRG({
          polygons: this.multiplePathsDetail.polygonList,
        });
        // const propertiesList = [{}];
        // const keys = Object.keys(res.data);
        // for (let i = 0, l = Object.values(res.data)[0].length; i < l; i++) {
        //   const obj = {};
        //   for (const key of keys) {
        //     obj[key] = res.data[key][i];
        //   }
        //   propertiesList.push(obj);
        // }
        // this._OriginGridsLayer.setPropertiesList(propertiesList, { value: { min: 0, max: 1 } });
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
        const res = await polygonDestinationsGridsTRG({
          polygons: this.multiplePathsDetail.polygonList,
        });
        this.showDestinationsLayer = true;
      } catch (error) {
        console.log(error);
      } finally {
        this.destinationsLoading = false;
      }
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
