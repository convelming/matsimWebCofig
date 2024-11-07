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
            <el-button v-if="!showLinkLayer" class="show_btn" type="primary" size="small" @click="showLinkLayer = true">{{ $l("显示Link") }}</el-button>
            <el-button v-else class="show_btn" type="info" size="small" @click="showLinkLayer = false">{{ $l("隐藏Link") }}</el-button>
            <el-button class="open_btn" :icon="openLinkList ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openLinkList = !openLinkList"></el-button>
          </div>
          <div class="link_list" v-if="openLinkList">
            <el-checkbox-group v-model="selectLinkList" @change="handleSelectLinkList">
              <el-checkbox v-for="item in linkList" :key="item.id" :label="item.id">{{ item.id }}</el-checkbox>
            </el-checkbox-group>
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
            <el-button class="show_btn" type="primary" size="small" @click="">{{ $l("显示期望线") }}</el-button>
            <el-button class="open_btn" :icon="openDesireLineSetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openDesireLineSetting = !openDesireLineSetting"></el-button>
          </div>
        </div>
        <div class="form_item">
          <div class="form_item_header">
            <el-button class="show_btn" type="primary" size="small" @click="">{{ $l("显示可达性分析") }}</el-button>
            <el-button class="open_btn" :icon="openReachabilitySetting ? 'el-icon-caret-top' : 'el-icon-caret-bottom'" type="info" size="small" @click="openReachabilitySetting = !openReachabilitySetting"></el-button>
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
}
</language>

<script>
import { guid, COLOR_LIST } from "@/utils/utils";
import { getLinkListTRG, getLinkTracksTRG, getOriginGridsTRG, getDestinationsGridsTRG } from "@/api/index";

import HeatMapDialog from "../components/HeatMapDialog.vue";

import { GeoJSONLayer, LINE_STYPE } from "../../GeoJSON/layer/GeoJSONLayer";
import { LinkFlowLayer } from "../layer/LinkFlowLayer";
import { GridsLayer } from "../layer/GridsLayer";

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
      loading: true,

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

      openReachabilitySetting: false,
    };
  },
  created() {
    this.initSelectGeoJSONLayer();
    this.initLinkGeoJSONLayer();
    this.getLinkList();

    this._LinkFlowLayer1 = new LinkFlowLayer({ zIndex: 130, color: 0xff0000, height: this.linkFlowHeight, colorBar: this.COLOR_LIST[this.linkFlowColor] });
    this._LinkFlowLayer2 = new LinkFlowLayer({ zIndex: 130, color: 0xff0000, height: this.linkFlowHeight, colorBar: this.COLOR_LIST[this.linkFlowColor] });
    this._OriginGridsLayer = new GridsLayer({ zIndex: 140, colorBar: this.COLOR_LIST[this.originColor], size: this.originSize / GRID_STEP, step: GRID_STEP });
    this._DestinationsGridsLayer = new GridsLayer({ zIndex: 140, colorBar: this.COLOR_LIST[this.destinationsColor], size: this.destinationsSize / GRID_STEP, step: GRID_STEP });
  },
  mounted() {},
  beforeDestroy() {
    this.handleDisable();
  },
  methods: {
    initSelectGeoJSONLayer() {
      this._SelectGeoJSONLayer = new GeoJSONLayer({
        zIndex: 110,
        polygonColor: 0x409eff,
        polygonOpacity: 0.5,
        polygonBorderWidth: 1,
        polygonBorderColor: 0x409eff,
        polygonBorderStyle: LINE_STYPE.SOLID,
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
        lineStyle: LINE_STYPE.SOLID,
        lineColor: 0xf56c6c,
        lineOpacity: 1,
        lineColorBar: ["#00000000", "#f56c6c"],
        lineValue: "value",
      });
    },
    handleEnable() {
      this._Map.addLayer(this._SelectGeoJSONLayer);
      if (this.showLinkLayer) this._Map.addLayer(this._LinkGeoJSONLayer);
      if (this.showOriginLayer) this._Map.addLayer(this._OriginGridsLayer);
      if (this.showDestinationsLayer) this._Map.addLayer(this._DestinationsGridsLayer);
      this._handleShowLinkFlowLayer();
    },
    handleDisable() {
      this._Map.removeLayer(this._SelectGeoJSONLayer);
      this._Map.removeLayer(this._LinkGeoJSONLayer);
      this._Map.removeLayer(this._OriginGridsLayer);
      this._Map.removeLayer(this._DestinationsGridsLayer);
      this._Map.removeLayer(this._LinkFlowLayer1);
      this._Map.removeLayer(this._LinkFlowLayer2);
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
        let i = 0;
        for (const link of this.linkList) {
          lineArray.push(7, ++i, link.fromCoord.x - center[0], link.fromCoord.y - center[1], 0, link.toCoord.x - center[0], link.toCoord.y - center[1], link.length);
        }

        this._LinkGeoJSONLayer.setCenter(center);
        this._LinkGeoJSONLayer.setLineArray(lineArray);

        this.handleSelectLinkList();
      });
    },
    handleSelectLinkList() {
      const propertiesList = [];
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
