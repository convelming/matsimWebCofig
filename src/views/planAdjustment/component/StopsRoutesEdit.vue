<template>
  <Dialog
    width="450px"
    :title="$l('路径编辑')"
    :visible="show"
    @close="
      handleDisable();
      $emit('close');
    "
  >
    <div class="StopsRoutesEdit">
      <el-form :model="stopsRouteForm" ref="stopsRouteForm" :inline="false" size="small" label-width="100px" label-position="left">
        <el-form-item label-width="0">
          <el-select v-model="stopsRouteId" @change="handleChangestopsRouteId" :disabled="!!stopsRouteId" :placeholder="$l('请选择路段')">
            <el-option v-for="item in stopsRoutesOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button style="margin-left: 20px" type="warning" icon="el-icon-refresh" @click="handleReselectStopsRoute">{{ $l("重选") }}</el-button>
          <el-button type="primary" @click="$emit('toEditStops')">{{ $l("编辑站点") }}</el-button>
        </el-form-item>
        <template v-if="stopsRouteForm">
          <el-form-item :label="$l('出发站点：')">
            {{ stopsRouteForm.startStop.name }} &nbsp;&nbsp;
            <div class="address_btn el-icon-aim" @click="handleChangeCenter('start')" />
          </el-form-item>
          <el-form-item :label="$l('到达站点：')">
            {{ stopsRouteForm.endStop.name }} &nbsp;&nbsp;
            <div class="address_btn el-icon-aim" @click="handleChangeCenter('end')" />
          </el-form-item>
          <el-form-item :label="$l('编辑方式：')">
            <el-select v-model="stopsRouteEditType" disabled>
              <el-option :label="$l('按点选择')" :value="1" />
              <el-option :label="$l('按路段选择')" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="stopsRouteEditType == 1"> </el-form-item>
          <template v-if="stopsRouteEditType == 2">
            <el-form-item :label="$l('路段线宽：')">
              <el-slider class="lineWidth" :min="1" v-model="lineWidth" @change="handleChangeLineWidth" />
            </el-form-item>
            <el-form-item :label="$l('路段偏移：')">
              <el-slider class="lineOffset" v-model="lineOffset" @change="handleChangeLineOffset" />
            </el-form-item>
            <el-form-item :label="$l('必经路段：')" />
            <el-form-item label-width="0">
              <el-table height="200px" :data="stopsRouteForm.middleLink" border stripe>
                <el-table-column prop="id" :label="$l('Id')" />
                <el-table-column prop="fromCoord" :label="$l('起点')">
                  <template slot-scope="{ row }">{{ row.fromCoord && `${row.fromCoord.lng},${row.fromCoord.lat}` }}</template>
                </el-table-column>
                <el-table-column prop="toCoord" :label="$l('终点')">
                  <template slot-scope="{ row }">{{ row.toCoord && `${row.toCoord.lng},${row.toCoord.lat}` }}</template>
                </el-table-column>
                <el-table-column prop="length">
                  <template slot-scope="{ row }"> <el-button type="text" icon="el-icon-delete" @click="handleRemoveMiddleLink(row)"></el-button></template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </template>
          <el-form-item>
            <el-button type="warning" @click="handleCalcRouteAccessible">{{ $l("检查站点间线段连续性") }}</el-button>
            <el-button type="primary" @click="handleSaveStopsRoute" :disabled="!canSaveStopsRoute">{{ $l("保存站点路径") }}</el-button>
          </el-form-item>
        </template>
      </el-form>
    </div>
  </Dialog>
</template>

<language>
{
  "路径编辑": {
    "zh-CN":"路径编辑",
    "en-US":"Path edit"
  },
  "请选择路段": {
    "zh-CN":"请选择路段",
    "en-US":"Please select a road section"
  },
  "重选": {
    "zh-CN":"重选",
    "en-US":"reelect"
  },
  "编辑站点": {
    "zh-CN":"编辑站点",
    "en-US":"Edit stop"
  },
  "出发站点：": {
    "zh-CN":"出发站点：",
    "en-US":"Departure stop："
  },
  "到达站点：": {
    "zh-CN":"到达站点：",
    "en-US":"Arrival stop："
  },
  "编辑方式：": {
    "zh-CN":"编辑方式：",
    "en-US":"Edit style："
  },
  "按点选择": {
    "zh-CN":"按点选择",
    "en-US":"tap select"
  },
  "按路段选择": {
    "zh-CN":"按路段选择",
    "en-US":"Select by roadway"
  },
  "路段线宽：": {
    "zh-CN":"路段线宽：",
    "en-US":"section line width："
  },
  "路段偏移：": {
    "zh-CN":"路段偏移：",
    "en-US":"section offset："
  },
  "必经路段：": {
    "zh-CN":"必经路段：",
    "en-US":"mandatory section："
  },
  "Id": {
    "zh-CN":"Id",
    "en-US":"Id"
  },
  "起点": {
    "zh-CN":"起点",
    "en-US":"starting point"
  },
  "终点": {
    "zh-CN":"终点",
    "en-US":"ending point"
  },
  "检查站点间线段连续性": {
    "zh-CN":"检查站点间线段连续性",
    "en-US":"Check line continuity between sites"
  },
  "当前站点间线段不是连续的": {
    "zh-CN":"当前站点间线段不是连续的",
    "en-US":"Line segments are not continuous between current stations"
  },
  "保存站点路径": {
    "zh-CN":"保存站点路径",
    "en-US":"Save site path"
  },
  "保存成功": {
    "zh-CN":"保存成功",
    "en-US":"Save Success"
  },
}
</language>

<script>
import { MAP_EVENT } from "@/mymap/index";
import * as Bean from "@/utils/Bean";
import StopsRoutesSelect from "./StopsRoutesSelect.vue";
import { computeRoute, calcRouteAccessible } from "@/api";

import { BusLinkLayer } from "../layer/BusLinkLayer";
import { BusStopLayer } from "../layer/BusStopLayer";
import { StopsLayer } from "../layer/StopsLayer";
import { NetworkLayer } from "../layer/NetworkLayer";
import { NetworkLineLayer } from "../layer/NetworkLineLayer";
import { BusRouteLinkLayer } from "../layer/BusRouteLinkLayer";

export default {
  components: { StopsRoutesSelect },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    transitRouteJSON: {
      type: Object,
      default: () => new Bean.TransitRoute().toJSON(),
    },
  },
  inject: ["rootVue"],
  data() {
    return {
      stopsRouteId: null,
      stopsRouteForm: null,
      canSaveStopsRoute: false,
      stopsRouteEditType: 2,
      lineOffset: 10,
      lineWidth: 12,

      transitRoute: new Bean.TransitRoute(),
    };
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
          }, 500);
        });
      },
      immediate: true,
    },
  },
  computed: {
    _Map() {
      return this.rootVue._map;
    },
    stopsRoutesOptions() {
      return this.transitRoute.getStopsRouteOptions();
    },
  },
  created() {
    this._linkLayer = new BusLinkLayer({
      zIndex: 7,
      color: 0xf56c6c,
      visible: true,
    });
    this._stopLayer = new BusStopLayer({
      zIndex: 10,
      color: 0x67c23a,
      highStopColor: 0xe6a23c,
      visible: true,
    });
    this._editLayer = new BusRouteLinkLayer({
      zIndex: 11,
      linkColor: 0xf56c6c,
      stopColor: 0x67c23a,
      middleLinkColor: 0xffffff,
      visible: false,
    });
    this._networkLayer = new NetworkLayer({
      zIndex: 3,
      color: 0x409eff,
      visible: false,
    });
    this._networkLineLayer = new NetworkLineLayer({
      zIndex: 4,
      color: 0x67c23a,
      visible: false,
    });
  },
  mounted() {},
  beforeDestroy() {
    this.handleDisable();

    this._editLayer && this._editLayer.dispose();
    this._linkLayer && this._linkLayer.dispose();
    this._stopLayer && this._stopLayer.dispose();
    this._networkLayer && this._networkLayer.dispose();
    this._networkLayer && this._networkLayer.dispose();
  },
  methods: {
    handleEnable() {
      this.transitRoute = new Bean.TransitRoute(this.transitRouteJSON);
      this._linkLayer.setData(this.transitRoute);
      this._linkLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (res) => {
        let key = this.transitRoute.getStopsRouteKeyByLink(res.data.id);
        if (key) {
          this.stopsRouteId = key;
          this.handleChangestopsRouteId(key);
        }
      });

      this._stopLayer.setData(this.transitRoute);
      this._stopLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (res) => {
        const stop = new Bean.Stops(res.data);
        let key = this.transitRoute.getStopsRouteKeyByStops(stop);
        if (key) {
          this.stopsRouteId = key;
          this.handleChangestopsRouteId(key);
        }
      });

      this._Map.addLayer(this._editLayer);
      this._Map.addLayer(this._linkLayer);
      this._Map.addLayer(this._stopLayer);
      this._Map.addLayer(this._networkLayer);
      this._Map.addLayer(this._networkLineLayer);
    },
    handleDisable() {
      this.canSaveStopsRoute = false;
      this.stopsRouteId = null;
      this.stopsRouteForm = null;
      this._linkLayer.show();
      this._stopLayer.show();
      this._editLayer.hide();
      this._networkLayer.hide();
      this._networkLineLayer.hide();

      this._editLayer.removeEventListener();
      this._linkLayer.removeEventListener();
      this._stopLayer.removeEventListener();
      this._networkLayer.removeEventListener();
      this._networkLayer.removeEventListener();

      this._Map.removeLayer(this._editLayer);
      this._Map.removeLayer(this._linkLayer);
      this._Map.removeLayer(this._stopLayer);
      this._Map.removeLayer(this._networkLayer);
      this._Map.removeLayer(this._networkLineLayer);
    },
    handleChangeLineWidth() {
      if (this._networkLayer) {
        this._networkLayer.setValues({
          lineWidth: this.lineWidth,
        });
      }
      if (this._networkLineLayer) {
        this._networkLineLayer.setValues({
          lineWidth: this.lineWidth,
        });
      }
    },
    handleChangeLineOffset() {
      if (this._networkLayer) {
        this._networkLayer.setValues({
          lineOffset: this.lineOffset,
        });
      }
      if (this._networkLineLayer) {
        this._networkLineLayer.setValues({
          lineOffset: this.lineOffset,
        });
      }
    },
    handleChangeCenter() {
      const startPoint = this.stopsRouteForm.startStop.coord;
      const endPoint = this.stopsRouteForm.endStop.coord;
      let list = [startPoint.toList(), endPoint.toList()];
      const res2 = this.rootVue._map.getFitZoomAndCenterPoints(list);
      this.rootVue.handleCenterAndZoom({
        center: res2.center,
        zoom: res2.zoom,
      });
    },
    handleReselectStopsRoute() {
      this.canSaveStopsRoute = false;
      this.stopsRouteId = null;
      this.stopsRouteForm = null;
      if (this._linkLayer) {
        this._linkLayer.setData(this.transitRoute);
        this._linkLayer.show();
      }
      if (this._stopLayer) {
        this._stopLayer.setData(this.transitRoute);
        this._stopLayer.show();
      }

      if (this._editLayer) {
        this._editLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
        this._editLayer.hide();
      }
      if (this._networkLayer) {
        this._networkLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
        this._networkLayer.hide();
      }
      if (this._networkLineLayer) {
        this._networkLineLayer.removeEventListener(MAP_EVENT.HANDLE_PICK_LEFT);
        this._networkLineLayer.hide();
      }
      this.rootVue.setFitZoomAndCenterByTransitRoute(this.transitRoute);
    },
    handleChangestopsRouteId(val) {
      this.canSaveStopsRoute = false;
      let stopsRouteForm = this.transitRoute.getStopsRoute(val);
      this.stopsRouteForm = new Bean.StopsRouteItem(stopsRouteForm.toJSON());
      this.handleChangeCenter();
      if (this.stopsRouteForm.route.length == 0) {
        this.handleComputeRoute();
      }
      this.$nextTick(() => {
        if (this._linkLayer) this._linkLayer.hide();
        if (this._stopLayer) this._stopLayer.hide();
        if (this._editLayer) {
          this._editLayer.setData(this.stopsRouteForm);
          this._editLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (res) => {
            this.handleRemoveMiddleLink(res.data);
          });
          this._editLayer.show();
        }
        if (this._networkLayer) {
          this._networkLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (res) => {
            this._networkLineLayer.setData(res.data.id);
          });
          this._networkLayer.show();
        }
        if (this._networkLineLayer) {
          this._networkLineLayer.addEventListener(MAP_EVENT.HANDLE_PICK_LEFT, (res) => {
            this.handleAddMiddleLink(res.data);
            this._networkLineLayer.setData();
          });
          this._networkLineLayer.show();
        }
      });
    },
    handleRemoveMiddleLink(link) {
      this.canSaveStopsRoute = false;
      this.stopsRouteForm.removeMiddleLink(link);
      this.handleComputeRoute();
    },
    handleAddMiddleLink(link) {
      this.canSaveStopsRoute = false;
      this.stopsRouteForm.addMiddleLink(link);
      this.handleComputeRoute();
    },
    handleComputeRoute() {
      let params = {
        startLinkId: this.stopsRouteForm.startStop.linkId,
        endLinkId: this.stopsRouteForm.endStop.linkId,
        middleLinkId: this.stopsRouteForm.middleLink.map((v) => v.id),
      };
      computeRoute(params).then((res) => {
        this.stopsRouteForm.setRoute(res.data);
        if (this._editLayer) this._editLayer.setData(this.stopsRouteForm);
      });
    },
    handleCalcRouteAccessible() {
      let params = this.stopsRouteForm.route.map((v) => v.id);
      calcRouteAccessible(params).then((res) => {
        this.canSaveStopsRoute = !!res.data;
        if (!res.data) {
          this.$message.error(this.$l("当前站点间线段不是连续的"));
        }
      });
    },
    handleSaveStopsRoute() {
      this.transitRoute.changeStopsRoute(this.stopsRouteForm);
      this.$emit("change", this.transitRoute.toJSON());
      this.$message.success(this.$l("保存成功"));
      this.handleReselectStopsRoute();
    },
  },
};
</script>

<style lang="scss" scoped>
.StopsRoutesEdit {
  .address_btn {
    cursor: pointer;
    float: right;
    line-height: 32px;
    color: #409eff;
  }
}
</style>
